import { ICourse } from "db/Course";
import { IOrganization } from "db/Organization";
import { IUser } from "db/User";

export interface CourseCreatedEventData {
    source?: Partial<ICourse>;
    course: Partial<ICourse>;
    user: Partial<IUser>;
    organization: Partial<IOrganization>;
}
