import { ApolloError } from "apollo-server-express";
import { SortingOrder } from "core";
import { DBOrganization } from "db/Organization";
import { RequestContext } from "RequestContext";
import {
    Args,
    Authorized,
    Ctx,
    Query,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { Organization } from "./Organization";
import { OrganizationSearchArgs } from "./OrganizationSearch.args";
import { OrganizationSearchResult } from "./OrganizationSearch.result";

export function regexEscape(input: string): string {
    return input.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

@Resolver(Organization)
export class OrganizationSearchResolver {
    @Authorized()
    @Query((returns) => OrganizationSearchResult)
    public async searchOrganizations(
        @Args() args: OrganizationSearchArgs,
        @Ctx() context: RequestContext
    ) {
        const {
            pageSize = 100,
            page = 1,
            orderBy = "name",
            order = SortingOrder.asc,
            term,
            showArchived = false,
        } = args;

        if (!context.isSysAdmin) {
            throw new UnauthorizedError();
        }

        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }

        // initial query object
        const query: any = {};

        if (!showArchived) {
            query.archived = { $ne: true };
        }

        // match search string
        if (term) {
            const _term = regexEscape(term);
            query.$or = [
                {
                    name: { $regex: _term, $options: "gi" },
                },
                {
                    website: { $regex: _term, $options: "gi" },
                },
            ];
        }

        const allowedFields = ["name", "createdAt", "country"];
        if (allowedFields.indexOf(orderBy) < 0) {
            throw new ApolloError(
                `Unknown order by field name: ${orderBy}. Expected: ${allowedFields}.`
            );
        }

        // do a count of the total
        const total = await DBOrganization.countDocuments(query);

        const items = await DBOrganization.find(query, undefined, {
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
