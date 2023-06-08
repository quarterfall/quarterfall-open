import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
    alpha,
    Box,
    ButtonBase,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { Submission } from "interface/Submission.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
    submission: Submission;
    handleGoToSubmission: (_: string) => void;
    selectedIndex?: number;
    setSelectedIndex?: (_: number) => void;
};

export const SubmissionHeaderStudentsDropdown = (props: Props) => {
    const {
        submission,
        handleGoToSubmission,
        selectedIndex,
        setSelectedIndex,
    } = props;
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const assignment = submission?.assignment;
    const submissions = assignment?.submissions || [];

    const firstGradedSub = submissions.findIndex((s) => s?.isApproved);

    return (
        <>
            <ButtonBase
                sx={{
                    padding: "6px 16px",
                    "&:hover": {
                        textDecoration: "none",
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadius}px`,
                        backgroundColor: (theme) =>
                            alpha(
                                theme.palette.text.primary,
                                theme.palette.action.hoverOpacity
                            ),
                    },
                }}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    setAnchorEl(event.currentTarget);
                }}
                disabled={submissions.length === 1}
            >
                <Typography variant="h4">
                    {submission?.student?.firstName}{" "}
                    {submission?.student?.lastName}
                </Typography>
                {submissions.length > 1 && (
                    <Box component="span" mr={-1} ml={2}>
                        <ArrowDropDownIcon />
                    </Box>
                )}
            </ButtonBase>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                }}
            >
                <div>
                    {assignment?.hasGrading &&
                        submissions.find((s) => !s.isApproved) && (
                            <ListSubheader>
                                {t("submission:unGradedSubmissions")}
                            </ListSubheader>
                        )}

                    {submissions.map((s, index) => {
                        return (
                            <>
                                {index === firstGradedSub && (
                                    <ListSubheader>
                                        {t("submission:gradedSubmissions")}
                                    </ListSubheader>
                                )}
                                <MenuItem
                                    value={s.id}
                                    key={s.id}
                                    selected={index === selectedIndex}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        setAnchorEl(null);
                                        handleGoToSubmission(s.id);
                                    }}
                                >
                                    <ListItemText
                                        primary={`${s?.student?.firstName} ${s?.student?.lastName}`}
                                    />
                                </MenuItem>
                            </>
                        );
                    })}
                </div>
            </Menu>
        </>
    );
};
