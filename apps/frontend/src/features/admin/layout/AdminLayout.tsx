import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { AdminMenu, AdminMenuItem } from "./AdminMenu";

export type AdminLayoutProps = Pick<
    DrawerLayoutProps<AdminMenuItem>,
    Exclude<keyof DrawerLayoutProps<AdminMenuItem>, "component">
>;

export function AdminLayout(props: AdminLayoutProps) {
    return <DrawerLayout {...props} component={AdminMenu} />;
}
