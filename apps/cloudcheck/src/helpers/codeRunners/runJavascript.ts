import { CloudcheckActionResponse, ExitCode } from "core";
import { log } from "helpers/logger";
import { runScript } from "helpers/runScript";
import { createPlayground } from "../createPlayground";
import fs = require("fs");

interface RunJavascriptCodeOptions {
    code: string;
    requestId: string;
    input?: { input?: string };
    sandbox?: any;
    external?: string[];
    resultData?: any;
    resultCode?: any;
    resultLog?: any;
}

export async function runJavascript(
    options: RunJavascriptCodeOptions
): Promise<CloudcheckActionResponse> {
    let {
        requestId,
        code,
        input,
        external,
        sandbox,
        resultData,
        resultCode,
        resultLog,
    } = options;

    const path = `./${requestId}/run_code/javascript`;

    if (!fs.existsSync(`${path}`)) {
        await createPlayground({
            localPath: "/run_code/javascript",
            requestId,
            log: resultLog,
        });
    }

    if (fs.existsSync(`${path}/run.sh`)) {
        // write the qf object to a file in the directory
        fs.writeFileSync(
            `${path}/data.json`,
            JSON.stringify(
                {
                    qf: resultData,
                    input,
                    code,
                    external,
                    sandbox,
                } || {}
            )
        );

        // run git, with the data in the qf object as environment variables
        log.debug(
            `[${requestId}] Running javascript run script at path run_code/javascript...`
        );

        resultCode = await runScript({
            script: "./run.sh",
            cwd: `${path}`,
            log: resultLog,
            env: Object.assign({}, resultData || {}, process.env),
        });

        if (fs.existsSync(`${path}/data.json`)) {
            // read the updated quarterfall object
            const dataUpdated = fs.readFileSync(`${path}/data.json`);
            try {
                resultData = JSON.parse(dataUpdated.toString());
            } catch (error) {
                log.error(error);
                resultCode = ExitCode.InternalError;
            }
        }

        if (fs.existsSync(`${path}/outputs.txt`)) {
            const outputs = fs.readFileSync(`${path}/outputs.txt`, "utf8");
            resultData["outputs"].push(outputs.replace(/\n+$/, ""));
        }
    } else {
        // there is no run script present
        throw new Error("Unable to run javascript code.");
    }

    return { data: resultData, code: resultCode, log: resultLog };
}
