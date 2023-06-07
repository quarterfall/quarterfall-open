import axios from "axios";
import { config, environment } from "config";
import { log } from "Logger";

interface computeAnalyticsBlockOptions {
    blockId: string;
    targetId?: string;
    courseId?: string;
}

interface computeAnalyticsBlockResult {
    result?: any;
    log: string[];
    code: number;
}

export async function computeAnalyticsBlock(
    options: computeAnalyticsBlockOptions
) {
    const reqConfig: any = {};

    if (environment !== "development") {
        // retrieve a token from Google so we are allowed to access the cloud function service
        const metadataServerTokenURL = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${config.google.cloudFunctions.computeAnalyticsBlock}`;
        const tokenResult = await axios.get(metadataServerTokenURL, {
            headers: {
                "Metadata-Flavor": "Google",
            },
        });
        const token = tokenResult.data;
        log.debug(`Retrieved metadata token from Google: ${token}.`);

        // set the token as an auth header
        reqConfig.headers = { Authorization: `bearer ${token}` };
    }

    log.debug(`Sending POST request to the analytics cloud function`);

    const { data: result } = await axios.post<
        any,
        { data: computeAnalyticsBlockResult }
    >(config.google.cloudFunctions.computeAnalyticsBlock, options, reqConfig);

    return { blockId: options.blockId, ...result };
}
