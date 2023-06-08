import LaunchIcon from "@mui/icons-material/Launch";
import { Button, Paper } from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

export interface AssignmentSidebarFooterProps {
    assignment: Assignment;
}
export function AssignmentSidebarFooter(props: AssignmentSidebarFooterProps) {
    const { assignment } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    return (
        <Paper
            elevation={0}
            sx={{
                width: 239,
                display: "flex",
                justifyContent: "space-evenly",
                borderRadius: 0,
                paddingTop: (theme) => theme.spacing(1),
                paddingBottom: (theme) => theme.spacing(1),
            }}
        >
            <Button
                sx={{
                    marginRight: (theme) => theme.spacing(1),
                    marginLeft: (theme) => theme.spacing(1),
                }}
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => {
                    router.newTab(`/assignment/${assignment.id}/test`);
                }}
                startIcon={<LaunchIcon />}
                data-cy="viewAsStudentButton"
            >
                {t("assignment:viewAsStudent")}
            </Button>
        </Paper>
    );
}
