import SolutionIcon from "@mui/icons-material/EmojiObjects";
import { Box, Card, CardContent, CardHeader } from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface SolutionCardProps {
    assignment: Assignment;
    block: Block;
}

export function SolutionCard(props: SolutionCardProps) {
    const { assignment, block } = props;

    const { t } = useTranslation();

    // retrieve the solution
    const solution =
        block.solution || t("assignment:solutionPlaceholder") || "";

    return (
        <>
            <Card
                elevation={0}
                sx={{
                    position: "relative",
                    paddingLeft: 0.5,
                    backgroundColor: "action.hover",
                    width: "100%",
                }}
            >
                <CardHeader
                    sx={{ padding: 1 }}
                    title={t("solution")}
                    avatar={<SolutionIcon color="secondary" />}
                />
                <CardContent sx={{ padding: 1, paddingTop: 0 }}>
                    <Markdown files={assignment.files}>{solution}</Markdown>
                </CardContent>
                <Box
                    sx={{
                        position: "absolute",
                        width: "3px",
                        height: "100%",
                        top: 0,
                        left: 0,
                        backgroundColor: "secondary.main",
                    }}
                />
            </Card>
        </>
    );
}
