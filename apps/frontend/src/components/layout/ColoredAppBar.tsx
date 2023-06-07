import { AppBar, AppBarProps, useTheme } from "@mui/material";
import { colors } from "config";
import { useAuthContext } from "context/AuthProvider";

export function ColoredAppBar(props: AppBarProps) {
    const { style, ...rest } = props;
    const { me } = useAuthContext();
    const theme = useTheme();

    const appBarColor = me?.organization?.appBarColor || colors.appBar;
    const backgroundColor = appBarColor;
    const appBarContrastColor = theme.palette.getContrastText(appBarColor);

    return (
        <AppBar
            {...rest}
            sx={{
                backgroundColor: backgroundColor,
                backgroundImage: "none",
                color: appBarContrastColor,
                zIndex: theme.zIndex.drawer + 1,
                border: "none",
                ...style,
            }}
        />
    );
}
