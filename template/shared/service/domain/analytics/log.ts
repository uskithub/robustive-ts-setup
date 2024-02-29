import { ValueObject } from "@/shared/system/interfaces/architecture";
import dependencies from "../dependencies";

export type LogProperties = {
    event: string;
    params: any;
};

export class Log implements ValueObject<LogProperties> {
    properties: LogProperties;

    constructor(event: string, params: any) {
        this.properties = { event, params };
    }

    /**
     * アプリはユーザのアクションに対して任意のパラメータを持つログを記録できなければならない。
     */
    record(): void {
        dependencies.analytics.logEvent(this.properties);
    }
}