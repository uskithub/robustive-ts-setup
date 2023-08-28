import { NoticeProperties } from "../notification/notice";
import { Observable } from "rxjs";

export interface Notifier {
    getUsersNotices: (uid: string) => Observable<[NoticeProperties]>
    markAsRead: (id: string) => Observable<void>
    remove: (id: string) => Observable<void>
}