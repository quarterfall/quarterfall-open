import { ApolloError } from "apollo-server-express";
import { SortingOrder } from "core";
import { DBNotification } from "db/Notification";
import { SearchArgs } from "graphql/search/Search.args";
import { RequestContext } from "RequestContext";
import { Args, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { NotificationSearchResult } from "./NotificationSearch.result";

export function regexEscape(input: string): string {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

@Resolver()
export class NotificationSearchResolver {
    @Authorized()
    @Query((returns) => NotificationSearchResult)
    public async searchNotifications(
        @Args() args: SearchArgs,
        @Ctx() context: RequestContext
    ) {
        const {
            pageSize = 100,
            page = 1,
            orderBy = "createdAt",
            order = SortingOrder.asc,
        } = args;

        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }

        const allowedFields = ["createdAt"];
        if (allowedFields.indexOf(orderBy) < 0) {
            throw new ApolloError(
                `Unknown order by field name: ${orderBy}. Expected: ${allowedFields}.`
            );
        }

        const query = {
            organizationId: context.organization?._id,
            receiverId: context.user?.id,
            hidden: { $ne: true },
        };

        // do a count of the total
        const total = await DBNotification.countDocuments(query);

        // retrieve the notifications
        const notifications = await DBNotification.find(query, undefined, {
            skip: (pageSize || 0) * (page - 1),
            limit: pageSize,
        }).sort(order === "desc" ? `-${orderBy}` : orderBy);

        return {
            notifications,
            total,
        };
    }
}
