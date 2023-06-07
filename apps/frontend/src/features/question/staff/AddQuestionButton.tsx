import AddIcon from "@mui/icons-material/Add";
import PinIcon from "@mui/icons-material/PushPin";
import {
    Button,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { BlockIcon } from "components/icons";
import { BlockType } from "core";
import { Assignment } from "interface/Assignment.interface";
import { getLastUsedProgrammingLanguage } from "interface/Block.interface";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import {
    useAddBlock,
    useUpdateAssignment,
} from "../../assignment/staff/api/Assignment.data";

export interface AddQuestionButtonProps {
    assignment: Assignment;
}

export const AddQuestionButton = ({ assignment }: AddQuestionButtonProps) => {
    const { t } = useTranslation();
    const router = useNavigation();

    const [updateAssignmentMutation] = useUpdateAssignment();
    const [addBlockMutation] = useAddBlock();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorEl(event.currentTarget);
    }

    const addIntroduction = async () => {
        setAnchorEl(null);
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input: { hasIntroduction: true },
            },
        });
        router.push(`/assignment/${assignment.id}/introduction`);
    };

    const addBlock = async (type: BlockType) => {
        setAnchorEl(null);
        const currentBlocks = assignment.blocks;
        const input: any = {
            type,
        };
        if (type === BlockType.CodeQuestion) {
            input.programmingLanguage = getLastUsedProgrammingLanguage();
        }

        const results = await addBlockMutation({
            variables: {
                assignmentId: assignment.id,
                input,
            },
        });

        const updatedBlocks = results.data.addBlock.blocks;
        if (updatedBlocks.length === currentBlocks.length + 1) {
            router.push(
                `/assignment/${assignment.id}/questions/${
                    updatedBlocks[updatedBlocks.length - 1].id
                }`
            );
        }
    };
    const allowedBlocks: BlockType[] = [
        BlockType.Text,
        BlockType.CodeQuestion,
        BlockType.OpenQuestion,
        BlockType.MultipleChoiceQuestion,
        BlockType.DatabaseQuestion,
        BlockType.FileUploadQuestion,
    ].filter(Boolean);
    return (
        <>
            <Button
                variant="contained"
                size="large"
                onClick={handleClick}
                color="primary"
                startIcon={<AddIcon />}
            >
                {t("add")}
            </Button>

            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                variant="menu"
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {!assignment?.hasIntroduction && (
                    <>
                        <MenuItem
                            key="introduction"
                            onClick={() => addIntroduction()}
                        >
                            <ListItemIcon>
                                <PinIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={t(`assignment:introduction`)}
                            />
                        </MenuItem>
                    </>
                )}
                {allowedBlocks.map((type) => (
                    <MenuItem
                        key={`blockType_${type}`}
                        onClick={() => addBlock(type)}
                    >
                        <ListItemIcon>
                            <BlockIcon type={type} />
                        </ListItemIcon>
                        <ListItemText
                            primary={t(`assignment:blockType_${type}`)}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
