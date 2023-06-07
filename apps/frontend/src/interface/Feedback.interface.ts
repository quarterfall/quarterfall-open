export interface Feedback {
    text: string[];
    log: string[];
    code: number;
    attemptCount: number;
    score?: number;
    originalScore?: number;
    justificationText?: string;
}
