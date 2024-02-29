import { Analytics } from "./interfaces/analytics";
import { Authenticator } from "./interfaces/authenticator";
import { Notifier } from "./interfaces/notifier";

export interface Dependencies {
    auth: Authenticator;
    analytics: Analytics;
    notification: Notifier;
}

export default {
    auth : {} as Authenticator
    , analytics: {} as Analytics
    , notification: {} as Notifier
} as Dependencies;