import { CloudcheckActionResponse, ExitCode } from "core";
import { createPlayground } from "helpers/createPlayground";
import { log } from "helpers/logger";
import { runScript } from "helpers/runScript";
import { ActionHandler } from "./ActionFactory";
import fs = require("fs");

let gitCacheCreationDateTime = Date.now();

export class GitAction extends ActionHandler {
    public async run(
        data: any,
        requestId: string,
        _languageData: any
    ): Promise<CloudcheckActionResponse> {
        const {
            gitUrl,
            gitBranch,
            gitPrivateKey,
            gitPath,
            localPath,
            forceOverrideCache,
        } = this.actionOptions;

        let exitCode = ExitCode.NoError;
        let exitLog = [];

        // there is no git url, so ignore this action
        if (!gitUrl) {
            log.notice(
                `Aborting git action because of missing git url. Action: ${JSON.stringify(
                    this.actionOptions
                )}. Data: ${JSON.stringify(data)}.`
            );
            return { data, log: [], code: ExitCode.NoError };
        }

        await createPlayground({
            gitUrl,
            gitBranch,
            gitPath,
            gitPrivateKey,
            gitCacheCreationDateTime,
            forceOverrideCache,
            requestId,
            localPath,
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
                `[${requestId}] Running git script at localPath ${localPath}...`
            );
            exitCode = await runScript({
                script: "./run.sh",
                cwd: `./${requestId}/${localPath}`,
                log: exitLog,
                env: Object.assign({}, data || {}, process.env),
            });
        } else {
            // there is no run script present
            throw new Error("Unable to run git action.");
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

        // return the feedback
        return { data: resultData, log: exitLog, code: exitCode };
    }
}
