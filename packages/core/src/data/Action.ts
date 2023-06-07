import { ActionType } from "./ActionType";
import { DatabaseDialect } from "./DatabaseDialect";
import { IOTest } from "./IOTest";
import { UnitTest } from "./UnitTest";

export interface Action {
    id: string;
    type: ActionType;
    condition?: string;
    scoreExpression?: string;
    stopOnMatch?: boolean;
    code?: string;
    text?: string;
    gitUrl?: string;
    gitBranch?: string;
    gitPrivateKey?: string;
    databaseFileLabel?: string;
    databaseDialect?: DatabaseDialect;
    path?: string;
    url?: string;
    answerEmbedding?: string;
    imports?: string;
    tests?: UnitTest[];
    ioTests?: IOTest[];
    hideFeedback?: boolean;
    teacherOnly?: boolean;
}
