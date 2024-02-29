
import { Account } from "@/shared/service/domain/authentication/user";
import { Actor } from ".";
import { MyBaseActor } from "../common";
import { DomainKeys, R, UsecaseKeys } from "../usecases";

export class AuthenticatedUser extends MyBaseActor<Account> {
    
    isAuthorizedTo(domain: DomainKeys, usecase: UsecaseKeys): boolean {
        if (domain === R.keys.authentication && usecase === R.authentication.keys.signOut) {
            return true;
        }
        if (domain === R.keys.authentication && usecase === R.authentication.keys.signUp) {
            return true;
        }
        return false;
    }
}
export const isAuthenticatedUser = (actor: Actor): actor is AuthenticatedUser => actor.constructor === AuthenticatedUser;