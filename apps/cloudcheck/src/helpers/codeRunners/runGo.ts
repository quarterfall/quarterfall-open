import fs = require("fs");
import { RunCodeOptions, transformCodeRunnerResult } from "helpers/codeRunners";
import { runCommand } from "helpers/runCommand";

export async function runGo({ code, filePath, pipedInput }: RunCodeOptions) {
    const path = `${filePath}/code.go`;
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, code);
    }
    return transformCodeRunnerResult(
        await runCommand(`go run ${path} ${pipedInput}`)
    );
}
