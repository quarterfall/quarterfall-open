import { exec, ExecOptions } from "child_process";
import { ExitCode } from "core";
import { log } from "./logger";

export async function runCommand(
    command: string,
    options?: ExecOptions
): Promise<{ stdout: string; stderr: string; exitCode?: ExitCode }> {
    options = Object.assign(
        {
            timeout: 90 * 1000,
        },
        options
    );
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                log.error(error.toString());
            }
            if (error?.code === null && error?.signal === "SIGTERM") {
                resolve({ stdout, stderr, exitCode: ExitCode.TimeoutError });
            }
            resolve({
                stdout,
                stderr,
                exitCode: error ? ExitCode.InternalError : ExitCode.NoError,
            });
        });
    });
}
