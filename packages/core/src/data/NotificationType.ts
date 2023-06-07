export enum NotificationType {
    StickerReceived = "stickerReceived", // teacher has given the student a sticker
    CommentRatingReceived = "commentRatingReceived", // teacher has given the student a comment or rating
    SubmissionReopened = "submissionReopened", // teacher has reopened a submission of an assignment
    SubmissionDeleted = "submissionDeleted", // teacher has deleted a submission of an assignment
    SubmissionApproved = "submissionApproved", // teacher has approved a submission of an assignment
    AddedToCourse = "addedToCourse", // you have been added to a course
}
