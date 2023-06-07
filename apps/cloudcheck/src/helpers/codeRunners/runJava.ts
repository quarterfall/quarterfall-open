import fs = require("fs");
import { RunCodeOptions, transformCodeRunnerResult } from "helpers/codeRunners";
import { runCommand } from "helpers/runCommand";

export async function runJava(options: RunCodeOptions) {
    const { code, filePath, pipedInput } = options;
    const mainClassName =
        code
            .slice(0, code.indexOf(`public static void main(String[] args)`))
            .match(/public class [a-zA-Z]+/)[0]
            .replace("public class", "")
            .trim() || "Answer";
    const path = `${filePath}/${mainClassName}.java`;
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, code);
        await runCommand(`javac ${path}`);
    }

    return transformCodeRunnerResult(
        await runCommand(`java -cp ${filePath} ${mainClassName} ${pipedInput}`)
    );
}
