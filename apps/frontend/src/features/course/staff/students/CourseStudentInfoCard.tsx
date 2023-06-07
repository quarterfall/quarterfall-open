import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import EventIcon from "@mui/icons-material/Event";
import {
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
} from "@mui/material";
import { format } from "date-fns";
import { User } from "interface/User.interface";
import { useTranslation } from "react-i18next";

type CourseStudentInfoCardProps = {
    student: User;
};

export const CourseStudentInfoCard = (props: CourseStudentInfoCardProps) => {
    const { student } = props;
    const { t } = useTranslation();
    const { firstName, lastName, emailAddress, createdAt } = student;
    const fullName = `${firstName} ${lastName}`;
    return (
        <Card>
            <CardHeader
                title={
                    <Typography variant="h6">
                        {t("user:aboutStudent")}
                    </Typography>
                }
            />
            <CardContent>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <Tooltip title={t("user:fullName")}>
                                <BadgeIcon />
                            </Tooltip>
                        </ListItemIcon>
                        <ListItemText>{fullName}</ListItemText>
                    </ListItem>
                    <ListItem
                        onClick={() => window.open(`mailto:${emailAddress}`)}
                        sx={{
                            "&:hover": {
                                cursor: "pointer",
                            },
                        }}
                    >
                        <ListItemIcon>
                            <Tooltip title={t("emailAddress")}>
                                <EmailIcon />
                            </Tooltip>
                        </ListItemIcon>
                        <ListItemText>{emailAddress}</ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <Tooltip title={t("user:dateJoined")}>
                                <EventIcon />
                            </Tooltip>
                        </ListItemIcon>
                        <ListItemText>
                            {format(new Date(createdAt), "PPp")}
                        </ListItemText>
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );
};
