import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { OrganizationMenu, OrganizationMenuItem } from "./OrganizationMenu";

export type OrganizationLayoutProps = Pick<
    DrawerLayoutProps<OrganizationMenuItem>,
    Exclude<keyof DrawerLayoutProps<OrganizationMenuItem>, "component">
>;

export function OrganizationLayout(props: OrganizationLayoutProps) {
    return <DrawerLayout {...props} component={OrganizationMenu} />;
}
