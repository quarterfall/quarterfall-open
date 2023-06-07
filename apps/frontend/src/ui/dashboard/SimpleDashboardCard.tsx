import {
    Avatar,
    CardActions,
    CardContent,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import isString from "lodash/isString";
import { ReactNode } from "react";
import { ClickableCard, ClickableCardProps } from "ui/ClickableCard";

export interface SimpleDashboardCardProps extends ClickableCardProps {
    title?: string;
    description?: string | ReactNode;
    secondaryDescription?: string | ReactNode;
    icon?: ReactNode;
    loading?: boolean;
    data?: any;
    clickable?: boolean;
    action?: ReactNode;
}

export const SimpleDashboardCard = (props: SimpleDashboardCardProps) => {
    const {
        title,
        icon,
        description,
        secondaryDescription,
        loading,
        clickable = true,
        action,
        ...rest
    } = props;

    return (
        <ClickableCard
            sx={{
                cursor: clickable ? "pointer" : "default",
                height: "100%",
            }}
            disabled={!clickable}
            {...rest}
        >
            <CardContent>
                <Stack>
                    <Stack
                        direction="row"
                        spacing={3}
                        sx={{ justifyContent: "space-between" }}
                    >
                        <Typography
                            color="textSecondary"
                            gutterBottom
                            variant="overline"
                        >
                            {title}
                        </Typography>

                        <Avatar
                            sx={{
                                backgroundColor: "secondary.main",
                                color: "common.white",
                                height: 42,
                                width: 42,
                            }}
                        >
                            {icon}
                        </Avatar>
                    </Stack>
                    {loading ? (
                        <Skeleton
                            width="60%"
                            height={"2.5rem"}
                            sx={{ padding: 0 }}
                        />
                    ) : isString(description) ? (
                        <Typography
                            color="textPrimary"
                            variant={description?.length > 10 ? "h4" : "h3"}
                        >
                            {description}
                        </Typography>
                    ) : (
                        <>{description}</>
                    )}
                    {loading ? (
                        <Skeleton width="20%" />
                    ) : isString(secondaryDescription) ? (
                        <Typography color="textPrimary" variant="subtitle1">
                            {secondaryDescription}
                        </Typography>
                    ) : (
                        <>{secondaryDescription}</>
                    )}
                </Stack>
            </CardContent>
            {action && <CardActions>{action}</CardActions>}
        </ClickableCard>
    );
};
