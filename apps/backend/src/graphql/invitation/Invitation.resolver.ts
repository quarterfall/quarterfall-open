import { CourseEventType, courseRoles, NotificationType, RoleType } from "core";
import { DBCourse } from "db/Course";
import { DBInvitation, IInvitation } from "db/Invitation";
import { DBNotification } from "db/Notification";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { postEvent } from "event/Event";
import { Course } from "graphql/course/Course";
import { User } from "graphql/user/User";
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
import { Invitation } from "./Invitation";

const opt = { nullable: true };

@Resolver(Invitation)
export class InvitationResolver {
    @Authorized()
    @Mutation((returns) => User)
    public async acceptInvitation(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the invitation
        const invitation = await DBInvitation.findById(id);

        if (!invitation || !invitation.userId.equals(context.user?._id)) {
            throw new UnauthorizedError();
        }

        // retrieve the associated role
        const role = await DBRole.findById(invitation.roleId);
        if (!role) {
            throw new UnauthorizedError();
        }
        // retrieve the course
        const course = await DBCourse.findById(role.subjectId);
        if (!course) {
            throw new UnauthorizedError();
        }

        // retrieve the inviter
        const inviter = await DBUser.findById(invitation.inviterId);

        // activate the role and delete the invitation
        role.active = true;
        await role.save();
        await invitation.remove();

        const isStudent = role?.role === RoleType.courseStudent;

        postEvent({
            type: CourseEventType.CourseUserAdded,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                course: {
                    id: course?.id,
                    title: course?.title,
                    description: course?.description,
                },
                user: {
                    id: context?.user?.id,
                    firstName: context?.user?.firstName,
                    lastName: context?.user?.lastName,
                    emailAddress: context?.user?.emailAddress,
                },
            },
            metadata: {
                link: `/course/${course?.id}/students`,
            },
        });

        // create a notification
        await DBNotification.create({
            organizationId: course.organizationId,
            actorId: invitation.inviterId,
            subjectId: course._id,
            receiverId: context.user?._id,
            link: `${isStudent ? "/student" : ""}/course/${course?.id}`,
            type: NotificationType.AddedToCourse,
            metadata: {
                teacher: `${inviter?.firstName} ${inviter?.lastName}`,
                course: course?.title,
            },
        });

        return context.user;
    }

    @Authorized()
    @Mutation((returns) => User)
    public async declineInvitation(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the invitation
        const invitation = await DBInvitation.findById(id);

        if (!invitation || !invitation.userId.equals(context.user?._id)) {
            throw new UnauthorizedError();
        }

        // retrieve the associated role
        const role = await DBRole.findById(invitation.roleId);

        // delete the role and the invitation
        await role?.remove();
        await invitation.remove();

        return context.user;
    }

    @FieldResolver((type) => Course, opt)
    public async course(
        @Root() root: IInvitation,
        @Ctx() context: RequestContext
    ) {
        // retrieve the role of this invitation
        const role = await DBRole.findById(root.roleId);
        // verify that the role exists and that it's a course role
        if (!role || courseRoles.indexOf(role.role) < 0) {
            return null;
        }

        return DBCourse.findById(role.subjectId);
    }

    @FieldResolver((type) => User, opt)
    public async inviter(
        @Root() root: IInvitation,
        @Ctx() context: RequestContext
    ) {
        return DBUser.findById(root.inviterId);
    }
}
