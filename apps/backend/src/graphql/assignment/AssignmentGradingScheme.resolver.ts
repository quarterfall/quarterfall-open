import { ApolloError } from "apollo-server-express";
import { Permission, ServerError } from "core";
import { DBAssignment } from "db/Assignment";
import { DBCourse } from "db/Course";
import { DBGradingScheme } from "db/GradingScheme";
import { DBModule } from "db/Module";
import { log } from "Logger";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    ID,
    Mutation,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { Assignment } from "./Assignment";

const opt = { nullable: true };

@Resolver(Assignment)
export class AssignmentGradingSchemeResolver {
    @Authorized()
    @Mutation((returns) => Assignment)
    public async changeAssignmentGradingScheme(
        @Ctx() context: RequestContext,
        @Arg("assignmentId", (type) => ID) assignmentId: string,
        @Arg("gradingSchemeId", (type) => String) gradingSchemeId?: string
    ) {
        let gradingScheme = await DBGradingScheme.findById(gradingSchemeId);
        if (!gradingScheme) {
            throw new ApolloError(
                `Grading scheme ${gradingSchemeId} not found.`,
                ServerError.NotFound
            );
        }
        if (!context?.organization?._id.equals(gradingScheme.organizationId)) {
            throw new ApolloError(
                `Grading scheme ${gradingSchemeId} doesn't belong to organization ${context?.organization?.id}`,
                ServerError.NotAuthorized
            );
        }

        // retrieve the assignment
        const assignment = await context.loadById(DBAssignment, assignmentId);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${assignmentId} not found.`,
                ServerError.NotFound
            );
        }

        const module = await context.loadById(DBModule, assignment?.moduleId);
        const course = await context.loadById(DBCourse, module?.courseId);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        assignment.gradingSchemeName = gradingScheme?.name;
        assignment.gradingSchemeDescription = gradingScheme?.description;
        assignment.gradingSchemeCode = gradingScheme?.code;

        log.notice(
            `Grading scheme is changed to ${gradingSchemeId} in assignment ${assignment?.id}.`
        );

        // save the updated block and return it
        return assignment.save();
    }
}
