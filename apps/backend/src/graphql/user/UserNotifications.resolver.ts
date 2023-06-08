import { DBNotification, INotification } from "db/Notification";
import { Notification } from "graphql/notification/Notification";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    Int,
    Resolver,
} from "type-graphql";
import { RequestContext } from "../../RequestContext";
import { User } from "./User";

const opt = { nullable: true };

@Resolver(User)
export class UserNotificationsResolver {
    //
    // Queries
    //

    @Authorized()
    @FieldResolver((type) => [Notification])
    public async notifications(
        @Ctx() context: RequestContext,
        @Arg("limit", () => Int, opt) limit = 0
    ): Promise<INotification[]> {
        return DBNotification.find({
            organizationId: context.organization?._id,
            receiverId: context.user?.id,
            hidden: { $ne: true },
        })
            .sort({ createdAt: "desc" })
            .limit(limit > 0 ? Math.floor(limit) : 0);
    }

    @Authorized()
    @FieldResolver(() => Int)
    public async unreadNotifications(@Ctx() context: RequestContext) {
        return DBNotification.countDocuments({
            organizationId: context.organization?._id,
            receiverId: context.user?.id,
            hidden: { $ne: true },
            read: { $ne: true },
        });
    }
}
