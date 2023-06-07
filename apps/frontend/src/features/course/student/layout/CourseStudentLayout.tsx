import {
    DrawerLayout,
    DrawerLayoutProps,
} from "components/layout/DrawerLayout";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";
import { useCourseStudentLayoutData } from "./api/CourseStudentLayout.data";
import {
    CourseStudentSidebar,
    CourseStudentSidebarItem,
} from "./CourseStudentSidebar";

export type StudentLayoutProps = Pick<
    DrawerLayoutProps<CourseStudentSidebarItem>,
    Exclude<keyof DrawerLayoutProps<CourseStudentSidebarItem>, "component">
> & {
    courseId?: string;
};

export function CourseStudentLayout(props: StudentLayoutProps) {
    let { id } = useParams<{ id: string }>();
    const router = useNavigation();
    if (router?.asPath.includes("module") && props.courseId) {
        id = props.courseId;
    }
    const { data, loading } = useCourseStudentLayoutData(id);

    return (
        <DrawerLayout
            {...props}
            component={CourseStudentSidebar}
            menuProps={{
                course: data?.course,
                loading,
            }}
        />
    );
}
