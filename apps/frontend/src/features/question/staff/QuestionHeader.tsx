import AssessmentIcon from "@mui/icons-material/Assessment";
import EditIcon from "@mui/icons-material/Edit";
import SolutionIcon from "@mui/icons-material/EmojiObjects";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { Box, IconButton, MenuItem, Typography } from "@mui/material";
import { RouteTabs } from "components/layout/RouteTabs";
import { BlockType, Permission } from "core";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { SelectController } from "ui/form/SelectController";
import { PageHeading } from "ui/PageHeading";
import { EditQuestionTitleDialog } from "./EditQuestionTitleDialog";

export interface BlockNavigationProps {
    assignment: Assignment;
    block: Block;
}

export const QuestionHeader = ({ assignment, block }: BlockNavigationProps) => {
    const { t } = useTranslation();
    const [createBlockDialogOpen, setCreateBlockDialogOpen] = useState(false);
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();

    const can = usePermission();
    const module = assignment.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    const routes = [
        {
            link: "",
            text: "content",
            icon: <EditIcon key="edit_icon" />,
        },
        {
            link: "solution",
            icon: <SolutionIcon key="solution_icon" />,
            disabled: block.type === BlockType.Text,
        },
        {
            link: assignment?.hasGrading ? "assessment" : "feedback",
            icon: assignment?.hasGrading ? (
                <AssessmentIcon key="assessment_icon" />
            ) : (
                <FeedbackIcon key="feedback_icon" />
            ),
            disabled: block.type === BlockType.Text,
        },
    ];

    const blockHeading = `${
        block.title || `${t("assignment:question")} ${block.index + 1}`
    }`;

    const allowedBlocks: BlockType[] = [
        BlockType.Text,
        BlockType.CodeQuestion,
        BlockType.OpenQuestion,
        BlockType.MultipleChoiceQuestion,
        BlockType.DatabaseQuestion,
        BlockType.FileUploadQuestion,
    ].filter(Boolean);

    const defaultValues = {
        ...block,
    };
    const { control, reset } = useAutosaveForm({
        delay: 0,
        onSave: async (input) => {
            const optimisticResponse: any = {
                updateBlock: {
                    __typename: "Block",
                    ...block,
                    type: input.type,
                },
            };
            await updateBlockMutation({
                variables: {
                    id: block.id,
                    input,
                },
                optimisticResponse,
            });

            showSuccessToast();
        },
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [block?.id]);

    return (
        <>
            <PageHeading
                editableTitle={
                    <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    cursor: readOnly ? "default" : "pointer",
                                    "&:hover": {
                                        background: readOnly
                                            ? "null"
                                            : "action.hover",
                                        borderRadius: "2px",
                                    },
                                }}
                                onClick={() => {
                                    if (readOnly) {
                                        return null;
                                    }
                                    setCreateBlockDialogOpen(true);
                                }}
                            >
                                {blockHeading}
                            </Typography>
                            {!readOnly && (
                                <IconButton
                                    style={{ marginLeft: "4px" }}
                                    onClick={() => {
                                        setCreateBlockDialogOpen(true);
                                    }}
                                    size="large"
                                >
                                    <EditIcon />
                                </IconButton>
                            )}
                        </Box>
                        <EditQuestionTitleDialog
                            block={block}
                            open={createBlockDialogOpen}
                            onClose={() => setCreateBlockDialogOpen(false)}
                        />
                    </>
                }
                editableSubheader={
                    readOnly ? (
                        t(`assignment:blockType_${block?.type}`)
                    ) : (
                        <SelectController
                            variant="standard"
                            disableUnderline
                            name="type"
                            sx={{
                                minWidth: "100px",
                                "&:hover": {
                                    background: "action.hover",
                                },
                            }}
                            control={control}
                            disabled={readOnly}
                        >
                            {Object.keys(allowedBlocks).map((key) => {
                                return (
                                    <MenuItem
                                        key={key}
                                        value={allowedBlocks[key]}
                                    >
                                        {t(
                                            `assignment:blockType_${allowedBlocks[key]}`
                                        )}
                                    </MenuItem>
                                );
                            })}
                        </SelectController>
                    )
                }
                index={block.index + 1}
            />
            <Box py={2} justifyContent="center" alignItems="center">
                <RouteTabs routes={routes} />
            </Box>
        </>
    );
};
