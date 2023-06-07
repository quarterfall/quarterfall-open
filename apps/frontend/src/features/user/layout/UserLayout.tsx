import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { UserSidebar, UserSidebarItem } from "./UserSidebar";

export type UserLayoutProps = Pick<
    DrawerLayoutProps<UserSidebarItem>,
    Exclude<keyof DrawerLayoutProps<UserSidebarItem>, "component">
>;

export function UserLayout(props: UserLayoutProps) {
    return <DrawerLayout {...props} component={UserSidebar} />;
}
