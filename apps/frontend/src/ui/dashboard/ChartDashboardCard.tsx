import {
    Avatar,
    Box,
    CardContent,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { ClickableCard, ClickableCardProps } from "ui/ClickableCard";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface ChartDashboardCardProps extends ClickableCardProps {
    title: string;
    description?: string;
    tooltipTitle?: string;
    icon: ReactNode;
    data: any;
    loading?: boolean;
}

export const ChartDashboardCard = (props: ChartDashboardCardProps) => {
    const { title, icon, data, description, loading, ...rest } = props;

    const markdown = `\`\`\`chart \n ${JSON.stringify({
        type: "pie",
        data,
    })} \n \`\`\``;

    return (
        <ClickableCard sx={{ minHeight: 200 }} {...rest}>
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

                    {loading && (
                        <Box
                            sx={{
                                height: 320,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                alignSelf: "center",
                                width: "100%",
                            }}
                        >
                            <Skeleton height="480px" width="100%" />
                        </Box>
                    )}

                    {!loading &&
                    data?.datasets[0]?.data.every((item) => item === 0) ? (
                        <Box
                            sx={{
                                height: 320,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                alignSelf: "center",
                                width: "80%",
                            }}
                        >
                            <Typography variant="h6" fontWeight="400">
                                {props.tooltipTitle}
                            </Typography>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                height: 320,
                                width: 320,
                                margin: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            <Markdown>{markdown}</Markdown>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </ClickableCard>
    );
};
