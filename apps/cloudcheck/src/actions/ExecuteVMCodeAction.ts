import { executeVMCode } from "helpers/executeVMCode";
import { ActionHandler } from "./ActionFactory";

export class ExecuteVMCodeAction extends ActionHandler {
    public async run(data: any, _requestId: string, _languageData: any) {
        const { code, expression, external, sandbox } = this.actionOptions;

        const {
            result,
            code: exitCode,
            log,
        } = await executeVMCode({
            code,
            sandbox: { qf: data, ...sandbox },
            expression,
            external,
        });

        data = { ...data, result };
        // return the feedback
        return { data, log, code: exitCode };
    }
}
