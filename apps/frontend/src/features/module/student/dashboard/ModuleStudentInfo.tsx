import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import EventIcon from "@mui/icons-material/Event";
import { Alert, Box, Grid, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { SimpleDashboardCard } from "ui/dashboard/SimpleDashboardCard";
import { useDateLocale } from "ui/hooks/DateLocale";
import { ProminentLinearProgress } from "ui/progress/ProminentLinearProgress";
import {
    getModuleEndDate,
    getModuleStartDate,
    moduleClosesWithinThreeDays,
    moduleIsOpen,
} from "../utils/ModuleStudentUtils";
import { ModuleDoNextAssignmentButton } from "./ModuleDoNextAssignmentButton";

interface ModuleStudentInfoProps {
    module: Module;
    loading?: boolean;
}

export const ModuleStudentInfo = (props: ModuleStudentInfoProps) => {
    const { module, loading } = props;
    const { t } = useTranslation();
    const { locale } = useDateLocale();

    const assignments = module?.assignments || [];
    const course = module?.course;

    const moduleStartDate = getModuleStartDate(module, course);
    const moduleEndDate = getModuleEndDate(module, course);

    const endDate = getModuleEndDate(module, course);

    const open = moduleIsOpen(module, course);
    const withinThreeDays = moduleClosesWithinThreeDays(module, course);

    const moduleCompletionPercentage = Math.round(
        (assignments.filter((a) => a.completed).length / assignments.length) *
            100
    );

    const simpleDashboardCards = [
        {
            title: t("startDateTime"),
            description: moduleStartDate
                ? format(new Date(moduleStartDate), "PP")
                : t("course:noStartDate"),
            secondaryDescription:
                moduleStartDate && format(new Date(moduleStartDate), "p"),
            icon: <CalendarTodayIcon />,
        },
        {
            title: t("endDateTime"),
            description: moduleEndDate
                ? format(new Date(moduleEndDate), "PP")
                : t("course:noEndDate"),
            secondaryDescription: moduleEndDate && (
                <Typography>{format(new Date(moduleEndDate), "p")}</Typography>
            ),
            icon: <EventIcon />,
        },
        {
            title: t("module:progress"),
            description: (
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mt: 1 }}
                >
                    <Box width="70%">
                        <ProminentLinearProgress
                            variant="determinate"
                            value={moduleCompletionPercentage}
                        />
                    </Box>
                    <Typography>{`${moduleCompletionPercentage}%`}</Typography>
                </Stack>
            ),
            icon: <DonutLargeIcon />,
            action: (
                <Align right>
                    <ModuleDoNextAssignmentButton
                        module={module}
                        size="small"
                    />
                </Align>
            ),
        },
    ];
    return (
        <Box>
            <Grid container direction="row" spacing={2} alignItems="stretch">
                {!module?.assignments.every(
                    (a) => a.isOptional || a.isStudyMaterial
                ) &&
                    module?.completed &&
                    !closed && (
                        <Grid item xs={12}>
                            <Alert severity="success">
                                {t("module:materialCompleted")}
                            </Alert>
                        </Grid>
                    )}
                {open && withinThreeDays && !module?.completed && (
                    <Grid item xs={12}>
                        <Alert severity="warning">
                            {t("module:closesSoon")}
                        </Alert>
                    </Grid>
                )}
                {!open && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t("module:closedInfoMessage", {
                                date: format(endDate, "PPp", { locale }),
                            })}
                        </Alert>
                    </Grid>
                )}
                {simpleDashboardCards.map((c, index) => {
                    return (
                        <Grid item xs={12} lg={4} key={index}>
                            <SimpleDashboardCard
                                title={c?.title}
                                description={c?.description}
                                secondaryDescription={c?.secondaryDescription}
                                icon={c?.icon}
                                loading={loading}
                                clickable={false}
                                action={c?.action}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};
