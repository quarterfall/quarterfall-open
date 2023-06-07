import { Button } from "@mui/material";

import MarkdownIcon from "mdi-material-ui/LanguageMarkdown";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

type Props = {};

export const PoweredByMarkdownButton = (props: Props) => {
    const { t } = useTranslation();
    const router = useNavigation();
    const handleClickMarkdown = () => {
        router.newTab(
            "https://help.quarterfall.com/learning-material/text-editor"
        );
    };
    return (
        <Button
            startIcon={<MarkdownIcon />}
            onClick={handleClickMarkdown}
            size="small"
            sx={(theme) => ({
                paddingY: 0,
                textTransform: "initial",
                height: 25,
                ...theme.typography.caption,
            })}
        >
            {t("poweredByMarkdown")}
        </Button>
    );
};
