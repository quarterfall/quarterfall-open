import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { Rating } from '@mui/material';
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";

export interface AssignmentInfoBlockProps {
    assignment: Assignment;
}

export function AssignmentInfoBlock(props: AssignmentInfoBlockProps) {
    const { assignment } = props;
    const { t } = useTranslation();

    return (
        <Card style={{ width: "100%" }}>
            <CardHeader title={t("general")} style={{ paddingBottom: 0 }} />
            <CardContent>
                <Grid container direction="column" spacing={1}>
                    <Grid item>
                        <List>
                            <ListItem disableGutters>
                                <Tooltip
                                    title={
                                        assignment.avgDifficulty
                                            ? Math.round(
                                                  assignment.avgDifficulty * 100
                                              ) / 100
                                            : ""
                                    }
                                >
                                    <ListItemIcon style={{ marginRight: 8 }}>
                                        <Rating
                                            value={assignment.avgDifficulty}
                                            max={5}
                                            readOnly
                                            precision={0.1}
                                        />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText
                                    primary={t("assignment:avgDifficulty")}
                                />
                            </ListItem>
                            <ListItem disableGutters>
                                <Tooltip
                                    title={
                                        assignment.avgUsefulness
                                            ? Math.round(
                                                  assignment.avgUsefulness * 100
                                              ) / 100
                                            : ""
                                    }
                                >
                                    <ListItemIcon style={{ marginRight: 8 }}>
                                        <Rating
                                            value={assignment.avgUsefulness}
                                            max={5}
                                            readOnly
                                            precision={0.1}
                                        />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText
                                    primary={t("assignment:avgUsefulness")}
                                />
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
