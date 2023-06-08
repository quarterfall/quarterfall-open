import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { Submission } from "interface/Submission.interface";
import { SubmissionSidebar, SubmissionSidebarItem } from "./SubmissionSidebar";

export type SubmissionLayoutProps = Pick<
    DrawerLayoutProps<SubmissionSidebarItem>,
    Exclude<keyof DrawerLayoutProps<SubmissionSidebarItem>, "component">
> & {
    submission: Submission;
    questionId?: string;
    showGradingActions?: boolean;
};

export function SubmissionLayout(props: SubmissionLayoutProps) {
    const {
        submission,
        questionId,
        showGradingActions = false,
        ...rest
    } = props;
    return (
        <DrawerLayout
            {...rest}
            component={SubmissionSidebar}
            menuProps={{ submission, questionId, showGradingActions }}
        />
    );
}
