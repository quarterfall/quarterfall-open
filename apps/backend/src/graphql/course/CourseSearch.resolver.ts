import { ApolloError } from "apollo-server-express";
import { courseRoles, Permission, SortingOrder } from "core";
import { DBCourse } from "db/Course";
import { DBRole } from "db/Role";
import { Course } from "graphql/course/Course";
import { RequestContext } from "RequestContext";
import {
    Args,
    Authorized,
    Ctx,
    Query,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { CourseSearchArgs } from "./CourseSearch.args";
import { CourseSearchResult } from "./CourseSearch.result";

export function regexEscape(input: string): string {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export enum CourseSearchTypes {
    OpenCourses,
    AllOpenCourse,
    OrganizationCourses,
    AllOrganizationCourses,
}

@Resolver(Course)
export class CourseSearchResolver {
    @Authorized()
    @Query((returns) => CourseSearchResult)
    public async searchCourses(
        @Args() args: CourseSearchArgs,
        @Ctx() context: RequestContext
    ) {
        // make sure the user can read the organization
        if (!context.can(Permission.readOrganization)) {
            throw new UnauthorizedError();
        }
        // make sure the user can view other courses
        if (args.allCourses && !context.can(Permission.readAnyCourse)) {
            throw new UnauthorizedError();
        }

        return this._searchCourses(args, context);
    }

    @Query((returns) => CourseSearchResult)
    public async searchLibraryCourses(
        @Args() args: CourseSearchArgs,
        @Ctx() context: RequestContext
    ) {
        return this._searchCourses(args, context, true);
    }

    public async _searchCourses(
        args: CourseSearchArgs,
        context: RequestContext,
        libraryCourses = false
    ) {
        const {
            pageSize = 100,
            page = 1,
            orderBy = "title",
            order = SortingOrder.asc,
            term,
            allCourses = false,
            hideArchived = false,
        } = args;

        // verify that the page number is positive
        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }

        // initial query object
        const query: any = {
            $or: [],
        };

        if (libraryCourses) {
            query.library = true;
        } else if (context.organization) {
            query.organizationId = context.organization._id;

            if (allCourses) {
                query.$or.push({ visible: true });
            }
            // find all the user roles related to a course
            const roles = await DBRole.find({
                userId: context.user?.id,
                role: { $in: courseRoles },
                active: true,
            });
            // add the course ids to the query
            query.$or.push({
                _id: { $in: roles.map((role) => role.subjectId) },
            });
        } else {
            query.userId = context.user?._id;
        }

        // only return non-archived courses
        if (hideArchived) {
            query.archived = { $ne: true };
        }

        // match search string
        if (term) {
            const _term = regexEscape(term);
            query.$and = [
                {
                    $or: [
                        {
                            title: { $regex: _term, $options: "gi" },
                        },
                        {
                            code: { $regex: _term, $options: "gi" },
                        },
                    ],
                },
            ];
        }

        const allowedFields = ["code", "title", "startDate", "endDate"];
        if (allowedFields.indexOf(orderBy) < 0) {
            throw new ApolloError(
                `Unknown order by field name: ${orderBy}. Expected: ${allowedFields}.`
            );
        }

        // delete empty $or if needed
        if (query.$or.length === 0) {
            delete query.$or;
        }

        // do a count of the total
        const total = await DBCourse.countDocuments(query);

        const items = await DBCourse.find(query, undefined, {
            skip: (pageSize || 0) * (page - 1),
            limit: pageSize,
        })
            .sort({ [orderBy]: order })
            .collation({ locale: "en", alternate: "shifted" });
        context.prime(DBCourse, items);

        return {
            items,
            total,
        };
    }
}
