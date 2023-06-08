import {
    CloudcheckActionResponse,
    ExitCode,
    ProgrammingLanguage,
    supportedLanguagesUnitTesting,
} from "core";
import { createPlayground } from "helpers/createPlayground";
import { log } from "helpers/logger";
import { runScript } from "helpers/runScript";
import { ActionHandler } from "./ActionFactory";
import fs = require("fs");
import Handlebars = require("handlebars");

export class UnitTestAction extends ActionHandler {
    public async run(
        data: any,
        requestId: string,
        languageData: any
    ): Promise<CloudcheckActionResponse> {
        const {
            answerEmbedding = "{{answer}}",
            imports = "",
            hideFeedback,
            tests = [],
            localPath,
        } = this.actionOptions;
        const programmingLanguage: ProgrammingLanguage =
            data?.question?.programmingLanguage;

        let exitCode = ExitCode.NoError;
        let exitLog = [];

        if (!programmingLanguage) {
            log.error(
                `Aborting unit test action because of missing programming language. Action: ${JSON.stringify(
                    this.actionOptions
                )}. Data: ${JSON.stringify(data)}.`
            );
            return { data, log: [], code: ExitCode.NoError };
        }
        if (supportedLanguagesUnitTesting.indexOf(programmingLanguage) < 0) {
            log.notice(
                `Aborting unit test action because programming language "${programmingLanguage}" is not supported. Action: ${JSON.stringify(
                    this.actionOptions
                )}. Data: ${JSON.stringify(data)}.`
            );
            return { data, log: [], code: ExitCode.NoError };
        }

        // create the embedded answer
        const replaceFunc = Handlebars.compile(answerEmbedding, {
            noEscape: true,
        });
        data.embeddedAnswer = replaceFunc(data);

        // insert the imports
        data.imports = imports.split("\n");

        // append the tests
        data.tests = tests;

        await createPlayground({
            localPath,
            requestId,
            log: exitLog,
        });

        if (fs.existsSync(`./${requestId}/${localPath}/run.sh`)) {
            // write the qf object to a file in the directory
            fs.writeFileSync(
                `./${requestId}/${localPath}/qf.json`,
                JSON.stringify(data || {})
            );

            // run git, with the data in the qf object as environment variables
            log.debug(
                `[${requestId}] Running unit test run script at path ${localPath}...`
            );

            exitCode = await runScript({
                script: "./run.sh",
                cwd: `./${requestId}/${localPath}`,
                log: exitLog,
                env: Object.assign({}, data || {}, process.env),
            });
        } else {
            // there is no run script present
            throw new Error("Unable to run unit test.");
        }

        let resultData: any = {};

        if (fs.existsSync(`./${requestId}/${localPath}/qf.json`)) {
            // read the updated quarterfall object
            const quarterfallUpdated = fs.readFileSync(
                `./${requestId}/${localPath}/qf.json`
            );
            try {
                resultData = JSON.parse(quarterfallUpdated.toString());
            } catch (error) {
                log.error(error);
                exitCode = ExitCode.InternalError;
            }
        }

        // generate unit test feedback if needed
        if (!hideFeedback) {
            // make sure feedback is initialized
            resultData.feedback = resultData.feedback || [];
            resultData.feedback.push(
                `## ${languageData.testResultTitle || "Test result:"}`
            );
            for (const test of tests) {
                const description =
                    test.description ||
                    (test.isCode ? test.name : `\`${test.code}\``);
                // update here
                if (exitCode === ExitCode.InternalError) {
                    resultData.feedback.push(
                        `:x: ${
                            languageData.testInternalErrorMessage ||
                            "There was an error while running the tests"
                        }`
                    );
                    break;
                }

                if (exitCode === ExitCode.TimeoutError) {
                    resultData.feedback.push(
                        `:x: ${
                            languageData.testTimeoutErrorMessage ||
                            "Timed out running the tests"
                        }`
                    );
                    break;
                }

                const unitTestResult = resultData[test.name];
                if (unitTestResult) {
                    resultData.feedback.push(
                        `:white_check_mark: ${description} **(${
                            languageData.testResultSuccess || "successful"
                        })**`
                    );
                } else {
                    resultData.feedback.push(
                        `:x: ${description} **(${
                            languageData.testResultFail || "failed"
                        })**`
                    );
                }
            }
        }

        // return the feedback
        return { data: resultData, log: exitLog, code: exitCode };
    }
}
