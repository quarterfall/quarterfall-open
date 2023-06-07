import PinIcon from "@mui/icons-material/PushPin";
import { Container, Grid, Stack, Typography } from "@mui/material";
import { BlockIcon } from "components/icons";
import { BlockType } from "core";
import { Assignment } from "interface/Assignment.interface";
import { getLastUsedProgrammingLanguage } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { ClickableCard } from "ui/ClickableCard";
import { useNavigation } from "ui/route/Navigation";
import { useAddBlock, useUpdateAssignment } from "../api/Assignment.data";

type Props = {
    assignment: Assignment;
};

export const AssignmentQuestionsEmpty = (props: Props) => {
    const { assignment } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const [updateAssignmentMutation] = useUpdateAssignment();

    const [addBlockMutation] = useAddBlock();

    const addIntroduction = async () => {
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input: { hasIntroduction: true },
            },
        });
        router.push(`/assignment/${assignment.id}/introduction`);
    };

    const allowedBlocks: BlockType[] = [
        BlockType.Text,
        BlockType.CodeQuestion,
        BlockType.OpenQuestion,
        BlockType.MultipleChoiceQuestion,
        BlockType.DatabaseQuestion,
        BlockType.FileUploadQuestion,
    ].filter(Boolean);

    const addBlock = async (type: BlockType) => {
        const currentBlocks = assignment.blocks;
        const input: any = {
            type,
        };
        if (type === BlockType.CodeQuestion) {
            input.programmingLanguage = getLastUsedProgrammingLanguage();
        }

        const result = await addBlockMutation({
            variables: {
                assignmentId: assignment.id,
                input,
            },
        });

        const updatedBlocks = result.data.addBlock.blocks;
        if (updatedBlocks.length === currentBlocks.length + 1) {
            router.push(
                `/assignment/${assignment.id}/questions/${
                    updatedBlocks[updatedBlocks.length - 1].id
                }`
            );
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                padding: 3,
            }}
        >
            <Grid container spacing={2}>
                {!assignment?.hasIntroduction && (
                    <Grid item sm={12} md={6} key="introduction">
                        <ClickableCard
                            variant="outlined"
                            onClick={() => addIntroduction()}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                minHeight: "150px",
                                height: "170px",
                                paddingRight: 1,
                                paddingLeft: 1,
                            }}
                            data-cy="addIntroductionButton"
                        >
                            <Stack spacing={4} alignItems="center">
                                <PinIcon color="primary" fontSize="large" />
                                <Typography variant="button">
                                    {t(`assignment:addIntroduction`)}
                                </Typography>
                            </Stack>
                        </ClickableCard>
                    </Grid>
                )}
                {allowedBlocks.map((type) => (
                    <Grid item sm={12} md={6} key={`blockType_${type}`}>
                        <ClickableCard
                            variant="outlined"
                            onClick={() => addBlock(type)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                minHeight: "150px",
                                height: "170px",
                                paddingRight: 1,
                                paddingLeft: 1,
                            }}
                            data-cy={`${t(
                                `assignment:addBlockType_${type}`
                            ).replace(/\s/g, "")}Button`}
                        >
                            <Stack spacing={4} alignItems="center">
                                <BlockIcon
                                    type={type}
                                    color="primary"
                                    fontSize="large"
                                />
                                <Typography variant="button">
                                    {t(`assignment:addBlockType_${type}`)}
                                </Typography>
                            </Stack>
                        </ClickableCard>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};
