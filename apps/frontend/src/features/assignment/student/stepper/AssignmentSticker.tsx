import { Box, Tooltip } from "@mui/material";
import { StickerType } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Sticker } from "ui/Sticker";

export interface AssignmentStickerProps {
    id: string;
    sticker: StickerType;
    approved?: boolean;
}

export function AssignmentSticker(props: AssignmentStickerProps) {
    const { id, sticker, approved } = props;
    const { t } = useTranslation();

    const { position, rotation } = useMemo(() => {
        const nrRotation = parseInt(id.slice(-2), 16) || 0;
        const nrPosition = parseInt(id.slice(-4, -2), 16) || 0;

        return {
            position: 20 + Math.round(nrPosition / 4),
            rotation: Math.round((nrRotation - 128) / 8),
        };
    }, [id]);

    return (
        <Tooltip title={t(`submission:tooltipSticker_${sticker}`)!}>
            <Box
                sx={{
                    top: 20,
                    position: "absolute",
                    right: position + (approved ? 150 : 0),
                }}
            >
                <Sticker
                    type={sticker}
                    sx={{
                        width: "100px",
                        filter: "drop-shadow(3px 3px 5px #333333)",
                    }}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                    }}
                />
            </Box>
        </Tooltip>
    );
}
