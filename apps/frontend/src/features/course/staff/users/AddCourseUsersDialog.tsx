import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Typography,
} from "@mui/material";
import { RoleType } from "core";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { EmailAddressesController } from "ui/form/EmailAddressesController";
import { SelectController } from "ui/form/SelectController";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useAddCourseUsers } from "./api/CourseUsers.data";

export interface AddCourseUsersDialogProps {
    course: Course;
    open: boolean;
    isStudent?: boolean;
    onComplete?: () => void;
    onError?: (error) => void;
    onClose?: () => void;
}

export function AddCourseUsersDialog(props: AddCourseUsersDialogProps) {
    const { t } = useTranslation();

    const [addCourseUsersMutation] = useAddCourseUsers();
    const [waiting, setWaiting] = useState(false);

    const {
        open,
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
        course,
        isStudent,
    } = props;

    const allowedRoles = [
        RoleType.courseAdmin,
        RoleType.courseEditor,
        RoleType.courseViewer,
        RoleType.courseChecker,
    ];

    const onSubmit = async (input) => {
        setWaiting(true);
        try {
            onComplete();
            setWaiting(false);
            await addCourseUsersMutation({
                variables: {
                    users: input.emailAddresses.map((emailAddress) => ({
                        emailAddress,
                    })),
                    role: isStudent ? RoleType.courseStudent : input.role,
                    id: course.id,
                },
            });
        } catch (error) {
            onError(error);
        }
    };

    // Form for adding the students
    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{ emailAddresses: string[]; role: RoleType }>({
        mode: "onChange",
        defaultValues: {
            role: RoleType.courseEditor,
        },
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {isStudent
                        ? t("course:titleAddCourseStudents")
                        : t("course:titleAddCourseUsers")}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {isStudent
                                    ? t("course:bodyAddCourseStudents")
                                    : t("course:bodyAddCourseUsers")}
                            </Typography>
                        </Grid>
                        {/* Email address input */}
                        <Grid item>
                            <EmailAddressesController
                                autoFocus
                                fullWidth
                                label={t("emailAddresses")}
                                name="emailAddresses"
                                control={control}
                                required
                                data-cy="addUserEmailField"
                            />
                        </Grid>
                        {/* Role selector */}
                        <Grid item>
                            {!isStudent && (
                                <SelectController
                                    style={{ minWidth: 200 }}
                                    displayEmpty
                                    label={t("role")}
                                    name="role"
                                    control={control}
                                    variant="outlined"
                                >
                                    {allowedRoles.map((role) => {
                                        return (
                                            <MenuItem
                                                key={`role_${role}`}
                                                value={role}
                                            >
                                                {t(`roles:${role}`)}
                                            </MenuItem>
                                        );
                                    })}
                                </SelectController>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || waiting}`}
                            disabled={!isValid || waiting}
                            data-cy="addUserSubmitButton"
                        >
                            {t("add")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
