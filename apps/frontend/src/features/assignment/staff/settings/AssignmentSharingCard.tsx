import ShareIcon from "@mui/icons-material/Share";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    useShareAssignment,
    useStopSharingAssignment,
} from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
const CopyToClipboardButton = dynamic(() => import("ui/CopyToClipboardButton"));

export interface AssignmentSharingCardProps {
    assignment: Assignment;
}

export function AssignmentSharingCard(props: AssignmentSharingCardProps) {
    const { t } = useTranslation();
    const { assignment } = props;
    const { showSuccessToast } = useToast();
    const [shareAssignmentMutation] = useShareAssignment();
    const [stopSharingAssignmentMutation] = useStopSharingAssignment();

    const handleShareAssignment = async () => {
        await shareAssignmentMutation({
            variables: {
                id: assignment.id,
            },
        });
        showSuccessToast(t("assignment:sharedConfirmation"));
    };

    const handleStopSharingAssignment = async () => {
        await stopSharingAssignmentMutation({
            variables: {
                id: assignment.id,
            },
        });
        showSuccessToast(t("assignment:stoppedSharingConfirmation"));
    };

    const renderNotShared = () => (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Typography>{t("assignment:shareDescription")}</Typography>
            </Grid>
            <Grid item>
                <Align>
                    <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        onClick={handleShareAssignment}
                    >
                        {t("share")}
                    </Button>
                </Align>
            </Grid>
        </Grid>
    );

    const renderShared = () => (
        <Grid container direction="column" spacing={1}>
            <Grid item>
                <Typography gutterBottom>
                    {t("assignment:sharedDescription")}
                </Typography>
            </Grid>
            <Grid item>
                <Stack spacing={1} direction="row" alignItems="center">
                    <TextField
                        disabled
                        value={assignment?.shareCode || ""}
                        variant="outlined"
                        label={t("shareCode")}
                    />
                    <CopyToClipboardButton text={assignment?.shareCode} />
                </Stack>
            </Grid>
            <Grid item>
                <Align right>
                    <Button
                        variant="outlined"
                        onClick={handleStopSharingAssignment}
                    >
                        {t("stopSharing")}
                    </Button>
                </Align>
            </Grid>
        </Grid>
    );

    return (
        <Card
            sx={{
                width: "100%",
            }}
        >
            <CardHeader
                title={t("assignment:sharing")}
                avatar={<ShareIcon color="secondary" />}
            />
            <CardContent>
                {!!assignment?.shareCode ? renderShared() : renderNotShared()}
            </CardContent>
        </Card>
    );
}
