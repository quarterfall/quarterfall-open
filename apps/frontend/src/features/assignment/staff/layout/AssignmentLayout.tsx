import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { Assignment } from "interface/Assignment.interface";
import { AssignmentSidebar, AssignmentSidebarItem } from "./AssignmentSidebar";

export type AssignmentLayoutProps = Pick<
    DrawerLayoutProps<AssignmentSidebarItem>,
    Exclude<keyof DrawerLayoutProps<AssignmentSidebarItem>, "component">
> & {
    assignment: Assignment;
    blockId?: string;
};

export function AssignmentLayout(props: AssignmentLayoutProps) {
    const { assignment, blockId, ...rest } = props;
    return (
        <DrawerLayout
            {...rest}
            component={AssignmentSidebar}
            menuProps={{ assignment, blockId }}
        />
    );
}
