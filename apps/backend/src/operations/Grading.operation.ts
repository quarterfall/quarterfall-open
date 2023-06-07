import axios from "axios";
import { config, environment } from "config";
import {
    BlockType,
    clampNumber,
    CloudcheckActionResponse,
    CloudcheckActionType,
    gradingSchemeDefaults,
    nearestNumber,
    PipelineStep,
} from "core";
import { IAssignment } from "db/Assignment";
import { DBBlock, IBlock } from "db/Block";
import { ISubmission } from "db/Submission";
import { log } from "Logger";

export async function computeGrade({
    gradingSchemeCode,
    score,
    questions,
}: {
    gradingSchemeCode: string;
    score?: number;
    questions?: any;
}) {
    const pipeline: PipelineStep[] = [
        {
            action: CloudcheckActionType.executeVMCode,
            options: {
                code: gradingSchemeCode,
                sandbox: {
                    score,
                    questions,
                },
            },
        },
    ];

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
    const { data: result } = await axios.post<
        any,
        { data: CloudcheckActionResponse }
    >(
        config.cloudCheck.server,
        {
            data: {},
            pipeline,
        },
        reqConfig
    );

    return {
        result: result?.data?.result,
        log: result?.log,
        code: result?.code,
    };
}

export function constructDataForMultipleChoiceFeedback(
    input: string[],
    block: IBlock
) {
    let data: any = {};
    data.answers = [];
    data.correctAnswers = [];
    data.wrongAnswers = [];
    data.score = null;
    data.correctChoices = block.choices
        .filter((choice) => choice.correct)
        .map((choice) => choice.label || choice.id);
    // store answers ids and labels
    for (const inputItem of input) {
        const choice = findChoice(block, inputItem);
        if (!choice) {
            continue;
        }
        data.answers.push(choice.label || choice.id);
        if (choice.correct) {
            data.correctAnswers.push(choice.label || choice.id);
        } else {
            data.wrongAnswers.push(choice.label || choice.id);
        }
        data[choice.id] = true;
        if (choice.label) {
            data[choice.label] = true;
        }
    }
    // store the non selected choices as false values
    for (const choice of block.choices) {
        if (input.indexOf(choice.id) < 0) {
            data[choice.id] = false;
            if (choice.label) {
                data[choice.label] = false;
            }
        }
    }

    // store whether the answer is correct
    data.correct =
        data.correctAnswers.length === data.correctChoices.length &&
        data.wrongAnswers.length === 0;
    data.answerCount = data.answers.length;
    data.correctAnswerCount = data.correctAnswers.length;
    data.wrongAnswerCount = data.wrongAnswers.length;
    data.score =
        nearestNumber(
            computeMultipleChoiceQuestionScore(input, block)!,
            block.granularity
        ) || null;
    return data;
}

export function computeCorrectAnswerScore(correct: boolean): number {
    return correct ? 100 : 0;
}
export function computePerAnswerScore(
    correctAnswers: string[],
    wrongAnswers: string[],
    block: IBlock
): number {
    let score: number = 0;
    for (const choice of block.choices) {
        if (correctAnswers.includes(choice.label || choice.id)) {
            score = score + block.choices[0].correctScore!;
        }
        if (wrongAnswers.includes(choice.label || choice.id)) {
            score = score + block.choices[0].wrongScore!;
        }
    }
    return block.hasRangeLimit ? clampNumber(score, 0, 100) : score;
}
export function computeScoreMappingScore(
    answers: string[],
    block: IBlock
): number {
    let score: number = 0;
    for (const choice of block.choices) {
        if (answers.includes(choice.label || choice.id)) {
            score += choice.correctScore || 0;
        } else {
            score += choice.wrongScore || 0;
        }
    }
    return block.hasRangeLimit ? clampNumber(score, 0, 100) : score;
}

export function computeMultipleChoiceQuestionScore(
    input: string[],
    block: IBlock
) {
    let answers: string[] = [];
    let correctAnswers: string[] = [];
    let wrongAnswers: string[] = [];
    let correctChoices: string[] = block.choices
        .filter((choice) => choice.correct)
        .map((choice) => choice.label || choice.id);

    for (const inputItem of input) {
        const choice = findChoice(block, inputItem);
        if (!choice) {
            continue;
        }
        answers.push(choice.label || choice.id);
        if (choice.correct) {
            correctAnswers.push(choice.label || choice.id);
        } else {
            wrongAnswers.push(choice.label || choice.id);
        }
    }

    let correct =
        correctAnswers.length === correctChoices.length &&
        wrongAnswers.length === 0;

    const obj = {
        correctAnswer: computeCorrectAnswerScore(correct),
        perAnswer: computePerAnswerScore(correctAnswers, wrongAnswers, block),
        scoreMapping: computeScoreMappingScore(answers, block),
    };

    return obj[block.assessmentMethod] || null;
}

export async function computeAssignmentScore(
    submission: ISubmission,
    assignment: IAssignment
) {
    const questions = await constructDataForScoreComputation(
        submission,
        assignment
    );

    return Math.round((weightedMean(questions) + Number.EPSILON) * 100) / 100;
}

export async function computeAssignmentGrade(
    submission: ISubmission,
    assignment: IAssignment
) {
    const questions = await constructDataForScoreComputation(
        submission,
        assignment
    );

    const gradingSchemeCode =
        assignment?.gradingSchemeCode ||
        gradingSchemeDefaults.find((s) => s?.isDefault)?.code ||
        "";

    const submissionScore = submission?.score || 0;

    const { result } = await computeGrade({
        gradingSchemeCode,
        score: submissionScore,
        questions,
    });

    return result;
}

export async function constructDataForScoreComputation(
    submission: ISubmission,
    assignment: IAssignment
) {
    const blocks = await DBBlock.find({
        assignmentId: { $eq: assignment._id },
        type: { $ne: BlockType.Text },
    });

    const questions = blocks.map((b) => {
        return {
            score:
                submission.feedback
                    .filter((f) => f.blockId.equals(b.id))
                    .map((f) => f.score)[0] || 0,
            weight: b.weight,
        };
    });

    return questions;
}

export const findChoice = (block: IBlock, choiceId: string) => {
    for (const choice of block.choices || []) {
        if (choice.id === choiceId) {
            return choice;
        }
    }
    return null;
};

export const weightedMean = (
    arr: { score: number; weight: number }[]
): number => {
    const result = arr
        .map((e) => {
            const sum = e?.score * e?.weight;
            return [sum, e.weight];
        })
        .reduce(
            (p, c) => {
                return [p[0] + c[0], p[1] + c[1]];
            },
            [0, 0]
        );
    return result[0] / result[1];
};
