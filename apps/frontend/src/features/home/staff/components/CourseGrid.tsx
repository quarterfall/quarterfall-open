import { Grid, Skeleton, Typography } from "@mui/material";
import {
    DataGridView,
    DataGridViewField,
} from "components/dataview/datagridview/DataGridView";
import { Permission } from "core";
import { CourseCard } from "features/home/components/CourseCard";
import { CourseSearchQuery } from "features/home/staff/interface/CourseSearchQuery";
import { useSearchCourses as useSearchOrganizationCourses } from "features/user/User.data";
import { usePermission } from "hooks/usePermission";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToggleChip } from "ui/ToggleChip";

export interface CourseGridProps {
    query: CourseSearchQuery;
    updateQuery: (q: Partial<CourseSearchQuery>) => void;
}

export function CourseGrid(props: CourseGridProps) {
    const { query, updateQuery } = props;
    const can = usePermission();

    const { t } = useTranslation();
    const { data, loading, refetch } = useSearchOrganizationCourses(query);

    const handleToggleArchived = () =>
        updateQuery({
            hideArchived: !query.hideArchived,
        });

    const handleToggleAllCourses = () =>
        updateQuery({
            allCourses: !query.allCourses,
        });

    // refetch when the parameters change
    useEffect(() => {
        refetch(query);
    }, [query]);

    // extract the data
    const courses = data?.searchCourses?.items || [];
    const total = data?.searchCourses?.total || 0;

    let fields: DataGridViewField[] = [
        {
            title: t("course:title"),
            field: "title",
        },
        {
            title: t("course:code"),
            field: "code",
        },
    ];
    const extraFields = [
        {
            title: t("startDateTime"),
            field: "startDate",
        },
        {
            title: t("endDateTime"),
            field: "endDate",
        },
    ];

    fields = fields.concat(extraFields);

    return (
        <DataGridView
            emptyText={t("course:empty")}
            total={total}
            entries={courses}
            fields={fields}
            loading={loading}
            filterActions={
                <Grid container spacing={1} alignItems="center">
                    <Grid item>
                        <Typography variant="body2">{t("show")}</Typography>
                    </Grid>
                    <Grid item>
                        <ToggleChip
                            size="small"
                            selected={!query.hideArchived}
                            label={t("course:archivedCoursesChip")}
                            onClick={handleToggleArchived}
                        />
                    </Grid>
                    <Grid item>
                        {can(Permission.readAnyCourse) && (
                            <ToggleChip
                                size="small"
                                selected={query.allCourses}
                                label={t("course:allOrgCoursesChip")}
                                onClick={handleToggleAllCourses}
                            />
                        )}
                    </Grid>
                </Grid>
            }
            renderEntry={(entry, index) => (
                <CourseCard
                    course={entry}
                    onRefresh={() => refetch(query)}
                    key={index}
                />
            )}
            renderPlaceholder={() => (
                <Skeleton
                    variant="rectangular"
                    height={408}
                    sx={{
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadius}px `,
                    }}
                />
            )}
            {...query}
            updateQuery={updateQuery}
        />
    );
}
