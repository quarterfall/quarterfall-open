import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ProgressIcon from "@mui/icons-material/ShowChart";
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { format } from "date-fns";
import { getAssignmentEndDate } from "features/assignment/utils/AssignmentUtils";
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";

export interface AssignmentInfoBoxProps {
    assignment: Assignment;
    publicKey?: string;
}

export function AssignmentInfoBox(props: AssignmentInfoBoxProps) {
    const { assignment, publicKey } = props;

    const { t } = useTranslation();
    const { locale } = useDateLocale();

    const blocks = assignment.blocks || [];
    const completedBlocks = blocks.filter((b) => b.completed);
    const assignmentDeadline = getAssignmentEndDate(assignment);

    return (
        <Box
            sx={{
                paddingX: 1,
            }}
        >
            <List dense>
                {Boolean(assignmentDeadline) && !publicKey && (
                    <ListItem>
                        <Tooltip title={t("assignment:deadlineTooltip")!}>
                            <ListItemIcon
                                sx={{
                                    minWidth: "40px",
                                }}
                            >
                                <CalendarTodayIcon />
                            </ListItemIcon>
                        </Tooltip>
                        <ListItemText
                            primary={t("assignment:deadline", {
                                date: format(assignmentDeadline, "PPp", {
                                    locale,
                                }),
                            })}
                        />
                    </ListItem>
                )}
                <ListItem>
                    <Tooltip title={t("assignment:progressTooltip")!}>
                        <ListItemIcon
                            sx={{
                                minWidth: "40px",
                            }}
                        >
                            <ProgressIcon />
                        </ListItemIcon>
                    </Tooltip>
                    <ListItemText
                        primary={t("assignment:progress", {
                            count: completedBlocks.length,
                            total: blocks.length,
                        })}
                    />
                </ListItem>
            </List>
        </Box>
    );
}
