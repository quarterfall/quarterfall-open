import AddIcon from "@mui/icons-material/AddCircle";
import UpdateIcon from "@mui/icons-material/ChangeCircle";
import ListAltSharpIcon from "@mui/icons-material/ListAltSharp";
import DeleteIcon from "@mui/icons-material/RemoveCircle";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Skeleton,
    Typography,
} from "@mui/material";
import { format } from "date-fns";
import { Course } from "interface/Course.interface";
import { Event } from "interface/Event.interface";
import SubmitIcon from "mdi-material-ui/SendCircle";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

interface CourseRecentActivityCardProps {
    course: Course;
    loading: boolean;
}

export const CourseRecentActivityCard = (
    props: CourseRecentActivityCardProps
) => {
    const { course, loading } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const events = course?.events || [];

    const renderEventText = (event: Event) => {
        const type = event.type;
        const moduleTitle = event.data?.module?.title || "";
        const assignmentTitle = event.data?.assignment?.title || "";
        const questionTitle =
            event.data?.question?.title ||
            event.data?.question?.index + 1 ||
            "";
        const user = `${event.data?.user?.firstName} ${event.data?.user?.lastName}`;
        const submission = event.data?.submission;
        const student = `${submission?.student?.firstName} ${submission?.student?.lastName}`;

        return t(`eventType_${type}`, {
            moduleTitle,
            assignmentTitle,
            questionTitle,
            user,
            student,
        });
    };

    const renderEventIcon = (event: Event) => {
        const [eventType, eventAction] = event?.type.split(".");

        if (eventType === "submission") {
            return <SubmitIcon />;
        }

        if (eventAction === "created") {
            return <AddIcon />;
        }

        if (eventAction === "updated") {
            return <UpdateIcon />;
        }

        if (eventAction === "deleted") {
            return <DeleteIcon />;
        }

        return <div>{eventAction}</div>;
    };

    return (
        <Card sx={{ width: "100%" }}>
            <CardHeader
                title={t("course:recentActivity")}
                avatar={<ListAltSharpIcon color="secondary" />}
            />
            <CardContent>
                {Boolean(events.length) ? (
                    <List>
                        {events.map((event) => {
                            return (
                                <ListItem
                                    key={event.id}
                                    disableGutters
                                    disablePadding
                                    onClick={() =>
                                        router.push(event.metadata?.link)
                                    }
                                    sx={{
                                        "&:hover": {
                                            cursor: "pointer",
                                        },
                                    }}
                                >
                                    <ListItemButton>
                                        <ListItemIcon
                                            key={`icon_${event.id}`}
                                            sx={{ padding: 0 }}
                                        >
                                            {renderEventIcon(event)}
                                        </ListItemIcon>
                                        <ListItemText
                                            sx={{ padding: 0 }}
                                            primary={renderEventText(event)}
                                            secondary={format(
                                                new Date(event.createdAt),
                                                "PPp"
                                            )}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                ) : (
                    <Box
                        sx={{
                            height: 320,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            alignSelf: "center",
                        }}
                    >
                        {loading ? (
                            <Skeleton height="640px" width="100%" />
                        ) : (
                            <Typography variant="h5" fontWeight="400">
                                {t("course:noRecentActivityMessage")}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
