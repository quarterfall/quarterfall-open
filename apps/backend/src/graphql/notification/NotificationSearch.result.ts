import { INotification } from "db/Notification";
import { Field, Int, ObjectType } from "type-graphql";
import { Notification } from "./Notification";

@ObjectType()
export class NotificationSearchResult {
    @Field((type) => [Notification])
    public notifications: INotification[];

    @Field((type) => Int)
    public total: number;
}
