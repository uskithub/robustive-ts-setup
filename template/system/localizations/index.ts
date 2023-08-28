import { InjectionKey } from "vue";
import en from "./en";
import ja from "./ja";
export type Dictionary = typeof en;

const _languages = ["ja", "en"] as const;
export type _Languages = typeof _languages[number];
type Languages = { [lang in _Languages]: Dictionary };

export const DICTIONARY_KEY = Symbol("i18n") as InjectionKey<Dictionary>;

const languages: Languages = { ja, en };
const defaultLanguage = en;

// 用意された言語ファイルか検査
const isLanguage = (test: string): test is _Languages => {
    return languages[test as _Languages] !== undefined;
};

export const i18n = (language: string): Dictionary => {
    return isLanguage(language) ? languages[language] : defaultLanguage;
};