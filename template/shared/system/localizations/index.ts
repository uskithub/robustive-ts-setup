// @see: https://qiita.com/kimamula/items/dccc15cb5830432a9fa2
// @see: https://www.kabuku.co.jp/developers/typescript-angular-i18n
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionalWord = (...args: any[]) => string;
type PartialDictionary = {
    [key: string]: string | FunctionalWord | PartialDictionary;
};

const Reference = class Reference<D extends PartialDictionary> {
    constructor(partialLocalizedDictionary: D, partialDefaultDictionary: D, path?: string) {
        return new Proxy(partialLocalizedDictionary, {
            get(target, prop, receiver) {
                // Vue から __v_isRef で参照されることがある
                if (prop === "__v_isRef") return Reflect.get(target, prop, receiver);
                if (typeof prop === "string" && prop in target) {
                    // Localizedにある場合
                    const subLocalizedItem = target[prop];
                    if (typeof subLocalizedItem === "string") {
                        return subLocalizedItem;
                    } else if (typeof subLocalizedItem === "object") {
                        const subDefaultDictionary = partialDefaultDictionary[prop];
                        return new Reference<Extract<typeof subDefaultDictionary, PartialDictionary>>(subLocalizedItem, subDefaultDictionary as unknown as Extract<typeof subDefaultDictionary, PartialDictionary>, path ? `${ path }.${ prop }` : prop );
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        return (...args: unknown[]) => subLocalizedItem(...args);
                    }
                } else if (typeof prop === "string" && prop in partialDefaultDictionary) {
                    // Defaultにはある場合
                    const subDefaultItem = partialDefaultDictionary[prop];
                    if (typeof subDefaultItem === "string") {
                        return subDefaultItem;
                    } else if (typeof subDefaultItem === "object") {
                        return new Reference<Extract<typeof subDefaultItem, PartialDictionary>>(subDefaultItem, subDefaultItem, path ? `${ path }.${ prop }` : prop);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        return (...args: unknown[]) => subDefaultItem(...args);
                    }
                }
                // どちらにもない場合
                const fullPath = path ? `${ path }.${ String(prop) }` : String(prop);
                // throw new Error(`No such word: Dictionary.${ fullPath }`);
                console.error(`No such word: Dictionary.${ fullPath }`);
                return `Dictionary.${ fullPath }`;
            }
        });
    }
} as new <D extends PartialDictionary>(partialLocalizedDictionary: D, partialDefaultDictionary: D, path?: string) => D;

export const i18n = (language: string): Dictionary => {
    return isLanguage(language) 
        ? new Reference<Dictionary>(languages[language], defaultLanguage) 
        : new Reference<Dictionary>(defaultLanguage, defaultLanguage);
};

