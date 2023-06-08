import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionProps,
    AccordionSummary,
    alpha,
    Box,
    Typography,
} from "@mui/material";
import { ReactNode } from "react";

export interface CollapsingCardProps extends AccordionProps {
    title: string;
    avatar?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}

export default function CollapsingCard(props: CollapsingCardProps) {
    const { children, title, avatar, actions, ...rest } = props;

    return (
        <Accordion
            sx={{ background: alpha("#fff", 0.05), width: "100%" }}
            {...rest}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${title}-content`}
                id={`${title}-header`}
            >
                <Box display="flex" alignItems="center" position="relative">
                    {avatar}
                    <Typography sx={{ marginLeft: 2 }}>{title}</Typography>
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        width: "3px",
                        height: "100%",
                        top: 0,
                        left: 0,
                        backgroundColor: "secondary.main",
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
                    }}
                />
            </AccordionSummary>
            <AccordionDetails>
                {children}
                <Box
                    sx={{
                        position: "absolute",
                        width: "3px",
                        height: "100%",
                        top: 0,
                        left: 0,
                        backgroundColor: "secondary.main",
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
                    }}
                />
            </AccordionDetails>
            {actions && <AccordionActions>{actions}</AccordionActions>}
        </Accordion>
    );
}
