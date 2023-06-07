import { EventType } from "core";
import { DBEvent } from "db/Event";
import { EventEmitter } from "events";

// main backend event emitter
const em = new EventEmitter();

export function addListener<T = any>(
    type: EventType,
    listener: (data: T) => void
) {
    em.addListener(type, listener);
}

export function removeListener<T = any>(
    type: EventType,
    listener: (data: T) => void
) {
    em.removeListener(type, listener);
}

export interface EventData<T = any> {
    type: EventType;
    organizationId?: string;
    subjects?: string[];
    data: T;
    metadata?: any;
}

export async function postEvent<T>(event: EventData<T>) {
    const { type, organizationId, subjects, data, metadata } = event;

    // create the event in the database
    await new DBEvent({
        type,
        organizationId,
        subjects,
        data,
        metadata,
    }).save();

    em.emit(type, event);
}
