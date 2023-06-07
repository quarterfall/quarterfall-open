import fs = require("fs");
import { RunCodeOptions, transformCodeRunnerResult } from "helpers/codeRunners";
import { runCommand } from "helpers/runCommand";

export async function runCpp({ code, filePath, pipedInput }: RunCodeOptions) {
    const path = `${filePath}/code.cpp`;
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, code);
        await runCommand(`g++ -o ${filePath}/runCode ${path}`);
    }
    return transformCodeRunnerResult(
        await runCommand(`${filePath}/runCode ${pipedInput}`)
    );
}
