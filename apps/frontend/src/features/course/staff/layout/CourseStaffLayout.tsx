import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";
import { useCourseLayoutData } from "./api/CourseLayout.data";
import { CourseSidebar, CourseSidebarItem } from "./CourseSidebar";

export type CourseLayoutProps = Pick<
    DrawerLayoutProps<CourseSidebarItem>,
    Exclude<keyof DrawerLayoutProps<CourseSidebarItem>, "component">
> & {
    courseId?: string;
};

export function CourseStaffLayout(props: CourseLayoutProps) {
    let { id } = useParams<{ id: string }>();
    const router = useNavigation();
    if (router?.asPath.includes("module") && props.courseId) {
        id = props.courseId;
    }
    const { data, loading } = useCourseLayoutData(id);

    return (
        <DrawerLayout
            {...props}
            component={CourseSidebar}
            menuProps={{
                course: data?.course,
                loading,
            }}
        />
    );
}
