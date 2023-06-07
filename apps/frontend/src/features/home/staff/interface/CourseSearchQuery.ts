import { DataTableQuery } from "components/dataview/datatable/DataTableQuery";

export interface CourseSearchQuery extends DataTableQuery {
    allCourses?: boolean;
    hideArchived?: boolean;
}
