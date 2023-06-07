import RestoreIcon from "@mui/icons-material/Restore";
import {
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { StickerType } from "core";
import { useTranslation } from "react-i18next";
import { Sticker } from "ui/Sticker";

export interface AssignmentCompletedCardProps {
    handleClickReset?: () => void;
}
export const AssignmentCompletedCard = (
    props: AssignmentCompletedCardProps
) => {
    const { handleClickReset } = props;
    const { t } = useTranslation();
    const isMobile = useMediaQuery("(max-width:599px)");

    return (
        <Card>
            <CardContent>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={3}
                    style={{ height: 300 }}
                >
                    <Sticker
                        type={StickerType.CheckYes}
                        sx={(theme) => ({
                            [theme.breakpoints.up("sm")]: {
                                width: "120px",
                                height: "120px",
                            },
                            width: "100px",
                            height: "100px",
                        })}
                    />
                    <Typography variant="h6" align="center">
                        {t("assignment:publicAssignmentFinished")}
                    </Typography>
                    {handleClickReset && (
                        <Button
                            variant="contained"
                            color="primary"
                            size={isMobile ? "medium" : "large"}
                            startIcon={<RestoreIcon />}
                            onClick={handleClickReset}
                        >
                            {t("assignment:redoAssignmentTitle")}
                        </Button>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};
