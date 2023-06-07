import { Icon } from "@mui/material";
import { ReactNode } from "react";

export interface ColoredAvatarProps {
    children: ReactNode;
    disabled?: boolean;
}

export function ColoredAvatar(props: ColoredAvatarProps) {
    const { children, disabled } = props;
    return (
        <Icon
            sx={{
                ...(disabled && { color: "text.disabled" }),
                ...(!disabled && { color: "secondary.main" }),
            }}
        >
            {children}
        </Icon>
    );
}
