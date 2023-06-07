import { ApolloError } from "apollo-server-express";
import { ServerError } from "core";
import { DBAssignment, IAssignment } from "db/Assignment";
import { DBNotification, INotification } from "db/Notification";
import { DBUser, IUser } from "db/User";
import { Assignment } from "graphql/assignment/Assignment";
import { User } from "graphql/user/User";
import { log } from "Logger";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Mutation,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { RequestContext } from "../../RequestContext";
import { Notification } from "./Notification";
import { NotificationInput } from "./Notification.input";

const opt = { nullable: true };

@Resolver(Notification)
export class NotificationResolver {
    //
    // Mutations
    //

    @Authorized()
    @Mutation((returns) => Notification)
    public async updateNotification(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: NotificationInput
    ) {
        // Get notification
        const notification = await context.loadById(DBNotification, id);
        if (!notification) {
            throw new ApolloError(
                "Notification not found",
                ServerError.NotFound
            );
        }

        // Check if user is the receiver
        if (!notification.receiverId.equals(context.user?.id)) {
            throw new UnauthorizedError();
        }

        // Update
        notification.set(input);
        return notification.save();
    }

    @Authorized()
    @Mutation((returns) => User)
    public async readAllNotifications(@Ctx() context: RequestContext) {
        // Update the notifications
        await DBNotification.updateMany(
            {
                read: { $ne: true },
                receiverId: context.user?.id,
                organizationId: context.organization?._id,
            },
            { read: true }
        );
        // Return the user
        return context.user;
    }

    @Authorized()
    @Mutation((returns) => User)
    public async deleteNotifications(
        @Ctx() context: RequestContext,
        @Arg("ids", (type) => [ID], opt) ids?: string[]
    ) {
        const query: any = {
            organizationId: context.organization?._id,
            receiverId: context.user?.id,
            hidden: { $ne: true },
        };
        if (ids) {
            query._id = { $in: ids };
        }
        // delete the notifications
        await DBNotification.deleteMany(query);

        log.notice(`Notifications with ids ${ids} deleted.`);

        // return the user
        return context.user;
    }

    //
    // Fields
    //

    @FieldResolver((type) => User)
    public async receiver(
        @Ctx() context: RequestContext,
        @Root() root: INotification
    ): Promise<IUser | null> {
        return context.loadById(DBUser, root.receiverId);
    }

    @FieldResolver((type) => User)
    public async actor(
        @Ctx() context: RequestContext,
        @Root() root: INotification
    ): Promise<IUser | null> {
        return context.loadById(DBUser, root.actorId);
    }

    @FieldResolver((type) => Assignment)
    public async assignment(
        @Ctx() context: RequestContext,
        @Root() root: INotification
    ): Promise<IAssignment | null> {
        return context.loadById(DBAssignment, root.subjectId);
    }
}
