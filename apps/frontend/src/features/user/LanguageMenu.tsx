import { MenuItem } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { fallbackLanguage, systemLanguages } from "core";
import { useUpdateMe } from "features/auth/hooks/Auth.data";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { LabeledSelect } from "ui/form/inputs/LabeledSelect";

export function LanguageMenu() {
    const { t, i18n } = useTranslation();
    const { me } = useAuthContext();
    const [updateMeMutation] = useUpdateMe();
    const router = useRouter();

    let i18nLanguage = i18n.language.split("-")[0];
    if (systemLanguages.indexOf(i18nLanguage) < 0) {
        i18nLanguage = fallbackLanguage;
    }

    const handleChangeLanguage = async (event) => {
        // update the language used for translations
        document.cookie = `NEXT_LOCALE=${event.target.value}`;

        // update the user language
        await updateMeMutation({
            variables: {
                input: {
                    language: event.target.value,
                },
            },
        });
        router.push("/user/interface", "/user/interface", {
            locale: event.target.value,
        });
    };

    return (
        <LabeledSelect
            style={{ minWidth: 200 }}
            displayEmpty
            label={t("user:interfaceLanguage")}
            value={me?.language || fallbackLanguage}
            onChange={handleChangeLanguage}
        >
            {systemLanguages.map((language) => (
                <MenuItem key={`languageMenuItem_${language}`} value={language}>
                    {t(`languages:notrans_${language}`)}
                </MenuItem>
            ))}
        </LabeledSelect>
    );
}
