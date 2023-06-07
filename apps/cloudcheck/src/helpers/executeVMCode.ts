import { ExitCode, replaceQuotes } from "core";
import lodash from "lodash";
import ts from "typescript";
import { NodeVM, VMScript } from "vm2";

export interface ExecuteVMCodeOptions {
    code: string;
    sandbox: any;
    external?: string[];
    expression?: boolean;
}

export interface ExecuteVMCodeResult {
    result?: any;
    log: string[];
    code: number;
}

export function cleanupLog(log: string[]): string[] {
    // make sure everything in the log is a string
    const cleanedLog = log.map((l) => {
        if (l === undefined) {
            return "undefined";
        } else if (l === null) {
            return "null";
        } else {
            return lodash.toString(l);
        }
    });
    return cleanedLog;
}

export async function executeVMCode(
    options: ExecuteVMCodeOptions
): Promise<ExecuteVMCodeResult> {
    const {
        code,
        sandbox,
        external = ["axios", "date-fns", "color"],
        expression = false,
    } = options;

    // log
    const log: string[] = [];

    // there is no code, so the result is empty
    if (!code) {
        return { log, code: ExitCode.NoError };
    }

    const functionWrap = expression
        ? `module.exports = async function() { return ${replaceQuotes(code)}; }`
        : `module.exports = async function() {${replaceQuotes(code)}}`;

    // compile the source code
    const script = new VMScript(ts.transpile(functionWrap));

    // run the code in a sandbox environment
    const vm = new NodeVM({
        console: "redirect",
        sandbox,
        require: {
            external,
        },
    });

    // catch console logs, warnings and errors
    const processLogData = (logData: any) => {
        try {
            if (lodash.isString(logData)) {
                log.push(logData);
            } else {
                log.push(JSON.stringify(logData));
            }
        } catch (err) {
            // ignore errors
        }
    };
    vm.on("console.log", processLogData);
    vm.on("console.warn", processLogData);
    vm.on("console.error", processLogData);

    try {
        // run the function
        const func = vm.run(script);
        const result = await func();

        // return the analytics result
        return {
            result,
            log: cleanupLog(log),
            code: ExitCode.NoError,
        };
    } catch (error: any) {
        log.push(error.toString());
        return { log: cleanupLog(log), code: 1 };
    }
}
