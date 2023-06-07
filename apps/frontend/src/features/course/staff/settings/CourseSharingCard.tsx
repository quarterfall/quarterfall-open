import ShareIcon from "@mui/icons-material/Share";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Permission } from "core";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import {
    usePublishCourse,
    useUnpublishCourse,
} from "./api/CourseSettings.data";
const CopyToClipboardButton = dynamic(() => import("ui/CopyToClipboardButton"));

export interface CourseSharingCardProps {
    course: Course;
    loading?: boolean;
}

export function CourseSharingCard(props: CourseSharingCardProps) {
    const { t } = useTranslation();
    const { course, loading } = props;
    const { showSuccessToast } = useToast();
    const [publishCourseMutation] = usePublishCourse();
    const [unpublishCourseMutation] = useUnpublishCourse();
    const can = usePermission();

    const readOnly = !can(Permission.updateCourse, course);

    const handlePublishCourse = async () => {
        await publishCourseMutation({
            variables: {
                id: course?.id,
            },
        });
        showSuccessToast(t("course:sharedConfirmation"));
    };

    const handleUnpublishCourse = async () => {
        await unpublishCourseMutation({
            variables: {
                id: course?.id,
            },
        });
        showSuccessToast(t("course:stoppedSharingConfirmation"));
    };

    const handleSendByEmail = () => {
        const url = `${window.location.origin}/course/import/${course?.publicCode}`;
        window.open(
            `mailto:?body=${t("course:emailShareCodeBody", {
                ...course,
                url,
            })}&subject=${t("course:emailShareCodeSubject")}`
        );
    };

    const renderUnpublished = () => (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Typography align="center">
                    {t("course:shareDescription")}
                </Typography>
            </Grid>
            <Grid item>
                <Align center>
                    <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        onClick={handlePublishCourse}
                        disabled={loading || readOnly}
                    >
                        {t("share")}
                    </Button>
                </Align>
            </Grid>
        </Grid>
    );

    const renderPublished = () => (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Typography gutterBottom>
                    {t("course:sharedDescription")}
                </Typography>
            </Grid>
            <Grid item>
                <Stack direction="row" spacing={1} alignItems="center">
                    {loading ? (
                        <Skeleton />
                    ) : (
                        <TextField
                            disabled
                            value={course?.publicCode || ""}
                            variant="outlined"
                            label={t("shareCode")}
                        />
                    )}
                    <CopyToClipboardButton
                        text={course?.publicCode}
                        disabled={loading}
                    />
                    <Tooltip title={t("sendCodeByEmail")}>
                        <IconButton
                            onClick={handleSendByEmail}
                            size="large"
                            disabled={loading}
                        >
                            <ShareIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Grid>
            <Grid item>
                <Align right>
                    <Button
                        variant="outlined"
                        onClick={handleUnpublishCourse}
                        disabled={loading}
                    >
                        {t("stopSharing")}
                    </Button>
                </Align>
            </Grid>
        </Grid>
    );

    return (
        <Card sx={{ width: "100%" }}>
            <CardHeader title={t("course:sharing")} />
            <CardContent>
                {loading ? (
                    <Skeleton variant="rectangular" height={200} />
                ) : !!course?.publicCode ? (
                    renderPublished()
                ) : (
                    renderUnpublished()
                )}
            </CardContent>
        </Card>
    );
}
