import ContentCopy from "@mui/icons-material/ContentCopy";
import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import { useCopyToClipboard } from "hooks/useCopyToClipboard";
import { useToast } from "hooks/useToast";
import { useTranslation } from "react-i18next";
export interface CopyToClipboardButtonProps extends IconButtonProps {
    text: string;
    copyConfirmText?: string;
    tooltipTitle?: string;
}
export default function CopyToClipboardButton(
    props: CopyToClipboardButtonProps
) {
    const { t } = useTranslation();
    const {
        text,
        copyConfirmText = t("codeCopiedToClipboardConfirmation"),
        tooltipTitle = t("copyCodeToClipboard"),
        ...rest
    } = props;
    const { showSuccessToast } = useToast();
    const copy = useCopyToClipboard();

    const handleCopyToClipboard = async () => {
        copy(text);
        showSuccessToast(copyConfirmText);
    };

    return (
        <Tooltip title={tooltipTitle}>
            <IconButton onClick={handleCopyToClipboard} {...rest} size="large">
                <ContentCopy />
            </IconButton>
        </Tooltip>
    );
}
