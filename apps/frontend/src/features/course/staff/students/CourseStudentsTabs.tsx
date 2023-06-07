import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import { Alert, Autocomplete, Tab, Tabs, TextField } from "@mui/material";
import { Route } from "components/layout/RouteTabs";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";

interface Props {
    course: Course;
    student?: User;
}

export const CourseStudentsTabs = (props: Props) => {
    const { course, student } = props;
    const { t } = useTranslation();
    const router = useNavigation();
    const students = course?.students;

    const [value, setValue] = useState<User | null>(student);
    const [inputValue, setInputValue] = useState("");

    const routes = [
        {
            name: "analytics",
            link: `/analytics`,
            text: t("about"),
            icon: <PersonIcon key="person_icon" />,
            disabled: !students?.length,
        },
        {
            name: "submissions",
            link: `/submissions`,
            text: t("submissions"),
            icon: <AssessmentIcon key="submission_icon" />,
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
            `/course/${course?.id}/students/${student?.id}${routes[newTabValue].link}`
        );
    };

    return (
        <>
            <PageHeading title={t("students")} />
            {course.archived && (
                <Alert severity="info">
                    {t("course:archivedMessageStaff")}
                </Alert>
            )}
            <Autocomplete
                id="students"
                value={value}
                onChange={(event: any, newValue: User) => {
                    setValue(newValue);
                    if (newValue) {
                        router.push(
                            `/course/${course.id}/students/${newValue.id}${routes[selectedTab].link}`
                        );
                    }
                }}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                options={course.students.filter(
                    (s) => s.firstName && s.lastName
                )}
                getOptionLabel={(option: User) =>
                    `${option?.firstName} ${option.lastName}`
                }
                renderInput={(params) => (
                    <TextField
                        variant="outlined"
                        label={t("students")}
                        {...params}
                    />
                )}
                disableClearable
                style={{ width: 400 }}
            />
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
