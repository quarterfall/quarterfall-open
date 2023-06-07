import { Box } from "@mui/material";
import { BlockIcon } from "components/icons";
import { BlockType } from "core";

export interface AssignmentStepIconProps {
    completed?: boolean;
    blockType: BlockType;
}

export function AssignmentStepIcon(props: AssignmentStepIconProps) {
    const { completed, blockType } = props;

    return (
        <Box
            sx={{
                backgroundColor: "text.disabled",
                width: "50px",
                height: "50px",
                color: (theme) =>
                    theme.palette.getContrastText(theme.palette.text.disabled),
                display: "flex",
                borderRadius: "50%",
                justifyContent: "center",
                alignItems: "center",
                ...(completed && {
                    backgroundColor: "primary.main",
                    color: (theme) =>
                        theme.palette.getContrastText(
                            theme.palette.primary.main
                        ),
                }),
            }}
        >
            <BlockIcon type={blockType} color="inherit" />
        </Box>
    );
}
