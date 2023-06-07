import mongoose = require("mongoose");
import { NotificationType } from "core";
import { IDocument } from "./IDocument";

export interface INotification extends IDocument {
    type: NotificationType; // the type of notification
    read: boolean; // whether the notification was read by the user
    hidden: boolean; // whether the notification is visible
    actorId?: mongoose.Types.ObjectId; // the person sending the notification (e.g. the teacher that gave feedback to a student)
    subjectId?: mongoose.Types.ObjectId; // the item that this notification is about (e.g. the submission that the teacher gave feedback on)
    receiverId: mongoose.Types.ObjectId; // the person for whom the nofitication is intended (e.g. the student that made the assignment)
    text?: string; // notification text in Markdown (optional, if not generated from the type)
    link?: string; // notification link (where to go if the user clicks on the notification)
    organizationId: mongoose.Types.ObjectId;
}

/**
 * Schema implementation.
 */
export const notificationSchema = new mongoose.Schema<INotification>(
    {
        type: {
            required: true,
            type: String,
            enum: Object.keys(NotificationType).map(
                (key) => NotificationType[key]
            ),
        },
        read: {
            type: Boolean,
            default: false,
        },
        hidden: {
            type: Boolean,
            default: false,
        },
        actorId: mongoose.Schema.Types.ObjectId,
        subjectId: mongoose.Schema.Types.ObjectId,
        organizationId: mongoose.Schema.Types.ObjectId,
        receiverId: {
            required: true,
            type: mongoose.Schema.Types.ObjectId,
        },
        text: String,
        link: String,
        metadata: mongoose.Schema.Types.Mixed,
    },
    {
        timestamps: true,
    }
);

// Index for most-used filters to improve performance
notificationSchema.index({ visible: 1, receiverId: 1, organizationId: 1 });

// tslint:disable-next-line variable-name
export const DBNotification = mongoose.model<INotification>(
    "notification",
    notificationSchema
);
