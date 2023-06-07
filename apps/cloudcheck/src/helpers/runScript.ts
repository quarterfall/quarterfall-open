import { spawn } from "child_process";
import { ExitCode } from "core";

export interface RunScriptOptions {
    script: string;
    cwd: string;
    log?: string[];
    timeout?: number;
    env?: Record<string, string>; // any environment variables
}

export async function runScript(options: RunScriptOptions) {
    return new Promise<number>((resolve, reject) => {
        // set default values
        options = Object.assign(
            {
                timeout: 90 * 1000,
            },
            options
        );
        const { script, cwd, log = [], timeout, env } = options;
        let processTimeout: NodeJS.Timeout;

        try {
            // run the script with the directory as the working directory
            const child = spawn("sh", [script], {
                cwd,
                env,
                detached: true,
                timeout,
            });

            // buffered output
            let lineBuffer = "";

            const handleLogData = (data) => {
                // add the data to the line buffer and split
                lineBuffer += data.toString();
                const lines = lineBuffer.split("\n");

                // add log entries and write each line to the console
                for (const line of lines) {
                    log.push(line);
                    console.log(line);
                }

                // set the line buffer to be the last line
                lineBuffer = lines[lines.length - 1];
            };

            // kill the process after the timeout occurs
            processTimeout = setTimeout(() => {
                try {
                    console.log(`Killing process after timeout.`);
                    process.kill(-child.pid, "SIGINT");
                    resolve(ExitCode.TimeoutError);
                } catch (error) {
                    reject(error);
                }
            }, timeout);

            // pass along any output
            child.stdout.setEncoding("utf8");
            child.stdout.on("data", handleLogData);
            child.stderr.setEncoding("utf8");
            child.stderr.on("data", handleLogData);
            child.on("close", async (code) => {
                // cleanup
                clearTimeout(processTimeout);
                resolve(code);
            });
        } catch (error) {
            // cleanup
            clearTimeout(processTimeout);
            reject(error);
        }
    });
}
