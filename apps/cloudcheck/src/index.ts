import express = require("express");
import { createActionHandler, registerAction } from "actions/ActionFactory";
import { ConditionalTextAction } from "actions/ConditionalTextAction";
import { DatabaseAction } from "actions/DatabaseAction";
import { ExecuteVMCodeAction } from "actions/ExecuteVMCodeAction";
import { GitAction } from "actions/GitAction";
import { RunCodeAction } from "actions/RunCodeAction";
import { UnitTestAction } from "actions/UnitTestAction";
import { WebhookAction } from "actions/WebhookAction";
import {
    CloudcheckActionResponse,
    CloudcheckActionType,
    CloudcheckRequestBody,
    ExitCode,
    generateId,
    PipelineStepOptions,
} from "core";
import "dotenv/config";

import { executeVMCode } from "helpers/executeVMCode";
import { log } from "helpers/logger";
import { runCommand } from "helpers/runCommand";
import bodyParser = require("body-parser");

// whether files should be removed from dist folder
const cleanup = true;

const app: express.Express = express();

export interface PipelineStepExtraOptions extends PipelineStepOptions {
    log?: string[];
    exitCode?: number;
    localPath?: string;
    gitCacheCreationDateTime?: number;
}

function setupActions() {
    registerAction(CloudcheckActionType.run_code, RunCodeAction);
    registerAction(
        CloudcheckActionType.conditional_text,
        ConditionalTextAction
    );
    registerAction(CloudcheckActionType.git, GitAction);
    registerAction(CloudcheckActionType.database, DatabaseAction);
    registerAction(CloudcheckActionType.unit_test, UnitTestAction);
    registerAction(CloudcheckActionType.webhook, WebhookAction);
    registerAction(CloudcheckActionType.executeVMCode, ExecuteVMCodeAction);
}

function setupTestWebhookUrl() {
    app.post("/webhook_test", (request, response, next) => {
        const data = request.body;
        const feedback = request.query.feedback
            ? (request.query.feedback as string).split(",")
            : ["webhook_test_success"];
        for (const feedbackItem of feedback) {
            data[feedbackItem] = true;
        }
        response.status(200).send(data);
    });
}

const cloudcheck = async (req: express.Request, res: express.Response) => {
    let { data, pipeline }: CloudcheckRequestBody = req.body;

    if (!data || !pipeline) {
        res.status(400).send("Missing request body.");
        return;
    }

    // generate a unique request id
    const requestId = generateId({
        length: 24,
        allowed: ["lowercaseLetters", "numbers"],
    });

    const startTime = Date.now();
    log.debug(`Cloud check request id: ${requestId}.`);

    let pipelineLog: string[] = data.log || [];
    let pipelineExitCode: number = ExitCode.NoError;

    log.debug(
        `Creating action handlers for pipeline with requestId ${requestId}.`
    );
    const actionHandlers = pipeline.map((pipelineStep) =>
        createActionHandler(pipelineStep)
    );
    log.debug(
        `Setting up action handlers for pipeline with requestId ${requestId}.`
    );
    await Promise.all(
        actionHandlers.map((handler) =>
            (async () => {
                const setupResult = await handler.setup();
                pipelineLog.push(...setupResult.log);
                pipelineExitCode = Math.max(pipelineExitCode, setupResult.code);
            })()
        )
    );
    log.debug(`Running actions for pipeline with requestId ${requestId}.`);

    for (const handler of actionHandlers) {
        log.debug(`Starting action [${handler.actionType}].`);

        pipelineLog.push(`*** Starting action [${handler.actionType}]. ***`);
        // verify whether the condition holds
        try {
            if (
                !(await handler.evaluateCondition(data, requestId)) &&
                !handler.runAlways
            ) {
                continue;
            }
        } catch (error) {
            pipelineLog.push(error.toString());
            pipelineLog.push(
                `Unable to evaluate condition [${handler.actionOptions.condition}].`
            );
            pipelineExitCode = ExitCode.InternalError;

            log.debug(
                `Unable to evaluate condition [${handler.actionOptions.condition}].`,
                error
            );
            break;
        }

        if (
            handler.computedCondition &&
            handler.actionOptions.scoreExpression
        ) {
            const result = await executeVMCode({
                code: handler.actionOptions.scoreExpression,
                sandbox: { score: data.score },
                expression: true,
            });
            data.score = result.result;
        }

        let actionResult: CloudcheckActionResponse = {
            data,
            log: pipelineLog,
            code: pipelineExitCode,
        };
        try {
            // run the action
            actionResult = await handler.run(
                data,
                requestId,
                handler.actionOptions.languageData || {}
            );
            pipelineLog.push(...actionResult.log);
            pipelineExitCode = Math.max(pipelineExitCode, actionResult.code);
        } catch (error) {
            pipelineLog.push(error.toString());
            pipelineExitCode = ExitCode.InternalError;
            log.error(error);
            break;
        }

        data = actionResult.data;

        pipelineLog.push(`*** Finished action [${handler.actionType}]. ***`);

        log.debug(`Finished action [${handler.actionType}].`);

        // stop if a 'stop' field is set to true of if the stop on match option was set
        if (
            data.stop === true ||
            (handler.computedCondition && handler.actionOptions.stopOnMatch)
        ) {
            break;
        }
    }
    log.debug(`Tearing down actions for pipeline with requestId ${requestId}.`);

    await Promise.all(
        actionHandlers.map((handler) =>
            (async () => {
                const tearDownResult = await handler.tearDown();
                pipelineLog.push(...tearDownResult.log);
                pipelineExitCode = Math.max(
                    pipelineExitCode,
                    tearDownResult.code
                );
            })()
        )
    );
    // cleanup
    if (cleanup) {
        await runCommand(`rm -rf ${requestId}*`);
    }
    // send back the data
    const diff = Date.now() - startTime;
    log.debug(`Completed cloud compile request: ${requestId} [${diff}ms].`);
    res.status(200).send({
        data,
        log: pipelineLog.map((entry) => entry.trim()),
        code: pipelineExitCode,
    });
};

(async function bootstrap() {
    // parse body of requests as JSON
    app.use(bodyParser.json());

    setupActions();
    setupTestWebhookUrl();

    app.get("/", (_req, res) => res.send("Cloud check server is running."));

    // route definition
    app.post("/", cloudcheck);

    // start the server
    const port = Number(process.env.PORT) || 2700;
    const server = app.listen(port, () => {
        log.debug("Cloud check server listening on port", port);
    });

    // graceful shutdown of http server
    const gracefulShutdown = () => {
        server.close(() => {
            log.debug("Cloud check server server closed.");
        });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
})();
