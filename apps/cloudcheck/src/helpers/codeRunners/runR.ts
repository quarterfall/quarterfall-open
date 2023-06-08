import fs = require("fs");
import { RunCodeOptions, transformCodeRunnerResult } from "helpers/codeRunners";
import { runCommand } from "helpers/runCommand";

export async function runR({ code, filePath, pipedInput }: RunCodeOptions) {
    const path = `${filePath}/code.r`;
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, code);
    }
    return transformCodeRunnerResult(
        await runCommand(`Rscript ${path} ${pipedInput}`)
    );
}
