import fs = require("fs");
import { RunCodeOptions, transformCodeRunnerResult } from "helpers/codeRunners";
import { runCommand } from "helpers/runCommand";

export async function runPython(options: RunCodeOptions) {
    const { code, filePath, pipedInput } = options;
    const path = `${filePath}/code.py`;
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, code);
    }
    return transformCodeRunnerResult(
        await runCommand(`python3 ${path} ${pipedInput}`)
    );
}
