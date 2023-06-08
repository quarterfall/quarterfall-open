import PersonIcon from "@mui/icons-material/Person";
import { Avatar, AvatarProps } from "@mui/material";
import { User } from "interface/User.interface";
import React from "react";

export interface UserAvatarProps extends AvatarProps {
    user: User | null | undefined;
}

export function UserAvatar(props: UserAvatarProps) {
    const { user, className, ...rest } = props;

    if (!user) {
        return (
            <Avatar
                sx={{
                    color: (theme) =>
                        theme.palette.getContrastText(
                            theme.palette.secondary.main
                        ),
                    backgroundColor: (theme) => theme.palette.secondary.main,
                }}
                {...rest}
            >
                <PersonIcon />
            </Avatar>
        );
    }

    return user.avatarImageSmall ? (
        <Avatar src={user.avatarImageSmall} {...rest} />
    ) : (
        <Avatar
            {...rest}
            className={className}
            sx={{
                color: (theme) =>
                    theme.palette.getContrastText(theme.palette.secondary.main),
                backgroundColor: (theme) => theme.palette.secondary.main,
            }}
        >
            {user.avatarName}
        </Avatar>
    );
}
