import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Stack } from "@mui/material";
import { Block } from "interface/Block.interface";
import { Choice } from "interface/Choice.interface";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { EditChoice } from "./EditChoice";
import { useDeleteChoice } from "./Question.data";

interface EditChoicesProps {
    block: Block;
}

export function EditChoices(props: EditChoicesProps) {
    const { block } = props;
    const { t } = useTranslation();
    const [confirmDeleteChoice, setConfirmDeleteChoice] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState("");
    const [deleteChoiceMutation] = useDeleteChoice();

    const choices = block.choices || [];

    return (
        <>
            {choices.map((choice: Choice, index: number) => {
                return (
                    <Stack
                        direction="row"
                        key={`choice_${index}`}
                        spacing={1}
                        style={{ width: "100%" }}
                    >
                        <EditChoice
                            key={`${block.id}-${choice.id}`}
                            blockId={block.id}
                            choice={choice}
                            index={index}
                            multipleCorrect={block.multipleCorrect}
                        />
                        <IconButton
                            size="medium"
                            sx={{ width: "53px", height: "53px" }}
                            disabled={
                                !block.multipleCorrect &&
                                choice.correct &&
                                choices.length > 1
                            }
                            onClick={() => {
                                setSelectedChoice(choice.id);
                                setConfirmDeleteChoice(true);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                );
            })}
            {/* Delete choice confirmation dialog */}
            <ConfirmationDialog
                open={confirmDeleteChoice}
                title={t("assignment:confirmDeleteChoiceTitle")}
                message={t("assignment:confirmDeleteChoiceMessage")}
                onContinue={() => {
                    setConfirmDeleteChoice(false);
                    setSelectedChoice("");
                    deleteChoiceMutation({
                        variables: {
                            blockId: block.id,
                            choiceId: selectedChoice,
                        },
                    });
                }}
                onCancel={() => {
                    setSelectedChoice("");
                    setConfirmDeleteChoice(false);
                }}
            />
        </>
    );
}
