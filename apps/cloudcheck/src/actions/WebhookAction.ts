import Axios, { AxiosResponse } from "axios";
import { CloudcheckActionResponse, ExitCode } from "core";
import { ActionHandler } from "./ActionFactory";

export class WebhookAction extends ActionHandler {
    public async run(data: any, _requestId: string, _languageData: any) {
        const { webhookUrl } = this.actionOptions;

        // there is no webhookUrl, so ignore this action
        if (!webhookUrl) {
            return { data, log: [], code: ExitCode.NoError };
        }

        // call the webhookUrl with the required data
        const result = await Axios.post<
            unknown,
            AxiosResponse<CloudcheckActionResponse>
        >(webhookUrl, data);

        // return the feedback
        return { data: result.data, log: [], code: ExitCode.NoError };
    }
}
