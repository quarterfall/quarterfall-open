import { ActionType, DatabaseDialect } from "core";
import { IUnitTest } from "db/UnitTest";
import { model, Schema, Types } from "mongoose";
import { IDocument } from "./IDocument";
import { IIOTest } from "./IOTest";

export interface IAction extends IDocument {
    blockId: Types.ObjectId;
    type: ActionType;
    condition?: string;
    scoreExpression?: string;
    stopOnMatch?: boolean;
    code?: string;
    text?: string;
    textOnMismatch?: string;
    gitUrl?: string;
    gitBranch?: string;
    gitPrivateKey?: string;
    databaseFileLabel?: string;
    databaseDialect?: DatabaseDialect;
    path?: string;
    url?: string;
    answerEmbedding?: string;
    imports?: string;
    tests?: IUnitTest[];
    ioTests?: IIOTest[];
    hideFeedback?: boolean;
    teacherOnly?: boolean;
    forceOverrideCache?: boolean;
}

export const actionSchema = new Schema<IAction>(
    {
        blockId: Schema.Types.ObjectId,
        type: {
            type: String,
        },
        condition: String,
        scoreExpression: String,
        stopOnMatch: Boolean,
        code: String,
        text: String,
        textOnMismatch: String,
        gitUrl: String,
        gitBranch: String,
        gitPrivateKey: String,
        databaseFileLabel: String,
        databaseDialect: String,
        path: String,
        url: String,
        answerEmbedding: String,
        imports: String,
        tests: [Schema.Types.Mixed],
        ioTests: [Schema.Types.Mixed],
        hideFeedback: Boolean,
        teacherOnly: Boolean,
        forceOverrideCache: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
actionSchema.index({ blockId: 1 });

// tslint:disable-next-line variable-name
export const DBAction = model<IAction>("action", actionSchema);
