import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/i18n/messages/en.json";
import ptBR from "@/i18n/messages/pt-BR.json";

export const supportedLanguages = [
    "pt-BR",
    "en",
] as const;

export type AppLanguage =
    (typeof supportedLanguages)[number];

const LANGUAGE_STORAGE_KEY =
    "@talora:language";

function getDeviceLanguage(): AppLanguage {
    const deviceLanguage =
        Localization.getLocales()[0]
            ?.languageTag;

    if (deviceLanguage?.startsWith("pt")) {
        return "pt-BR";
    }

    return "en";
}

void i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: "v4",

        resources: {
            "pt-BR": {
                translation: ptBR,
            },
            en: {
                translation: en,
            },
        },

        lng: getDeviceLanguage(),
        fallbackLng: "pt-BR",

        interpolation: {
            escapeValue: false,
        },
    });

export async function loadStoredLanguage(): Promise<void> {
    const storedLanguage =
        await AsyncStorage.getItem(
            LANGUAGE_STORAGE_KEY,
        );

    if (
        storedLanguage === "pt-BR" ||
        storedLanguage === "en"
    ) {
        await i18n.changeLanguage(
            storedLanguage,
        );
    }
}

export async function changeAppLanguage(
    language: AppLanguage,
): Promise<void> {
    await i18n.changeLanguage(language);

    await AsyncStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        language,
    );
}

export default i18n;