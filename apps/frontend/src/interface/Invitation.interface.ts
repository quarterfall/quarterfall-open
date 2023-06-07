import { Course } from "./Course.interface";
import { User } from "./User.interface";

export interface Invitation {
    id: string;
    course: Course;
    inviter: User;
}
