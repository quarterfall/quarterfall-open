import { Box, BoxProps } from "@mui/material";
import { StickerType } from "core";
import React from "react";

export type StickerProps = React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
> &
    BoxProps & {
        type: StickerType;
    };

export function Sticker(props: StickerProps) {
    const { type, ...rest } = props;
    return <Box component="img" src={`/stickers/${type}.svg`} {...rest} />;
}
