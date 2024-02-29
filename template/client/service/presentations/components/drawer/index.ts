import { Enum, Empty } from "@shared/system/utils/enum";

export const DrawerContentType = {
    header: "header"
    , divider: "divider"
    , link: "link"
} as const;

type DrawerContentType = typeof DrawerContentType[keyof typeof DrawerContentType];

export type DrawerItem = Enum<{
    [DrawerContentType.header]: { title: string };
    [DrawerContentType.divider]: Empty;
    [DrawerContentType.link]: { title: string; href: string };
}>;