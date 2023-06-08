import axios from "axios";
import { config, environment } from "config";
import {
    ActionType,
    BlockType,
    CloudcheckActionResponse,
    CloudcheckActionType,
    DatabaseDialect,
    EditorType,
    ExitCode,
    fallbackLanguage,
    PipelineStep,
    PipelineStepOptions,
} from "core";
import { IAction } from "db/Action";
import { IAssignment } from "db/Assignment";
import { IBlock } from "db/Block";
import { IBlockFeedback, ISubmission } from "db/Submission";
import { IUser } from "db/User";
import Feedback from "graphql/block/Feedback";
import { log } from "../Logger";
import { constructDataForMultipleChoiceFeedback } from "./Grading.operation";
import Handlebars = require("handlebars");

export interface ConstructDataForFeedbackOptions {
    assignment: IAssignment;
    submission?: ISubmission;
    block: IBlock;
    actions: IAction[];
    input?: string[];
    user?: IUser;
}

export async function constructDataForFeedback(
    options: ConstructDataForFeedbackOptions
) {
    const { assignment, submission, block, input = [], user } = options;
    const allFeedback: IBlockFeedback[] = submission?.feedback || [];
    const blockFeedback = allFeedback.find((f) => f.id === block.id);
    const data: any = {
        attemptCount: (blockFeedback?.attemptCount || 0) + 1,
        feedback: [],
        showSolution: false,
    };

    // store data of the person requesting the feedback
    if (user) {
        data.user = {
            id: user.id,
            language: user.language || fallbackLanguage,
        };
    }

    // store fields for assignment and block files.
    const addFieldsToFile = (files) => {
        return (files || [])?.map((f) => ({
            id: f?.id,
            label: f?.label,
            extension: f?.extension,
            path: f?.path,
            mimetype: f?.mimetype,
            cropX: f?.cropX,
            cropY: f?.cropY,
            cropHeight: f?.cropHeight,
            cropWidth: f?.cropWidth,
            url: `https://${config.storage.bucket}/${f?.path}/${f?.id}${f?.extension}`,
        }));
    };
    // add the block and assignment data
    data.assignment = {
        id: assignment.id,
        title: assignment.title,
        files: addFieldsToFile(assignment?.files),
    };
    data.question = {
        id: block.id,
        text: block.text,
        solution: block.solution,
        programmingLanguage: block.programmingLanguage,
    };

    data.files = addFieldsToFile(
        submission?.answers?.find((a) => a.blockId.equals(block?.id))?.files
    );
    data.file = data.files?.length > 0 ? data.files[0] : undefined;
    data.fileUrl = data.file?.url;

    data.comments =
        block.type === BlockType.FileUploadQuestion
            ? submission?.answers?.find((a) => a.blockId.equals(block?.id))
                  ?.data
            : undefined;

    data.comment = data.comments?.length > 0 ? data.comments[0] : "";

    data.score = 0;
    data.stop = false;

    // if there is no answer, but there is a template, use that
    if (input.length === 0 && block.template) {
        input.push(block.template);
    }

    // store the answers and convert to numbers if needed in case of an open or code question
    if (
        [
            BlockType.OpenQuestion,
            BlockType.CodeQuestion,
            BlockType.DatabaseQuestion,
        ].indexOf(block.type) >= 0 &&
        input.length > 0
    ) {
        data.answers = input.map((item) =>
            block.editor === EditorType.Number ? Number(item) : item
        );
    }

    if (block.type === BlockType.MultipleChoiceQuestion) {
        Object.assign(
            data,
            constructDataForMultipleChoiceFeedback(input, block)
        );
    }

    // store the first answer if possible
    data.answer = data.answers?.length > 0 ? data.answers[0] : "";

    // return the data
    return data;
}

export async function constructPipelineForFeedback(
    data: any,
    options: ComputeBlockFeedbackOptions
): Promise<PipelineStep[]> {
    const { actions, assignment, block } = options;

    const pipelineActionType = (action: IAction): CloudcheckActionType => {
        switch (action?.type) {
            case ActionType.Feedback:
            case ActionType.Scoring:
                return CloudcheckActionType.conditional_text;
            case ActionType.UnitTest:
                return CloudcheckActionType.unit_test;
            case ActionType.Webhook:
                return CloudcheckActionType.webhook;
            case ActionType.Database:
                return CloudcheckActionType.database;
            case ActionType.CloudCheck:
                return CloudcheckActionType.git;
            case ActionType.Code:
                return CloudcheckActionType.executeVMCode;
            default:
                return CloudcheckActionType.run_code;
        }
    };

    return actions.map((action) => {
        const databaseFile = (assignment.files || []).find(
            (f) => f.label === action?.databaseFileLabel
        );

        return {
            action: pipelineActionType(action),
            options: <PipelineStepOptions>{
                scoreExpression: action?.scoreExpression,
                condition: action?.condition,
                hideFeedback: action?.hideFeedback,
                answerEmbedding: action?.answerEmbedding,
                stopOnMatch: action?.stopOnMatch,
                ...((action?.type === ActionType.Feedback ||
                    action?.type === ActionType.Scoring) && {
                    textOnMatch: action.text,
                    textOnMismatch: action.textOnMismatch,
                    expression: true,
                }),
                ...(action?.type === ActionType.Code && {
                    code: action?.code,
                    hideFeedback: true,
                }),
                ...(action?.type === ActionType.UnitTest && {
                    language: block?.programmingLanguage,
                    tests: action?.tests,
                }),
                ...(action?.type === ActionType.IOTest && {
                    language: block?.programmingLanguage,
                    ioTests: action?.ioTests,
                    inputs: action?.ioTests?.map((t) => ({ input: t.input })),
                }),
                ...(action?.type === ActionType.CloudCheck && {
                    gitUrl: action?.gitUrl,
                    gitBranch: action?.gitBranch,
                    gitPath: action?.path,
                    gitPrivateKey: action?.gitPrivateKey,
                    forceOverrideCache: action?.forceOverrideCache,
                }),
                ...(action?.type === ActionType.Webhook && {
                    webhookUrl: action?.url,
                }),
                ...(action?.type === ActionType.Database && {
                    databaseDialect:
                        action?.databaseDialect || DatabaseDialect.mysql,
                    databaseFileUrl: databaseFile
                        ? `https://storage.googleapis.com/${config.storage.bucket}/assignment/${assignment.id}/files/${databaseFile.id}${databaseFile.extension}`
                        : "",
                }),
            },
        };
    });
}

export interface ComputeBlockFeedbackOptions
    extends ConstructDataForFeedbackOptions {
    languageData?: any;
}
export async function computeBlockFeedback(
    options: ComputeBlockFeedbackOptions
): Promise<Feedback> {
    const { block, user } = options;

    let qf = await constructDataForFeedback(options);

    let pipeline = await constructPipelineForFeedback(qf, options);

    const feedbackLog: string[] = [];
    let code = ExitCode.NoError;

    const reqConfig: any = {};

    if (environment !== "development") {
        // retrieve a token from Google so we are allowed to access the cloud run service
        const metadataServerTokenURL = `http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=${config.cloudCheck.server}`;
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

    log.debug(
        `Sending POST request with data and pipeline to the cloudcheck server`
    );

    const { data: result } = await axios.post<
        any,
        { data: CloudcheckActionResponse }
    >(
        config.cloudCheck.server,
        {
            data: qf,
            pipeline,
        },
        reqConfig
    );

    log.debug(`Action pipeline finished.`);

    qf = result.data;
    feedbackLog.push(...result.log);
    code = Math.max(code, result.code);

    log.debug(
        `Replacing handlebars for generated feedback for block ${block.id}.`
    );

    // construct the final feedback data with replaced handlebars
    const text: string[] = [];
    const feedbackItems = qf.feedback || [];

    for (const item of feedbackItems) {
        // replace handlebars
        const replaceFunc = Handlebars.compile(item || "", {
            noEscape: true,
        });
        const items = { ...qf };
        items.user = {
            ...items.user,
            firstName: user?.firstName,
            lastName: user?.lastName,
        };
        const replaced = replaceFunc(items);
        if (replaced.trim().length) {
            text.push(replaced);
        }
    }

    return {
        text: text || "",
        log: feedbackLog || [],
        code: code || ExitCode.NoError,
        score: code !== ExitCode.NoError ? 0 : qf.score,
        attemptCount: 0,
    };
}
