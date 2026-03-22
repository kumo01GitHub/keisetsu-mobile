import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import ja from "./locales/ja";

const resources = {
  en: { translation: en },
  ja: { translation: ja },
};

const supportedLanguages = Object.keys(resources);

function getDeviceLanguage(): string {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const lang = locale.languageCode;
    if (lang && supportedLanguages.includes(lang)) {
      return lang;
    }
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});

export default i18n;
