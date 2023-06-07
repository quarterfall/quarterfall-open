import { Permission, RoleType } from "core";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import dynamic from "next/dynamic";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { AssignmentViewerPage } from "./AssignmentViewerPage";

const AssignmentEditorPage = dynamic(
    () => import("routes/assignment/staff/AssignmentEditorPage"),
    { ssr: false }
);

export interface AssignmentHomePageProps {
    assignment: Assignment;
}

export function AssignmentHomePage(props: AssignmentHomePageProps) {
    const { assignment } = props;
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;

    if (
        !can(Permission.readCourse, course) ||
        course?.role === RoleType.courseStudent
    ) {
        return <AccessErrorPage />;
    } else if (can(Permission.updateCourse, course)) {
        return <AssignmentEditorPage />;
    } else {
        return <AssignmentViewerPage />;
    }
}
