import { NotificationType } from "core";
import { IAction } from "db/Action";
import { INotification } from "db/Notification";

export type NotificationFunction = (
    notification: INotification
) => Promise<string>;

const notificationFunctions: Partial<
    Record<NotificationType, NotificationFunction>
> = {};

export function registerNotification(
    type: NotificationType,
    func: NotificationFunction
) {
    notificationFunctions[type] = func;
}

export function unregisterNotification(type: NotificationType) {
    delete notificationFunctions[type];
}

export async function generateNotificationText(
    action: IAction,
    data: any,
    languageData: any
): Promise<any> {
    const actionFunc = notificationFunctions[action.type];
    if (!actionFunc) {
        throw new Error(`Unknown action type: ${action.type}.`);
    }
    return actionFunc(action, data, languageData);
}
