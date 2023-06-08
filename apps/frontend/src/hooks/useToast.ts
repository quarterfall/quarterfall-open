import { SnackbarKey, useSnackbar, VariantType } from "notistack";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export function useToast() {
    const snackbar = useSnackbar();
    const { t } = useTranslation();
    const defaultMessage = t("changesSaved");

    return {
        showToast: useCallback(
            (message?: string, variant: VariantType = "info") =>
                snackbar?.enqueueSnackbar(message || defaultMessage, {
                    variant,
                }),
            [snackbar]
        ),
        showErrorToast: useCallback(
            (message?: string) =>
                snackbar?.enqueueSnackbar(message || defaultMessage, {
                    variant: "error",
                }),
            [snackbar]
        ),
        showSuccessToast: useCallback(
            (message?: string) =>
                snackbar?.enqueueSnackbar(message || defaultMessage, {
                    variant: "success",
                }),
            [snackbar]
        ),
        closeToast: useCallback(
            (snackbarId: SnackbarKey) => snackbar?.closeSnackbar(snackbarId),
            [snackbar]
        ),
    };
}
