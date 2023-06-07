import { Alert, Tab, Tabs } from "@mui/material";
import { MandatoryAssignmentIcon, StudentIcon } from "components/icons";
import { Route } from "components/layout/RouteTabs";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";

export interface Props {
    course: Course;
    assignment?: Assignment;
}

export const AnalyticsHeader = (props: Props) => {
    const { course } = props;
    const { t } = useTranslation();
    const router = useNavigation();
    const modules = course?.modules;
    const assignments = modules?.flatMap((m) => m?.assignments);
    const students = course?.students;

    const routes = [
        {
            name: "assignment",
            link: `/assignment/${assignments[0]?.id}`,
            text: t("assignment"),
            icon: <MandatoryAssignmentIcon key="assignment_icon" />,
            headingTitle: t("analytics:assignmentTitle"),
            headingDescription: t("analytics:assignmentDescription"),
            disabled: !assignments?.length,
        },
        {
            name: "students",
            link: `/students/${students[0]?.id}`,
            text: t("student"),
            icon: <StudentIcon key="student_icon" />,
            headingTitle: t("analytics:studentTitle"),
            headingDescription: t("analytics:studentDescription"),
            disabled: !students?.length,
        },
    ];

    const selectedTab = useMemo(() => {
        // try to find a matching route
        let currentRouteIndex = routes.findIndex((r) => {
            if (!r.name) {
                return;
            }
            return router.asPath.includes(r.name);
        });
        if (currentRouteIndex >= 0) {
            return currentRouteIndex;
        } else {
            // if there is no matching route, set to 0 by default
            return 0;
        }
    }, [router, routes]);

    const handleChange = (
        event: React.ChangeEvent<{}>,
        newTabValue: number
    ) => {
        router.push(
            `/course/${course?.id}/analytics${routes[newTabValue].link}`
        );
    };

    return (
        <>
            <PageHeading
                title={routes[selectedTab]?.headingTitle}
                description={routes[selectedTab]?.headingDescription}
            />
            {course.archived && (
                <Alert severity="info">
                    {t("course:archivedMessageStaff")}
                </Alert>
            )}
            <Tabs
                value={selectedTab}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                {routes.map((route: Route, index: number) => {
                    return (
                        <Tab
                            key={index}
                            data-cy={`tab_${route.text || route.link}`}
                            label={t(`${route.text || route.link}`)}
                            icon={route.icon}
                            iconPosition="start"
                            disabled={route.disabled}
                            sx={{
                                paddingTop: 0,
                                paddingBottom: 0,
                                minHeight: "64px",
                            }}
                        />
                    );
                })}
            </Tabs>
        </>
    );
};
