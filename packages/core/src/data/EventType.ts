export enum SystemEventType {
    NewsletterSubscription = "system.newsletter_subscription",
}

export enum OrganizationEventType {
    OrganizationCreated = "organization.created",
    OrganizationUpdated = "organization.updated",
    OrganizationLicenseUpdated = "organization.license.updated",
}

export enum CourseEventType {
    CoursePublishedInLibrary = "course.published_in_library",
    CourseCreated = "course.created",
    CourseArchived = "course.archived",
    CourseDeleted = "course.deleted",
    CourseUpdated = "course.updated",
    CourseUserAdded = "course.user.added",
    CourseUserRemoved = "course.user.removed",
    CourseUserUpdated = "course.user.updated",
}

export enum ModuleEventType {
    ModuleCreated = "module.created",
    ModuleUpdated = "module.updated",
    ModuleDeleted = "module.deleted",
}

export enum AssignmentEventType {
    AssignmentCreated = "assignment.created",
    AssignmentUpdated = "assignment.updated",
    AssignmentDeleted = "assignment.deleted",
}

export enum BlockEventType {
    BlockCreated = "block.created",
    BlockUpdated = "block.updated",
    BlockDeleted = "block.deleted",
}

export enum UserEventType {
    UserCreated = "user.created",
    UserDeleted = "user.deleted",
    UserUpdated = "user.updated",
}

export enum SubmissionEventType {
    SubmissionCreated = "submission.created",
    SubmissionDeleted = "submission.deleted",
    SubmissionReopened = "submission.reopened",
    SubmissionApproved = "submission.approved",
    SubmissionSubmitted = "submission.submitted",
    SubmissionBlockFeedbackGenerated = "submission.block.feedback_generated",
    SubmissionBlockCompleted = "submission.block.completed",
    SubmissionTeacherFeedbackAdded = "submission.teacher.feedback_added",
}

export type EventType =
    | SystemEventType
    | OrganizationEventType
    | CourseEventType
    | ModuleEventType
    | AssignmentEventType
    | BlockEventType
    | UserEventType
    | SubmissionEventType;
