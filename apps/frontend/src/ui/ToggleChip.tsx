import { Chip, ChipProps } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import React from "react";

export interface ToggleChipProps extends ChipProps {
    selected?: boolean;
}

export function ToggleChip(props: ToggleChipProps) {
    const { selected, ...rest } = props;

    return (
        <Chip
            color={selected ? "primary" : undefined}
            icon={selected ? <CheckIcon /> : undefined}
            {...rest}
        />
    );
}
