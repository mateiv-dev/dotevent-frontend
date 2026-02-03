"use client";

import { useApp } from "../context/AppContext";
import { en } from "../locales/en";
import { ro } from "../locales/ro";

const translations = {
  en,
  ro,
};

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
  ? `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
  : `${TKey}`;
}[keyof TObj & (string | number)];

export type TranslationKey = RecursiveKeyOf<typeof en>;

export function useTranslation() {
  const { settings } = useApp();
  const language = settings.appearance.language;
  const dict = translations[language];

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const keys = key.split(".");
    let value: any = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        value = undefined;
        let fallbackValue: any = translations.en;
        for (const fbK of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fbK in fallbackValue) {
            fallbackValue = fallbackValue[fbK as keyof typeof fallbackValue];
          } else {
            return key;
          }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return value;
  };

  return { t, language };
}
