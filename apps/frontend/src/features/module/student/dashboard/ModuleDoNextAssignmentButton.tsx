import ForwardIcon from "@mui/icons-material/Forward";
import { Button, ButtonProps } from "@mui/material";
import {
    getNextAssignment,
    moduleIsAvailable,
    moduleIsOpen,
} from "features/module/student/utils/ModuleStudentUtils";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
type ModuleDoNextAssignmentButtonProps = ButtonProps & {
    module: Module;
};

export const ModuleDoNextAssignmentButton = (
    props: ModuleDoNextAssignmentButtonProps
) => {
    const router = useNavigation();
    const { t } = useTranslation();

    const { module, ...rest } = props;

    const course = module?.course;
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
                    {t("assignment:doNextInModule")}
                </Button>
            )}
        </>
    );
};
