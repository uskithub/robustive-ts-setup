import { Actor } from ".";
import { MyBaseActor } from "../common";
import { DomainKeys, R, UsecaseKeys } from "../usecases";

export class Nobody extends MyBaseActor<null> {

    isAuthorizedTo(domain: DomainKeys, usecase: UsecaseKeys): boolean {
        if (domain === R.keys.application && usecase === R.application.keys.boot) {
            return true;
        }

        if (domain === R.keys.authentication 
            && (usecase === R.authentication.keys.signIn
                || usecase === R.authentication.keys.signUp)
        ) {
            return true;
        }
        return false;
    }
}
export const isNobody = (actor: Actor): actor is Nobody => actor.constructor === Nobody;