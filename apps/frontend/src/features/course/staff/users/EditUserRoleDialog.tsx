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
import { useAuthContext } from "context/AuthProvider";
import { courseRoles, hasErrorCode, RoleType, ServerError } from "core";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { SelectController } from "ui/form/SelectController";
import { useNavigation } from "ui/route/Navigation";
import { useEditCourseUserRole } from "./api/CourseUsers.data";

export interface EditUserRoleDialogProps {
    course: Course;
    user?: Partial<User>;
    onClose?: (cancelled?: boolean) => void;
}

export function EditUserRoleDialog(props: EditUserRoleDialogProps) {
    const { t } = useTranslation();
    const [editCourseUserRoleMutation] = useEditCourseUserRole();
    const [confirmRemoveAdminOpen, setConfirmRemoveAdminOpen] = useState(false);
    const { me } = useAuthContext();
    const router = useNavigation();
    const { showErrorToast } = useToast();

    const { onClose = (cancelled?: boolean) => void 0, course, user } = props;

    const defaultValues = { role: user?.courseRole };

    // Form for adding the students
    const {
        control,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm<{ emailAddresses: string[]; role: RoleType }>({
        mode: "onChange",
        defaultValues,
    });
    const doEditCourseUserRole = async (toHome: boolean = true) => {
        setConfirmRemoveAdminOpen(false);
        // don't do anything if the role didn't change
        if (user?.courseRole === watch("role")) {
            onClose();
            return;
        }
        try {
            await editCourseUserRoleMutation({
                variables: {
                    userId: user?.id,
                    role: watch("role"),
                    id: course.id,
                },
            });
            if (toHome) {
                router.push("/");
            }
        } catch (error) {
            if (hasErrorCode(error, ServerError.AtLeastOneAdminError)) {
                showErrorToast(t("course:atLeastOneAdminError"));
            }
            if (hasErrorCode(error, ServerError.UsersCannotBeCourseAdmins)) {
                showErrorToast(t("course:usersCannotBeCourseAdminsError"));
            } else {
                showErrorToast(t("unknownError"));
            }
        }
        onClose();
    };

    const onSubmit = async (input) => {
        if (
            me?.id === user?.id &&
            user?.courseRole === RoleType.courseAdmin &&
            input.role !== RoleType.courseAdmin
        ) {
            setConfirmRemoveAdminOpen(true);
        } else {
            doEditCourseUserRole(false);
        }
    };

    let allowedRoles = courseRoles.filter(
        (role) => role !== RoleType.courseStudent
    );

    if (user?.organizationRole === RoleType.organizationOther) {
        allowedRoles = allowedRoles.filter(
            (role) => role !== RoleType.courseAdmin
        );
    }

    useEffect(() => {
        reset(defaultValues);
    }, [user?.id]);

    return (
        <>
            <Dialog open={Boolean(user)} onClose={() => onClose(true)}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>
                        {t("course:titleEditCourseUserRole")}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} direction="column">
                            <Grid item>
                                <Typography>
                                    {t("course:bodyEditCourseUserRole")}
                                </Typography>
                            </Grid>
                            {/* Role selector */}
                            <Grid item>
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
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => onClose(true)}>
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid}`}
                            disabled={!isValid}
                        >
                            {t("ok")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <ConfirmationDialog
                careful
                title={t("course:titleConfirmRemoveYourselfAdministrator")}
                message={t("course:bodyConfirmRemoveYourselfAdministrator")}
                open={confirmRemoveAdminOpen}
                onContinue={doEditCourseUserRole}
                onCancel={() => setConfirmRemoveAdminOpen(false)}
            />
        </>
    );
}
