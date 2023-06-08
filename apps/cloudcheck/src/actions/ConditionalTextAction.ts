import { ExitCode, PipelineStep } from "core";
import { ActionHandler } from "./ActionFactory";

export class ConditionalTextAction extends ActionHandler {
    public constructor(action: PipelineStep) {
        super(action, true);
    }
    public async run(data: any, _requestId: string, languageData: any) {
        const { textOnMatch, textOnMismatch } = this.actionOptions;

        // there is no feedback text, so ignore this action
        if (this.computedCondition && !textOnMatch) {
            return { data, log: [], code: ExitCode.NoError };
        }

        if (!this.computedCondition && !textOnMismatch) {
            return { data, log: [], code: ExitCode.NoError };
        }

        // add the feedback to the data
        data.feedback = data.feedback || [];
        data.feedback.push(
            this.computedCondition ? textOnMatch : textOnMismatch
        );

        // return the updated data
        return { data, log: [], code: ExitCode.NoError };
    }
}
