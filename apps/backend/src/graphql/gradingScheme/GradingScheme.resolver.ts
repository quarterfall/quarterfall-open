import { ApolloError } from "apollo-server-express";
import { ExitCode, gradingSchemeDefaults, Permission, ServerError } from "core";
import { DBGradingScheme } from "db/GradingScheme";
import { DBOrganization, IOrganization } from "db/Organization";
import { log } from "Logger";
import { computeGrade } from "operations/Grading.operation";
import { RequestContext } from "RequestContext";
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
import { Organization } from "../organization/Organization";
import { GradingScheme } from "./GradingScheme";
import { GradingSchemeUpdateInput } from "./GradingSchemeUpdate.input";
import { TestGradingSchemeResult } from "./TestGradingScheme.result";

const opt = { nullable: true };

@Resolver(Organization)
export class GradingSchemeResolver {
    @Authorized()
    @Mutation((returns) => Organization)
    public async createGradingScheme(@Ctx() context: RequestContext) {
        // check that the logged in user is admin of this organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        const organization = await DBOrganization.findById(
            context.organization?.id
        );

        if (!organization) {
            throw new UnauthorizedError();
        }

        await new DBGradingScheme({
            name: "Custom",
            description: "",
            code: `if (score <= 10) return "E";\nif (score <= 30) return "D";\nif (score <= 50) return "C";\nif (score <= 70) return "B";\nif (score <= 90) return "A";\nreturn "A+";`,
            isDefault: false,
            organizationId: context.organization?.id,
        }).save();

        log.notice(
            `Grading scheme is created in organization ${organization?.id}.`
        );

        // save the updated block and return it
        return organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async updateGradingScheme(
        @Ctx() context: RequestContext,
        @Arg("gradingSchemeId", (type) => ID) gradingSchemeId: string,
        @Arg("input", (type) => GradingSchemeUpdateInput)
        input: GradingSchemeUpdateInput
    ) {
        // check that the logged in user is admin of this organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }
        const organization = await DBOrganization.findById(
            context.organization?.id
        );

        if (!organization) {
            throw new UnauthorizedError();
        }

        if (input.isDefault) {
            const currentDefaultScheme = await DBGradingScheme.findOne({
                organizationId: organization.id,
                isDefault: true,
            });
            if (currentDefaultScheme) {
                currentDefaultScheme.isDefault = false;
                currentDefaultScheme.save();
            }
        }

        const gradingScheme = await DBGradingScheme.findByIdAndUpdate(
            gradingSchemeId,
            input,
            {
                new: true,
            }
        );

        if (!gradingScheme) {
            throw new ApolloError(
                `Grading scheme with id ${gradingSchemeId} not found.`,
                ServerError.NotFound
            );
        }

        gradingScheme.save();
        log.notice(
            `Grading scheme ${input.name} is updated in organization ${organization?.id}.`
        );

        // save the updated block and return it
        return organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async deleteGradingScheme(
        @Ctx() context: RequestContext,
        @Arg("gradingSchemeId", (type) => ID) gradingSchemeId: string
    ) {
        // check that the logged in user is admin of this organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        const organization = await DBOrganization.findById(
            context.organization?.id
        );

        if (!organization) {
            throw new UnauthorizedError();
        }

        if ((await DBGradingScheme.findById(gradingSchemeId))?.isDefault) {
            throw new UnauthorizedError();
        }

        await DBGradingScheme.findByIdAndDelete(gradingSchemeId);

        log.notice(
            `Grading scheme ${gradingSchemeId} is deleted in organization ${organization?.id}.`
        );

        // save the updated block and return it
        return organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async resetGradingSchemesToDefault(@Ctx() context: RequestContext) {
        // check that the logged in user is admin of this organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        const organization = await DBOrganization.findById(
            context.organization?.id
        );

        if (!organization) {
            throw new UnauthorizedError();
        }

        //Delete all grading schemes belonging to that organization
        await DBGradingScheme.deleteMany({ organizationId: organization._id });
        //Create default grading schemes
        await Promise.all(
            gradingSchemeDefaults.map(async (scheme) => {
                const newScheme = { ...scheme, id: undefined };
                await new DBGradingScheme({
                    ...newScheme,
                    organizationId: organization._id,
                }).save();
            })
        );

        log.notice(
            `Grading schemes are reset to default in organization ${organization?.id}.`
        );

        // save the updated block and return it
        return organization;
    }

    @Authorized()
    @Mutation((returns) => TestGradingSchemeResult)
    public async testGradingScheme(
        @Ctx() context: RequestContext,
        @Arg("testData", (type) => String) testData: string,
        @Arg("gradingSchemeCode", (type) => String)
        gradingSchemeCode: string
    ) {
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }
        const { score, questions } = JSON.parse(testData);
        if (!score && !questions) {
            throw new UnauthorizedError();
        }
        let testResult = await computeGrade({
            gradingSchemeCode,
            score,
            questions,
        });
        if (testResult.code !== ExitCode.NoError) {
            throw new UnauthorizedError();
        }

        if (typeof testResult?.result !== "string") {
            testResult.result = testResult?.result.toString();
        }
        return testResult;
    }

    @FieldResolver((type) => [GradingScheme], opt)
    public async gradingSchemes(@Root() root: IOrganization) {
        return DBGradingScheme.find({
            organizationId: root.id,
        });
    }
}
