import LaunchIcon from "@mui/icons-material/Launch";
import { Button, Stack, Typography } from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

interface ViewFileUploadQuestionProps {
    assignment: Assignment;
    block: Block;
    showCheckAnswer?: boolean;
}

export function ViewFileUploadQuestion(props: ViewFileUploadQuestionProps) {
    const { assignment, block, showCheckAnswer = false } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    return showCheckAnswer ? (
        <Stack spacing={2} alignItems="center">
            <Typography style={{ textAlign: "center" }}>
                {t("assignment:noPreviewViewAsStudent")}
            </Typography>
            <Button
                variant="outlined"
                color="primary"
                onClick={() =>
                    router.newTab(`/assignment/${assignment.id}/test`)
                }
                startIcon={<LaunchIcon />}
            >
                {t("assignment:viewAsStudent")}
            </Button>
        </Stack>
    ) : (
        <Markdown files={assignment?.files}>{block?.text}</Markdown>
    );
}
