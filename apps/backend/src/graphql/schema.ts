import {
    AnalyticsType,
    DatabaseDialect,
    Permission,
    PublicLicenseType,
    RoleType,
    SortingOrder,
} from "core";
import {
    BuildSchemaOptions,
    buildSchemaSync,
    registerEnumType,
    ResolverData,
} from "type-graphql";
import { RequestContext } from "../RequestContext";
import { ActionResolver } from "./action/Action.resolver";
import { AnalyticsBlockResolver } from "./analyticsblock/AnalyticsBlock.resolver";
import { AssignmentResolver } from "./assignment/Assignment.resolver";
import { AssignmentFilesResolver } from "./assignment/AssignmentFiles.resolver";
import { AssignmentGradingSchemeResolver } from "./assignment/AssignmentGradingScheme.resolver";
import { BlockResolver } from "./block/Block.resolver";
import { ChoiceResolver } from "./block/Choice.resolver";
import { CourseResolver } from "./course/Course.resolver";
import { CourseAnalyticsResolver } from "./course/CourseAnalytics.resolver";
import { CourseEnrollmentResolver } from "./course/CourseEnrollment.resolver";
import { CourseImageResolver } from "./course/CourseImage.resolver";
import { CourseSearchResolver } from "./course/CourseSearch.resolver";
import { CourseUsersResolver } from "./course/CourseUsers.resolver";
import { FileResolver } from "./file/File.resolver";
import { GradingSchemeResolver } from "./gradingScheme/GradingScheme.resolver";
import { InvitationResolver } from "./invitation/Invitation.resolver";
import { IOTestResolver } from "./ioTest/IOTest.resolver";
import { ModuleResolver } from "./module/Module.resolver";
import { NotificationResolver } from "./notification/Notification.resolver";
import { NotificationSearchResolver } from "./notification/NotificationSearch.resolver";
import { CourseAnalyticsBlockDefaultsResolver } from "./organization/CourseAnalyticsBlockDefaults.resolver";
import { OrganizationResolver } from "./organization/Organization.resolver";
import { OrganizationAnalyticsResolver } from "./organization/OrganizationAnalytics.resolver";
import { OrganizationImageResolver } from "./organization/OrganizationImage.resolver";
import { OrganizationLicenseResolver } from "./organization/OrganizationLicense.resolver";
import { OrganizationSearchResolver } from "./organization/OrganizationSearch.resolver";
import { OrganizationUsersResolver } from "./organization/OrganizationUsers.resolver";
import { SubmissionResolver } from "./submission/Submission.resolver";
import { SubmissionFilesResolver } from "./submission/SubmissionFiles.resolver";
import { SubmissionSearchResolver } from "./submission/SubmissionSearch.resolver";
import { SystemResolver } from "./system/System.resolver";
import { UnitTestResolver } from "./unitTest/UnitTest.resolver";
import { UserResolver } from "./user/User.resolver";
import { UserImageResolver } from "./user/UserImage.resolver";
import { UserNotificationsResolver } from "./user/UserNotifications.resolver";
import { UserSearchResolver } from "./user/UserSearch.resolver";

// enums

registerEnumType(AnalyticsType, {
    name: "AnalyticsType",
});

registerEnumType(DatabaseDialect, {
    name: "DatabaseDialect",
});

registerEnumType(RoleType, {
    name: "RoleType",
});

registerEnumType(Permission, {
    name: "Permission",
});

registerEnumType(SortingOrder, {
    name: "SortingOrder",
});

registerEnumType(PublicLicenseType, {
    name: "PublicLicenseType",
});

const options: BuildSchemaOptions = {
    validate: false,
    resolvers: [
        ActionResolver,
        AnalyticsBlockResolver,
        AssignmentFilesResolver,
        SubmissionResolver,
        SubmissionSearchResolver,
        AssignmentResolver,
        AssignmentGradingSchemeResolver,
        BlockResolver,
        ChoiceResolver,
        CourseAnalyticsResolver,
        CourseAnalyticsBlockDefaultsResolver,
        CourseImageResolver,
        CourseEnrollmentResolver,
        CourseUsersResolver,
        CourseSearchResolver,
        CourseResolver,
        FileResolver,
        GradingSchemeResolver,
        InvitationResolver,
        IOTestResolver,
        ModuleResolver,
        NotificationResolver,
        NotificationSearchResolver,
        OrganizationResolver,
        OrganizationAnalyticsResolver,
        OrganizationLicenseResolver,
        OrganizationImageResolver,
        OrganizationUsersResolver,
        OrganizationSearchResolver,
        SubmissionFilesResolver,
        SystemResolver,
        UserResolver,
        UserNotificationsResolver,
        UserImageResolver,
        UserSearchResolver,
        UnitTestResolver,
    ],
    authChecker: ({ context }: ResolverData<RequestContext>, roles: any[]) =>
        Boolean(context.user),
};

export const schema = buildSchemaSync(options);
