import { EventType } from "core";

export interface Event {
    id: string;
    type: EventType;
    data: any;
    metadata: any;
    createdAt: Date;
}
