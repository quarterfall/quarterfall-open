import { ExitCode, ProgrammingLanguage } from "core";
import { runCommand } from "helpers/runCommand";
import { PipelineStepExtraOptions } from "index";
import { codeRunners } from "./codeRunners";
import fs = require("fs");

export async function runCode(
    data: any,
    requestId: string,
    options: PipelineStepExtraOptions
): Promise<{ data: any; log?: string[]; code: number }> {
    const { language, inputs = [{ input: "" }] } = options;
    const codeSnippet = options.code || data.embeddedAnswer || data.answer;

    let code = ExitCode.NoError;
    let log: string[] = [];

    if (!codeSnippet) {
        log.push(
            "No programming language or code has been sent in the request body."
        );
        return {
            data,
            log,
            code: ExitCode.InternalError,
        };
    }

    const filePath = `./${requestId}/run_code/${language}`;
    fs.mkdirSync(filePath, { recursive: true });

    let outputs = [];

    for (const i of inputs) {
        // write input to file
        fs.writeFileSync(`${filePath}/inputs.txt`, i.input);
        // run code and push output to qf object
        const pipedInput = `< ${filePath}/inputs.txt`;

        let {
            result,
            log: exitLog,
            code: exitCode,
        } = await codeRunners[language]({
            code: codeSnippet,
            filePath,
            pipedInput,
        });

        // in R, the standard output print the line number so we need to delete that
        if (language === ProgrammingLanguage.r) {
            result = result?.replace(/\[.*]\s/i, "").replace(/['"]+/g, "");
        }

        code = exitCode;
        log.push(...exitLog);

        outputs.push(result?.replace(/\n+$/, ""));
        // remove input file
        await runCommand(`rm ${filePath}/inputs.txt`);
    }
    data.outputs = outputs;
    return { data, log, code };
}
