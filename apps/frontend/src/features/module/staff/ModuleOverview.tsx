import OptionalAssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StudyMaterialIcon from "@mui/icons-material/LocalLibrary";
import OptionalStudyMaterialIcon from "@mui/icons-material/LocalLibraryOutlined";
import { Divider, Grid, Typography } from "@mui/material";
import { AssignmentIcon } from "components/icons";
import { format, isAfter, min } from "date-fns";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";

const infoRowSx = {
    display: "flex",
    flexDirection: "row",
};

const iconSx = {
    marginRight: 2,
};

export interface ModuleOverviewProps {
    course: Course;
    module: Module;
}

export function ModuleOverview(props: ModuleOverviewProps) {
    const { course, module } = props;
    const { t } = useTranslation();
    const { locale } = useDateLocale();

    const assignments = module.assignments || [];

    // deadline checks
    const dates: Date[] = [];
    if (course.endDate) {
        dates.push(new Date(course.endDate));
    }
    if (module.endDate) {
        dates.push(new Date(module.endDate));
    }
    const endDate = dates.length > 0 ? min(dates) : null;
    const closed = endDate ? isAfter(new Date(), endDate) : false;

    const mandatoryAssignments = assignments.filter(
        (a) => !a.isStudyMaterial && !a.isOptional
    );
    const completedMandatoryAssignments = mandatoryAssignments.filter(
        (a) => a.completed
    );
    const mandatoryStudyMaterial = assignments.filter(
        (a) => a.isStudyMaterial && !a.isOptional
    );
    const completedMandatoryStudyMaterial = mandatoryStudyMaterial.filter(
        (a) => a.completed
    );

    const optionalAssignments = assignments.filter(
        (a) => !a.isStudyMaterial && a.isOptional
    );
    const completedOptionalAssignments = optionalAssignments.filter(
        (a) => a.completed
    );
    const optionalStudyMaterial = assignments.filter(
        (a) => a.isStudyMaterial && a.isOptional
    );
    const completedOptionalStudyMaterial = optionalStudyMaterial.filter(
        (a) => a.completed
    );

    return (
        <Grid
            container
            direction="column"
            spacing={1}
            sx={{
                marginTop: 1,
            }}
        >
            {!closed && endDate && (
                <>
                    <Grid item sx={infoRowSx}>
                        <CalendarTodayIcon sx={iconSx} />
                        <Typography>
                            {t("module:closesOn", {
                                date: format(endDate, "PPp", { locale }),
                            })}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Divider />
                    </Grid>
                </>
            )}
            {mandatoryStudyMaterial.length > 0 && (
                <Grid item sx={infoRowSx}>
                    <StudyMaterialIcon sx={iconSx} />
                    <Typography>
                        {t("assignment:mandatoryStudyMaterialStats", {
                            count: mandatoryStudyMaterial.length,
                            completed: completedMandatoryStudyMaterial.length,
                        })}
                    </Typography>
                </Grid>
            )}
            {mandatoryAssignments?.length > 0 && (
                <Grid item sx={infoRowSx}>
                    <AssignmentIcon sx={iconSx} />
                    <Typography display="inline">
                        {t("assignment:mandatoryAssignmentStats", {
                            count: mandatoryAssignments.length,
                            completed: completedMandatoryAssignments.length,
                        })}
                    </Typography>
                </Grid>
            )}
            {optionalStudyMaterial.length > 0 && (
                <Grid item sx={infoRowSx}>
                    <OptionalStudyMaterialIcon sx={iconSx} />
                    <Typography>
                        {t("assignment:optionalStudyMaterialStats", {
                            count: optionalStudyMaterial.length,
                            completed: completedOptionalStudyMaterial.length,
                        })}
                    </Typography>
                </Grid>
            )}
            {optionalAssignments?.length > 0 && (
                <Grid item sx={infoRowSx}>
                    <OptionalAssignmentIcon sx={iconSx} />
                    <Typography>
                        {t("assignment:optionalAssignmentStats", {
                            count: optionalAssignments.length,
                            completed: completedOptionalAssignments.length,
                        })}
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
}
