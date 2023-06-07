import { ApolloError } from "apollo-server-express";
import { Permission, SortingOrder } from "core";
import { DBAssignment, IAssignment } from "db/Assignment";
import { DBCourse } from "db/Course";
import { DBModule, IModule } from "db/Module";
import { DBSubmission, ISubmission } from "db/Submission";
import { DBUser } from "db/User";
import { RequestContext } from "RequestContext";
import {
    Args,
    Authorized,
    Ctx,
    Query,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { SubmissionSearchArgs } from "./SubmissionSearch.args";
import { SubmissionSearchResult } from "./SubmissionSearch.result";

export function regexEscape(input: string): string {
    return input.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

@Resolver()
export class SubmissionSearchResolver {
    @Authorized()
    @Query((returns) => SubmissionSearchResult)
    public async searchSubmissions(
        @Ctx() context: RequestContext,
        @Args() args: SubmissionSearchArgs
    ) {
        const {
            pageSize = 100,
            page = 1,
            courseId,
            moduleIds,
            assignmentIds,
            userIds,
            hideApproved,
            hideUnapproved,
            orderBy = "lastName",
            order = SortingOrder.asc,
            term,
        } = args;

        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }
        if (courseId) {
            const course = await context.loadById(DBCourse, courseId);
            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
        }

        if (
            moduleIds?.length === 0 ||
            assignmentIds?.length === 0 ||
            userIds?.length === 0
        ) {
            // we're done since the module, assignment, or user list is empty
            return {
                items: [],
                total: 0,
            };
        }

        // retrieve the assignments and modules
        let assignments: IAssignment[];
        let modules: IModule[];

        if (assignmentIds?.length) {
            // retrieve the assignments and associated modules
            assignments = await context.loadMany(DBAssignment, assignmentIds);
            modules = await context.loadMany(
                DBModule,
                assignments.map((a) => a.moduleId)
            );
            // filter out any assignments where we didn't find a module
            assignments = assignments.filter((a) =>
                modules.find((m) => a.moduleId.equals(m._id))
            );
        } else {
            // retrieve the modules
            modules = await DBModule.find(
                moduleIds?.length
                    ? {
                          _id: { $in: moduleIds },
                          courseId,
                      }
                    : { courseId }
            );
            // find the assignments of the specified modules
            assignments = await DBAssignment.find({
                moduleId: { $in: modules.map((m) => m.id) },
            });
        }

        // query object
        const query: any = {
            submittedDate: { $exists: true },
            assignmentId: { $in: assignments.map((m) => m.id) },
        };

        // add the user ids
        if (userIds?.length) {
            query.userId = { $in: userIds };
        }

        if (hideApproved) {
            query.isApproved = { $ne: true };
        }

        if (hideUnapproved) {
            query.isApproved = { $eq: true };
        }

        const allowedFields = [
            "firstName",
            "lastName",
            "submittedDate",
            "rating",
            "score",
            "grade",
            "assignmentTitle",
            "moduleTitle",
        ];
        if (allowedFields.indexOf(orderBy) < 0) {
            throw new ApolloError(
                `Unknown order by field name: ${orderBy}. Expected: ${allowedFields}.`
            );
        }

        // retrieve all submissions
        const submissions = await DBSubmission.find(query);

        // find the users associated with the submissions
        const users = await context.loadMany(
            DBUser,
            submissions.map((a) => a.userId || "")
        );

        // add metadata to the submissions
        for (const submission of submissions) {
            const assignment = assignments.find((a) =>
                submission.assignmentId.equals(a._id)
            );
            submission.metadata = {
                user: users.find((u) => submission.userId?.equals(u._id)),
                assignment,
                module: modules.find((m) => assignment?.moduleId.equals(m._id)),
            };
        }

        // filter by term
        const submissionsFiltered = submissions.filter((submission) => {
            const { user, assignment, module } = submission.metadata;

            if (!term) {
                return true;
            } else {
                return `${user.firstName} ${user.lastName} ${user.emailAddress} ${assignment?.title} ${module?.title}`
                    .toLowerCase()
                    .includes(term.toLowerCase());
            }
        });

        // different multiplier depending on order direction
        const multiplier = order === "desc" ? -1 : 1;

        const byNameSortFunction = (subA: ISubmission, subB: ISubmission) => {
            const fieldA: string =
                subA.metadata?.user[orderBy].toLowerCase().trim() || "";
            const fieldB: string =
                subB.metadata?.user[orderBy].toLowerCase().trim() || "";
            return multiplier * fieldA.localeCompare(fieldB);
        };

        const byAssignmentTitleSortFunction = (
            subA: ISubmission,
            subB: ISubmission
        ) => {
            const fieldA: string =
                subA.metadata?.assignment?.title?.toLowerCase().trim() || "";
            const fieldB: string =
                subB.metadata?.assignment?.title?.toLowerCase().trim() || "";
            return multiplier * fieldA.localeCompare(fieldB);
        };

        const byAssignmentGradeSortFunction = (
            subA: ISubmission,
            subB: ISubmission
        ) => {
            const fieldA: string = subA.grade?.toLowerCase().trim() || "";
            const fieldB: string = subB.grade?.toLowerCase().trim() || "";
            return multiplier * fieldA.localeCompare(fieldB);
        };

        const byAssignmentScoreSortFunction = (
            subA: ISubmission,
            subB: ISubmission
        ) => {
            const fieldA: number = subA.score || 0;
            const fieldB: number = subB.score || 0;
            return multiplier * (fieldA - fieldB);
        };

        const byModuleTitleSortFunction = (
            subA: ISubmission,
            subB: ISubmission
        ) => {
            const fieldA: string =
                subA.metadata?.module?.title?.toLowerCase().trim() || "";
            const fieldB: string =
                subB.metadata?.module?.title?.toLowerCase().trim() || "";
            return multiplier * fieldA.localeCompare(fieldB);
        };

        const byRatingSortFunction = (subA: ISubmission, subB: ISubmission) => {
            const fieldA: number = subA.rating || 0;
            const fieldB: number = subB.rating || 0;
            return multiplier * (fieldA - fieldB);
        };

        const byDateSortFunction = (subA: ISubmission, subB: ISubmission) => {
            const fieldA: number = (subA.submittedDate || new Date()).getTime();
            const fieldB: number = (subB.submittedDate || new Date()).getTime();
            return multiplier * (fieldA - fieldB);
        };

        // sort the submissions by the desired field
        const submissionsSorted = submissionsFiltered.sort((subA, subB) => {
            switch (orderBy) {
                case "firstName":
                case "lastName":
                    return byNameSortFunction(subA, subB);
                case "submittedDate":
                    return byDateSortFunction(subA, subB);
                case "rating":
                    return byRatingSortFunction(subA, subB);
                case "assignmentTitle":
                    return byAssignmentTitleSortFunction(subA, subB);
                case "score":
                    return byAssignmentScoreSortFunction(subA, subB);
                case "grade":
                    return byAssignmentGradeSortFunction(subA, subB);
                case "moduleTitle":
                    return byModuleTitleSortFunction(subA, subB);
                default:
                    return 0; // no sorting, but should never happen
            }
        });

        // determine the subset of submissions to send back
        const sliceStart = (pageSize || 0) * (page - 1);
        const sliceEnd = sliceStart + pageSize;
        const items = submissionsSorted.slice(sliceStart, sliceEnd);

        return {
            items,
            total: submissionsSorted.length,
        };
    }
}
