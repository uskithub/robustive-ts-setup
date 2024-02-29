import { Nobody } from "./nobody";
import { AuthenticatedUser } from "./authenticatedUser";
import { AuthorizedUser } from "./authorizedUser";
import { Service } from "./service";

export type Actor = Nobody | AuthenticatedUser | AuthorizedUser | Service;