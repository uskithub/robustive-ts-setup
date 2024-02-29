import { Entity } from "@/shared/system/interfaces/architecture";
import dependencies from "../dependencies";
import { Observable } from "rxjs";

export const NoticeTypes = {
    all: "all"
    , individual: "individual"
} as const;

export type NoticeTypes = typeof NoticeTypes[keyof typeof NoticeTypes];

export type NoticeProperties = {
    id: string
    , type: NoticeTypes
    , title: string
    , body: string
    , isRead: boolean
};


export class Notice implements Entity<NoticeProperties> {
    properties: NoticeProperties;

    constructor(properties: NoticeProperties) {
        this.properties = properties;
    }

    /**
     * ユーザはサービスからの通知を受け取ることができなければならない。
     */
    static getUsersNotices(uid: string): Observable<[NoticeProperties]> {
        // TODO: ページングの表現
        return dependencies.notification.getUsersNotices(uid);
    }

    /**
     * ユーザは通知を閲覧済にできなければならない。
     */
    markAsRead(): Observable<void> {
        return dependencies.notification.markAsRead(this.properties.id);
    }

    /**
     * ユーザは通知を削除できなければならない。
     */
    remove(): Observable<void> {
        return dependencies.notification.remove(this.properties.id);
    }
}