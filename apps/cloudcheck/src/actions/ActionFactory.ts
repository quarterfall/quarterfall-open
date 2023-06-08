import {
    CloudcheckActionResponse,
    CloudcheckActionType,
    ExitCode,
    PipelineStep,
} from "core";
import { executeVMCode } from "helpers/executeVMCode";

import { PipelineStepExtraOptions } from "index";

export class ActionHandler {
    public actionType: CloudcheckActionType;
    public actionOptions: PipelineStepExtraOptions;
    public computedCondition: boolean;
    public runAlways: boolean;

    public constructor(action: PipelineStep, runAlways: boolean = false) {
        this.actionType = action.action;
        this.actionOptions = action.options;
        this.runAlways = runAlways;
    }

    public async evaluateCondition(
        data: any,
        requestId: string
    ): Promise<boolean> {
        const condition = this.actionOptions?.condition;
        if (!condition) {
            return true;
        }

        // execute the code in a sandbox
        const result = await executeVMCode({
            code: condition,
            sandbox: data,
            expression: true,
        });

        if (result?.code !== ExitCode.NoError) {
            throw new Error(result.log.toString());
        }

        this.computedCondition = Boolean(result.result);
        // return the result as a boolean
        return this.computedCondition;
    }

    public async setup(): Promise<CloudcheckActionResponse> {
        this.actionOptions.localPath =
            `/${this.actionType}` +
            (this.actionOptions.language
                ? `/${this.actionOptions.language}`
                : "");
        return {
            log: [],
            code: ExitCode.NoError,
        };
    }

    // add setup pipeline function

    public async run(
        data: any,
        requestId: string,
        languageData: any
    ): Promise<CloudcheckActionResponse> {
        return {
            data,
            log: [],
            code: ExitCode.NoError,
        };
    }

    public async tearDown(): Promise<CloudcheckActionResponse> {
        return {
            log: [],
            code: ExitCode.NoError,
        };
    }
}

const actions: Partial<
    Record<CloudcheckActionType, (action: PipelineStep) => ActionHandler>
> = {};

export function registerAction<T extends ActionHandler>(
    type: CloudcheckActionType,
    cls: { new (action: PipelineStep): T }
) {
    actions[type] = (action: PipelineStep) => {
        return new cls(action);
    };
}

export function unregisterAction(type: CloudcheckActionType) {
    delete actions[type];
}

export function createActionHandler(action: PipelineStep) {
    const actionType = action.action;
    const actionHandlerCreator = actions[actionType];
    if (actionHandlerCreator) {
        return actionHandlerCreator(action);
    } else {
        return new ActionHandler(action);
    }
}
