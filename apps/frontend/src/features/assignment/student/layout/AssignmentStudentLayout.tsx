import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";
import {
    AssignmentStudentSidebar,
    AssignmentStudentSidebarItem,
} from "./AssignmentStudentSidebar";

export type AssignmentStudentLayoutProps = Pick<
    DrawerLayoutProps<AssignmentStudentSidebarItem>,
    Exclude<keyof DrawerLayoutProps<AssignmentStudentSidebarItem>, "component">
> & {
    assignment: Assignment;
    blockId?: string;
    submission?: Submission;
    publicKey?: string;
    step?: number;
    handleStep?: (_: number) => () => void;
};

export function AssignmentStudentLayout(props: AssignmentStudentLayoutProps) {
    const {
        assignment,
        blockId,
        submission,
        publicKey,
        step,
        handleStep,
        ...rest
    } = props;
    return (
        <DrawerLayout
            {...rest}
            component={AssignmentStudentSidebar}
            menuProps={{
                assignment,
                blockId,
                submission,
                publicKey,
                step,
                handleStep,
            }}
        />
    );
}
