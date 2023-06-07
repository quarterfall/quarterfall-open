import CheckIcon from "@mui/icons-material/CheckCircle";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Collapse,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
} from "@mui/material";
import { AssignmentIcon } from "components/icons";
import { ellipsis } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { CircularProgressWithShadow } from "ui/progress/CircularProgressWithShadow";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";

type Props = {
    module: Module;
};

export const CourseStudentModuleList = (props: Props) => {
    const { module } = props;
    const { id } = useParams<{ id: string }>();
    const router = useNavigation();
    const [assignmentsTabOpen, setAssignmentsTabOpen] = useState(
        id === module.id
    );

    const assignments = module?.assignments || [];
    const completedAssignments = assignments.filter((a) => a.completed);

    const moduleProgressPercentage =
        (completedAssignments?.length / assignments?.length) * 100 || 0;

    const handleClickModule = (m: Module) => {
        if (!m) {
            return;
        }
        if (id === module?.id) {
            setAssignmentsTabOpen(!assignmentsTabOpen);
        } else {
            router.push(`/student/module/${m.id}`);
        }
    };

    const handleClickAssignmentTabOpen = () => {
        setAssignmentsTabOpen(!assignmentsTabOpen);
    };

    const handleClickAssignment = (a: Assignment) => {
        if (!a) {
            return;
        }
        router.push(`/student/assignment/${a.id}`);
    };
    return (
        <List key={module.id} component="div" disablePadding dense>
            <Tooltip title={module.title} followCursor>
                <ListItemButton
                    onClick={() => handleClickModule(module)}
                    selected={id === module.id}
                >
                    <ListItemIcon>
                        <CircularProgressWithShadow
                            value={moduleProgressPercentage}
                            thickness={8}
                            size={21}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography>
                                {ellipsis(module.title, 12)}
                            </Typography>
                        }
                    />
                    <IconButton
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            handleClickAssignmentTabOpen();
                        }}
                        size="small"
                    >
                        {assignmentsTabOpen ? (
                            <ExpandLessIcon />
                        ) : (
                            <ExpandMoreIcon />
                        )}
                    </IconButton>
                </ListItemButton>
            </Tooltip>
            <Collapse in={assignmentsTabOpen} timeout="auto" unmountOnExit>
                {assignments.map((assignment) => {
                    return (
                        <List
                            key={assignment.id}
                            component="div"
                            disablePadding
                            dense
                        >
                            <ListItemButton
                                sx={{ pl: 4 }}
                                onClick={() =>
                                    handleClickAssignment(assignment)
                                }
                            >
                                <ListItemIcon>
                                    {assignment?.completed ? (
                                        <CheckIcon
                                            sx={{
                                                color: "secondary.main",
                                            }}
                                            fontSize="small"
                                        />
                                    ) : (
                                        <AssignmentIcon
                                            fontSize="small"
                                            assignment={assignment}
                                        />
                                    )}
                                </ListItemIcon>
                                <ListItemText primary={assignment.title} />
                            </ListItemButton>
                        </List>
                    );
                })}
            </Collapse>
        </List>
    );
};
