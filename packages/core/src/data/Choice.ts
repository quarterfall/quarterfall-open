export interface Choice {
    id: string;
    label?: string;
    text?: string;
    correct?: boolean;
    correctScore?: number;
    wrongScore?: number;
}
