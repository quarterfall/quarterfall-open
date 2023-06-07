import { ExitCode } from "core";
import { runCpp } from "./runCpp";
import { runCsharp } from "./runCsharp";
import { runGo } from "./runGo";
import { runJava } from "./runJava";
import { runPython } from "./runPython";
import { runR } from "./runR";

export const codeRunners = {
    python: runPython,
    java: runJava,
    c: runCpp,
    cpp: runCpp,
    csharp: runCsharp,
    r: runR,
    go: runGo,
};

export function transformCodeRunnerResult({
    stdout,
    stderr,
    exitCode,
}: {
    stdout?: string;
    stderr?: string;
    exitCode?: ExitCode;
}): { result: string; log: string[]; code: ExitCode } {
    let log: string[] = [];
    let code = exitCode || ExitCode.NoError;

    if (stderr) {
        log.push(stderr.toString());
    }

    return { result: stdout || "", log, code };
}

export interface RunCodeOptions {
    code: string;
    filePath?: string;
    pipedInput?: string;
}
