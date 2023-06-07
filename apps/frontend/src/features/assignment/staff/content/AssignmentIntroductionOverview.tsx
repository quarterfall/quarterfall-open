import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
    CardContent,
    CardHeader,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClickableCard } from "ui/ClickableCard";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
import { useUpdateAssignment } from "../api/Assignment.data";

type Props = { assignment: Assignment; readOnly?: boolean };

export const AssignmentIntroductionOverview = (props: Props) => {
    const { assignment, readOnly } = props;
    const router = useNavigation();
    const { t } = useTranslation();
    const [deleteIntroductionDialogOpen, setDeleteIntroductionDialogOpen] =
        useState(false);
    const [waiting, setWaiting] = useState(false);
    const [updateAssignmentMutation] = useUpdateAssignment();

    const handleDeleteIntroduction = async () => {
        setWaiting(true);
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input: { hasIntroduction: false, introduction: "" },
            },
        });
        setWaiting(false);
        setDeleteIntroductionDialogOpen(false);
    };
    return (
        <>
            <ClickableCard
                onClick={() =>
                    router.push(`/assignment/${assignment.id}/introduction`)
                }
            >
                <CardHeader
                    title={
                        <Typography variant="h5">
                            {t("introduction")}
                        </Typography>
                    }
                    action={
                        !readOnly && (
                            <>
                                <Tooltip
                                    title={t("assignment:editIntroduction")}
                                >
                                    <IconButton
                                        onClick={() =>
                                            router.push(
                                                `/assignment/${assignment.id}/introduction`
                                            )
                                        }
                                        sx={{ zIndex: 2 }}
                                        size="large"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t("delete")}>
                                    <IconButton
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setDeleteIntroductionDialogOpen(
                                                true
                                            );
                                        }}
                                        sx={{ zIndex: 2 }}
                                        size="large"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )
                    }
                />
                <CardContent>
                    {t("assignment:editIntroductionBody")}
                </CardContent>
            </ClickableCard>
            <ConfirmationDialog
                open={deleteIntroductionDialogOpen}
                title={t("assignment:deleteIntroductionTitle")}
                message={t("assignment:deleteIntroductionBody")}
                waiting={waiting}
                onContinue={handleDeleteIntroduction}
                onCancel={() => {
                    setDeleteIntroductionDialogOpen(false);
                }}
            />
        </>
    );
};
