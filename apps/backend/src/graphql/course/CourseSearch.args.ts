import { OptionalField } from "graphql/helpers";
import { SearchArgs } from "graphql/search/Search.args";
import { ArgsType } from "type-graphql";

@ArgsType()
export class CourseSearchArgs extends SearchArgs {
    @OptionalField()
    public allCourses?: boolean;

    @OptionalField()
    public hideArchived?: boolean;
}
