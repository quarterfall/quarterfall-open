import { ApolloError } from "apollo-server-express";
import { generateId, Permission, ServerError } from "core";
import { DBAssignment, IAssignment } from "db/Assignment";
import { DBBlock, IBlock } from "db/Block";
import { DBCourse, ICourse } from "db/Course";
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
import { Block } from "./Block";
import { ChoiceInput } from "./Choice.input";

const opt = { nullable: true };

@Resolver()
export class ChoiceResolver {
    @Authorized()
    @Mutation((returns) => Block)
    public async addChoice(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("input", (type) => ChoiceInput, opt) input: string
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to change this block
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );

        block.choices = block.choices || [];

        let extraInput: any;

        if (assignment?.assessmentType) {
            extraInput = {
                correctScore: 100,
                wrongScore: 0,
            };
        }

        // add the choice
        block.choices = block.choices.concat(
            Object.assign(
                {
                    id: generateId(),
                    text: "",
                    correct:
                        block.choices?.length === 0 && !block.multipleCorrect,
                },
                input,
                extraInput || {}
            )
        );

        log.notice(`Added choice to block ${block.id}.`);

        // save the updated block and return it
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async deleteChoice(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("choiceId", (type) => ID) choiceId: string
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to change this block
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // delete the choice from the choice array
        block.choices = (block.choices || []).filter(
            (choice) => choice.id !== choiceId
        );

        log.notice(
            `Choice with id ${choiceId} deleted from block ${block.id}.`
        );

        // save the updated block and return it
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async updateChoice(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("choiceId", (type) => ID) choiceId: string,
        @Arg("input", (type) => ChoiceInput) input: ChoiceInput
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to change this block
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // update the choice
        block.choices = (block.choices || []).map((choice) => {
            if (choice.id === choiceId) {
                return Object.assign(choice, input);
            } else {
                if (!block.multipleCorrect && input.correct) {
                    choice.correct = false;
                }
                return choice;
            }
        });
        block.markModified("choices");

        log.notice(
            `Choice with id ${choiceId} updated in block ${block.id}.`,
            input
        );

        // save the updated block and return it
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async updateMultipleChoices(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("input", (type) => ChoiceInput) input: ChoiceInput
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to change this block
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        for (const choice of block?.choices || []) {
            await this.updateChoice(context, blockId, choice.id, input);
        }

        return block;
    }

    private async retrieveCourseFromBlock(
        context: RequestContext,
        block?: IBlock | null
    ): Promise<ICourse | null> {
        if (!block) {
            return null;
        }

        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );
        return this.retrieveCourseFromAssignment(context, assignment);
    }

    private async retrieveCourseFromAssignment(
        context: RequestContext,
        assignment?: IAssignment | null
    ): Promise<ICourse | null> {
        if (!assignment) {
            return null;
        }

        const module = await context.loadById(DBModule, assignment.moduleId);
        return context.loadById(DBCourse, module?.courseId);
    }
}
