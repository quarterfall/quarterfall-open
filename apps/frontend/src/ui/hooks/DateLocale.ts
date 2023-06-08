import { ampm, fallbackLanguage, systemLanguages } from "core";
import enLocale from "date-fns/locale/en-US";
import nlLocale from "date-fns/locale/nl";
import { useTranslation } from "react-i18next";

const localeMap = {
    en: enLocale,
    nl: nlLocale,
};

// Our hook
export function useDateLocale() {
    const { i18n } = useTranslation();

    let lang = i18n.language.split("-")[0];
    if (systemLanguages.indexOf(lang) < 0) {
        lang = fallbackLanguage;
    }
    return {
        locale: localeMap[lang] || enLocale,
        ampm: ampm.indexOf(lang) >= 0,
    };
}
