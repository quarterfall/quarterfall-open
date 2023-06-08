import ForwardIcon from "@mui/icons-material/Forward";
import { Button, ButtonProps } from "@mui/material";
import {
    getModuleEndDate,
    getNextAssignment,
    moduleIsAvailable,
    moduleIsOpen,
} from "features/module/student/utils/ModuleStudentUtils";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
type CourseDoNextAssignmentButtonProps = ButtonProps & {
    course: Course;
};

export const CourseDoNextAssignmentButton = (
    props: CourseDoNextAssignmentButtonProps
) => {
    const router = useNavigation();
    const { t } = useTranslation();

    const { course, ...rest } = props;

    // Get the uncompleted modules and sort them by end date
    const modules =
        course?.modules
            .slice()
            .filter((m) => !m?.completed)
            .sort(
                (a, b) =>
                    Number(getModuleEndDate(a, course)) -
                    Number(getModuleEndDate(b, course))
            ) || [];

    const module = modules[0];

    const nextAssignment = getNextAssignment(module);
    const isAvailable = moduleIsAvailable(module, course);
    const open = moduleIsOpen(module, course);

    const handleClickNextAssignment = () => {
        if (!nextAssignment) {
            return;
        }
        router.push(`/student/assignment/${nextAssignment.id}`);
    };
    return (
        <>
            {open && isAvailable && nextAssignment && (
                <Button
                    color="primary"
                    variant="contained"
                    startIcon={<ForwardIcon />}
                    onClick={handleClickNextAssignment}
                    sx={{ my: 2 }}
                    {...rest}
                >
                    {t("assignment:doNext")}
                </Button>
            )}
        </>
    );
};
