import { ApolloError } from "apollo-server-express";
import { arrayMove, generateId, Permission, ServerError } from "core";
import { DBAction, IAction } from "db/Action";
import { DBAssignment } from "db/Assignment";
import { DBBlock, IBlock } from "db/Block";
import { DBCourse } from "db/Course";
import { DBModule } from "db/Module";
import { Action } from "graphql/action/Action";
import { log } from "Logger";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    ID,
    Int,
    Mutation,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { IOTest } from "./IOTest";
import { IOTestInput } from "./IOTest.input";

const opt = { nullable: true };

@Resolver(IOTest)
export class IOTestResolver {
    @Authorized()
    @Mutation((returns) => Action)
    public async addIOTestToAction(
        @Ctx() context: RequestContext,
        @Arg("actionId", (type) => ID) actionId: string,
        @Arg("input", (type) => IOTestInput) input: IOTestInput,
        @Arg("beforeIndex", (type) => Int, opt) beforeIndex?: number
    ): Promise<IAction> {
        const action = await DBAction.findById(actionId);
        if (!action) {
            throw new ApolloError(
                `Action with id ${actionId} not found.`,
                ServerError.NotFound
            );
        }
        // retrieve the block
        const block = await context.loadById(DBBlock, action.blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${action.blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this action
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        // add the action
        const newIOTestId = generateId();

        const index =
            (beforeIndex !== undefined
                ? beforeIndex
                : action.ioTests?.length) || 0;

        (action.ioTests || []).splice(
            index,
            0,
            Object.assign({
                id: newIOTestId,
                ...input,
            })
        );

        log.debug(
            `Unit test with id ${newIOTestId} added to action ${action.id}.`
        );

        // save the updated block and return it
        return action.save();
    }

    @Authorized()
    @Mutation((returns) => Action)
    public async deleteIOTest(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("actionId", (type) => ID) actionId: string
    ): Promise<IAction> {
        const action = await DBAction.findById(actionId);
        if (!action) {
            throw new ApolloError(
                `Action with id ${actionId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action.blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${action.blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this assignment
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        action.ioTests = (action.ioTests || []).filter((t) => t.id !== id);

        log.debug(`Unit test with id ${id} deleted from action ${actionId}.`);

        // save the updated block and return it
        return action.save();
    }

    @Authorized()
    @Mutation((returns) => Action)
    public async duplicateIOTest(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("actionId", (type) => ID) actionId: string
    ): Promise<IAction> {
        const action = await DBAction.findById(actionId);
        if (!action) {
            throw new ApolloError(
                `Action with id ${actionId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action.blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${action.blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this assignment
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        const tests = action?.ioTests || [];
        const test = tests?.find((t) => t.id === id);
        const testIndex = tests?.findIndex((t) => t.id === id);

        if (!test) {
            throw new UnauthorizedError();
        }

        const generateTestName = () => {
            const names = tests?.map((t) => t.name);
            for (let i = 1; i < names.length + 1; i++) {
                if (names.indexOf(`ioTest${i}`) === -1) {
                    return `ioTest${i}`;
                }
            }
            return `ioTest${tests.length + 1}`;
        };

        action.ioTests?.splice(testIndex + 1, 0, {
            ...test,
            id: generateId(),
            name: generateTestName(),
        });

        action.markModified("ioTests");

        log.debug(`Unit test with id ${id} duplicated in action ${actionId}.`);

        // save the updated block and return it
        return action.save();
    }

    @Authorized()
    @Mutation((returns) => Action)
    public async updateIOTest(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("actionId", (type) => ID) actionId: string,
        @Arg("input", (type) => IOTestInput) input: IOTestInput
    ): Promise<IAction> {
        const action = await DBAction.findById(actionId);
        if (!action) {
            throw new ApolloError(
                `Action with id ${actionId} not found.`,
                ServerError.NotFound
            );
        }
        // retrieve the block
        const block = await context.loadById(DBBlock, action.blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${action.blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this assignment
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        // update the choice
        action.ioTests = (action.ioTests || []).map((test) => {
            if (test.id === id) {
                return Object.assign(test, input);
            } else {
                return test;
            }
        });

        action.markModified("ioTests");

        log.debug(`Unit test with id ${id} updated in action ${actionId}.`);

        // save the updated action and return it
        return action.save();
    }

    @Authorized()
    @Mutation((returns) => Action)
    public async moveIOTestToIndex(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("actionId", (type) => ID) actionId: string,
        @Arg("index", (type) => Int) index: number
    ): Promise<IAction> {
        const action = await DBAction.findById(actionId);
        if (!action) {
            throw new ApolloError(
                `Action with id ${actionId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action.blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${action.blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this assignment
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        const sourceTests = action.ioTests || [];

        const oldIndex = sourceTests.findIndex((value) => value.id === id);
        // check that the old index is valid
        if (oldIndex < 0 || oldIndex >= sourceTests.length) {
            throw new ApolloError(`Invalid existing index ${oldIndex}.`);
        }
        let destinationTests = sourceTests;

        if (index < 0 || index > destinationTests.length) {
            throw new ApolloError(`Invalid index ${index}.`);
        }

        arrayMove({
            array: sourceTests,
            oldIndex,
            newIndex: index,
            newArray: destinationTests,
        });

        action.save();

        log.debug(
            `Unit test with id ${id} moved to index ${index} in action ${action.id}.`
        );

        return action;
    }

    private async canUpdateBlock(
        context: RequestContext,
        block: IBlock
    ): Promise<boolean> {
        // retrieve the assignment, module and course
        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );

        const module = await context.loadById(DBModule, assignment?.moduleId);
        const course = await context.loadById(DBCourse, module?.courseId);

        // check if the user can update the course
        return (
            context.can(Permission.updateCourse, course) && !course?.archived
        );
    }
}
