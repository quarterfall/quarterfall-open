import { ApolloError } from "apollo-server-express";
import { ActionType, arrayMove, Permission, ServerError } from "core";
import { DBAction, IAction } from "db/Action";
import { DBAssignment } from "db/Assignment";
import { DBBlock, IBlock } from "db/Block";
import { DBCourse } from "db/Course";
import { DBModule } from "db/Module";
import { Block } from "graphql/block/Block";
import { log } from "Logger";
import { copyAction, deleteAction } from "operations/Action.operation";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Int,
    Mutation,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { Action } from "./Action";
// import { Action } from "./Action";
import { ActionInput } from "./Action.input";

const opt = { nullable: true };

@Resolver(Action)
export class ActionResolver {
    @Authorized()
    @Mutation((returns) => Block)
    public async addAction(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("type", (type) => String) type: ActionType,
        @Arg("teacherOnly", (type) => Boolean, opt) teacherOnly: boolean,
        @Arg("beforeIndex", (type) => Int, opt) beforeIndex?: number
    ) {
        // retrieve the block
        const block = await context.loader(DBBlock).load(blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this assignment
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        // add the action
        const action = await DBAction.create({
            blockId: block.id,
            type,
            teacherOnly: type === ActionType.Scoring ? true : teacherOnly,
        });

        await action.save();

        const index =
            (beforeIndex !== undefined ? beforeIndex : block.actions?.length) ||
            0;

        (block.actions || []).splice(index, 0, action._id);

        log.debug(`Action with id ${action.id} added to block ${block.id}.`);

        // save the updated block and raeturn it
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async copyAction(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("keepIndex", (type) => Boolean, opt) keepIndex?: boolean
    ) {
        // retrieve the action
        const action = await context.loadById(DBAction, id);

        // if the action doesn't exist, throw an error.
        if (!action) {
            throw new ApolloError(`Action with id ${id} not found.`);
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action?.blockId);

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

        // make a copy of the action
        const actionCopy = await copyAction(action._id, block._id, keepIndex);

        log.notice(
            `Action with id ${action.id} is duplicated with id ${actionCopy?.id} in block "${block.title}" (${block.id}).`
        );

        // save the updated block and return it
        return block.save();
    }
    @Authorized()
    @Mutation((returns) => Block)
    public async deleteAction(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the action
        const action = await context.loadById(DBAction, id);

        // if the action doesn't exist, throw an error.
        if (!action) {
            throw new ApolloError(`Action with id ${id} not found.`);
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action?.blockId);

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

        // delete the action from the block
        await deleteAction(action);

        log.debug(`Action with id ${id} deleted from block ${block.id}.`);

        // save the updated block and return it
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async updateAction(
        @Arg("id", (type) => ID) id: string,
        @Arg("input", (type) => ActionInput) input: ActionInput,
        @Ctx() context: RequestContext
    ) {
        const action = await context.loadById(DBAction, id);

        if (!action) {
            throw new ApolloError(
                `Action with id ${id} not found`,
                ServerError.NotFound
            );
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action?.blockId);
        if (!block) {
            throw new ApolloError(
                `Block with id ${action?.blockId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this assignment
        if (!(await this.canUpdateBlock(context, block))) {
            throw new UnauthorizedError();
        }

        // set the input
        action.set(input);
        action.save();

        log.debug(`Action with id ${id} updated in block ${block.id}.`);

        // save the updated block and return it
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async moveActionToIndex(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("index", (type) => Int) index: number
    ): Promise<IBlock> {
        const action = await context.loadById(DBAction, id);

        if (!action) {
            throw new ApolloError(
                `Action with id ${id} not found`,
                ServerError.NotFound
            );
        }

        // retrieve the block
        const block = await context.loadById(DBBlock, action?.blockId);

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

        const sourceActions = block.actions || [];
        const oldIndex = sourceActions.findIndex((value) =>
            value._id.equals(action._id)
        );
        // check that the old index is valid
        if (oldIndex < 0 || oldIndex >= sourceActions.length) {
            throw new ApolloError(`Invalid existing index ${oldIndex}.`);
        }
        let destinationActions = sourceActions;

        if (index < 0 || index > destinationActions.length) {
            throw new ApolloError(`Invalid index ${index}.`);
        }

        arrayMove({
            array: sourceActions,
            oldIndex,
            newIndex: index,
            newArray: destinationActions,
        });

        block.save();

        log.debug(
            `Action with id ${action.id} moved to index ${index} in block ${block.id}.`
        );

        return block;
    }

    @FieldResolver((type) => String)
    public gitPrivateKey(@Root() root: IAction) {
        if (root.gitPrivateKey) {
            return "******";
        } else {
            return "";
        }
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
