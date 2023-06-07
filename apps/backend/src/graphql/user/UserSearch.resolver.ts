import { ApolloError } from "apollo-server-express";
import { SortingOrder } from "core";
import { DBUser } from "db/User";
import { SearchArgs } from "graphql/search/Search.args";
import { RequestContext } from "RequestContext";
import {
    Args,
    Authorized,
    Ctx,
    Query,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { User } from "./User";
import { UserSearchResult } from "./UserSearch.result";

export function regexEscape(input: string): string {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

@Resolver(User)
export class UserSearchResolver {
    @Authorized()
    @Query((returns) => UserSearchResult)
    public async searchAllUsers(
        @Args() args: SearchArgs,
        @Ctx() context: RequestContext
    ) {
        const {
            pageSize = 100,
            page = 1,
            orderBy = "lastName",
            order = SortingOrder.asc,
            term,
        } = args;

        // check that the user is a sys admin
        if (!context.isSysAdmin) {
            throw new UnauthorizedError();
        }

        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }

        // initial query object with the organization id
        const query: any = {};

        // match search string
        if (term) {
            const _term = regexEscape(term);
            query.$or = [
                {
                    firstName: { $regex: _term, $options: "gi" },
                },
                {
                    lastName: { $regex: _term, $options: "gi" },
                },
                {
                    emailAddress: { $regex: _term, $options: "gi" },
                },
            ];
        }

        const allowedFields = ["firstName", "lastName", "emailAddress"];
        if (allowedFields.indexOf(orderBy) < 0) {
            throw new ApolloError(
                `Unknown order by field name: ${orderBy}. Expected: ${allowedFields}.`
            );
        }

        // do a count of the total
        const total = await DBUser.countDocuments(query);

        const items = await DBUser.find(query, undefined, {
            skip: (pageSize || 0) * (page - 1),
            limit: pageSize,
        })
            .sort({ [orderBy]: order })
            .collation({ locale: "en", alternate: "shifted" });

        return {
            items,
            total,
        };
    }
}
