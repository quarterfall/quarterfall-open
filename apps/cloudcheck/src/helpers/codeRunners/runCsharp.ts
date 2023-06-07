import fs = require("fs");
import { RunCodeOptions, transformCodeRunnerResult } from "helpers/codeRunners";
import { runCommand } from "helpers/runCommand";

export async function runCsharp({
    code,
    filePath,
    pipedInput,
}: RunCodeOptions) {
    const path = `${filePath}/Program.cs`;
    pipedInput = pipedInput.replace(filePath, ".");
    if (!fs.existsSync(path)) {
        await runCommand(
            `cp -r ./static/run_code/csharp/csharp.csproj ${filePath}`
        );
        fs.writeFileSync(path, code);
        await runCommand(`cd ${filePath} && dotnet build --nologo`);
    }
    return transformCodeRunnerResult(
        await runCommand(`cd ${filePath} && dotnet run --nologo ${pipedInput}`)
    );
}
