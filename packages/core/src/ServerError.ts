export enum ServerError {
    NotFound = "NotFound",
    NotAuthorized = "NotAuthorized",
    EmailAddressAlreadyExists = "EmailAddressAlreadyExists",
    PasswordIncorrect = "PasswordIncorrect",
    AtLeastOneAdminError = "AtLeastOneAdminError",
    InternalError = "InternalError",
    UserAlreadyHasRole = "UserAlreadyHasRole",
    UsersCannotBeCourseAdmins = "UsersCannotBeCourseAdmins",
    StudentCreditsShortage = "StudentCreditsShortage",
    TeacherQuotaExceeded = "TeacherQuotaExceeded",
    LicenseExpired = "LicenseExpired",
}

function extractErrorCodes(error: any): string[] {
    const errorCodes: string[] = [];
    for (const e of error.graphQLErrors || []) {
        if (e.extensions?.code) {
            errorCodes.push(e.extensions.code);
        }
    }
    for (const e of error.networkError?.result?.errors || []) {
        if (e.extensions?.code) {
            errorCodes.push(e.extensions.code);
        }
    }
    return errorCodes;
}

export function hasErrorCode(error: any, errorCode: ServerError): boolean {
    const codes = extractErrorCodes(error);
    return codes.indexOf(errorCode) >= 0;
}

export function extractErrorCode(error: any): ServerError {
    const codes = extractErrorCodes(error);
    if (codes.length > 0) {
        return codes[0] as ServerError;
    } else {
        return ServerError.InternalError;
    }
}
