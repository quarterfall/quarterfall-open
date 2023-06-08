import { Box, Hidden } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";

export interface BrandProps {
    alwaysShowFullLogo?: boolean;
}

export function Brand(props: BrandProps) {
    const { alwaysShowFullLogo } = props;
    const { me } = useAuthContext();

    // get the logo information
    const logo = me?.organization?.logo;
    const logoMobile = me?.organization?.logoMobile;

    return (
        <>
            <Hidden smUp>
                {alwaysShowFullLogo ? (
                    <Box
                        component="img"
                        src={logo || `/logo_pro.png`}
                        alt={"siteName"}
                        sx={{ height: "40px", display: "block" }}
                    />
                ) : (
                    <Box
                        component="img"
                        src={logoMobile || logo || `/logo_no_text.png`}
                        alt={"siteName"}
                        sx={{ height: "40px", display: "block" }}
                    />
                )}
            </Hidden>
            <Hidden smDown>
                <Box
                    component="img"
                    src={logo || `/logo_pro.png`}
                    alt={"siteName"}
                    sx={{ height: "40px", display: "block" }}
                />
            </Hidden>
        </>
    );
}
