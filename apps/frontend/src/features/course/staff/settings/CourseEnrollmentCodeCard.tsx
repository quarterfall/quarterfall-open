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
    useCreateEnrollmentCodeForCourse,
    useDeleteEnrollmentCodeFromCourse,
} from "./api/CourseSettings.data";
const CopyToClipboardButton = dynamic(() => import("ui/CopyToClipboardButton"));
interface CourseEnrollmentCodeCardProps {
    course?: Course;
    loading?: boolean;
}

export const CourseEnrollmentCodeCard = (
    props: CourseEnrollmentCodeCardProps
) => {
    const { course, loading } = props;

    const { t } = useTranslation();
    const can = usePermission();

    const { showSuccessToast } = useToast();

    const [createEnrollmentCodeForCourseMutation] =
        useCreateEnrollmentCodeForCourse();
    const [deleteEnrollmentCodeFromCourseMutation] =
        useDeleteEnrollmentCodeFromCourse();

    const readOnly = !can(Permission.updateCourse, course);

    const handleCreateEnrollmentCodeForCourse = async () => {
        await createEnrollmentCodeForCourseMutation({
            variables: {
                id: course?.id,
            },
        });
        showSuccessToast(t("course:createdEnrollmentCodeConfirmation"));
    };

    const handleDeleteEnrollmentCodeFromCourse = async () => {
        await deleteEnrollmentCodeFromCourseMutation({
            variables: {
                id: course?.id,
            },
        });
        showSuccessToast(t("course:deletedEnrollmentCodeConfirmation"));
    };

    const handleSendByEmail = () => {
        const url = `${window.location.origin}/auth/register?enrollmentCode=${course?.enrollmentCode}`;
        window.open(
            `mailto:?body=${t("course:emailEnrollmentCodeBody", {
                ...course,
                url,
            })}&subject=${t("course:emailEnrollmentCodeSubject")}`
        );
    };

    const renderUnpublished = () => (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Typography align="center">
                    {t("course:createEnrollmentCodeDescription")}
                </Typography>
            </Grid>
            <Grid item>
                <Align center>
                    <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        onClick={handleCreateEnrollmentCodeForCourse}
                        disabled={loading || readOnly}
                    >
                        {t("course:createEnrollmentCodeButtonTitle")}
                    </Button>
                </Align>
            </Grid>
        </Grid>
    );

    const renderPublished = () => (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <Typography gutterBottom>
                    {t("course:createdEnrollmentCodeDescription")}
                </Typography>
            </Grid>
            <Grid item>
                <Stack direction="row" spacing={1} alignItems="center">
                    {loading ? (
                        <Skeleton />
                    ) : (
                        <TextField
                            disabled
                            value={course?.enrollmentCode || ""}
                            variant="outlined"
                            label={t("enrollmentCode")}
                        />
                    )}
                    <CopyToClipboardButton
                        text={course?.enrollmentCode}
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
                        onClick={handleDeleteEnrollmentCodeFromCourse}
                        disabled={loading}
                        color="error"
                    >
                        {t("course:deleteEnrollmentCodeButtonTitle")}
                    </Button>
                </Align>
            </Grid>
        </Grid>
    );
    return (
        <Card sx={{ width: "100%" }}>
            <CardHeader title={t("course:createEnrollmentCodeTitle")} />
            <CardContent>
                {loading ? (
                    <Skeleton variant="rectangular" height={200} />
                ) : !!course?.enrollmentCode ? (
                    renderPublished()
                ) : (
                    renderUnpublished()
                )}
            </CardContent>
        </Card>
    );
};
