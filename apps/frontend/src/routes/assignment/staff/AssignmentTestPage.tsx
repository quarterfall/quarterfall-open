import { Permission } from "core";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { AssignmentStudentViewPage } from "routes/assignment/student/AssignmentStudentViewPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";

export interface AssignmentTestPageProps {
    assignment: Assignment;
}

export function AssignmentTestPage(props: AssignmentTestPageProps) {
    const { assignment } = props;
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;

    if (!can(Permission.testAssignment, course)) {
        return <AccessErrorPage />;
    } else {
        return <AssignmentStudentViewPage assignment={assignment} />;
    }
}
