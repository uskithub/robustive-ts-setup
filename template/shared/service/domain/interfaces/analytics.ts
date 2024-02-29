import { LogProperties } from "../analytics/log";

export interface Analytics {
    logEvent: (properties: LogProperties) => void
}