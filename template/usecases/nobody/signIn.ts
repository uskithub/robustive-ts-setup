
import { SignInValidationResult, User, UserProperties } from "@/shared/service/domain/authentication/user";
import { Nobody } from ".";

import { MyBaseScenario } from "../common";
import { Context, Empty, MutableContext } from "robustive-ts";
import { catchError, map, Observable } from "rxjs";

const _u = Nobody.signIn;

/**
 * usecase: サインインする
 */
export type SignInScenes = {
    basics : {
        [_u.basics.userStartsSignInProcess]: { id: string | null; password: string | null; };
        [_u.basics.serviceValidateInputs]: { id: string | null; password: string | null; };
        [_u.basics.onSuccessInValidatingThenServiceTrySigningIn]: { id: string; password: string; };
    };
    alternatives: Empty;
    goals : {
        [_u.goals.onSuccessInSigningInThenServicePresentsHomeView]: { user: UserProperties; };
        [_u.goals.onFailureInValidatingThenServicePresentsError]: { result: SignInValidationResult; };
        [_u.goals.onFailureInSigningInThenServicePresentsError]: { error: Error; };
    };
};


export class SignInScenario extends MyBaseScenario<SignInScenes> {

    next(to: MutableContext<SignInScenes>): Promise<Context<SignInScenes>> {
        switch (to.scene) {
        case _u.basics.userStartsSignInProcess: {
            return this.just(this.basics[_u.basics.serviceValidateInputs]({ id: to.id, password: to.password }));
        }
        case _u.basics.serviceValidateInputs: {
            return this.validate(to.id, to.password);
        }
        case _u.basics.onSuccessInValidatingThenServiceTrySigningIn: {
            return this.signIn(to.id, to.password);
        }
        default: {
            throw new Error(`not implemented: ${ to.scene }`);
        }
        }
    }

    private validate(id: string | null, password: string | null): Promise<Context<SignInScenes>> {
        const result = User.validate(id, password);
        if (result === true && id !== null && password != null) {
            return this.just(this.basics[_u.basics.onSuccessInValidatingThenServiceTrySigningIn]({ id, password }));
        } else {
            return this.just(this.goals[_u.goals.onFailureInValidatingThenServicePresentsError]({ result }));
        }
    }

    private signIn(id: string, password: string): Promise<Context<SignInScenes>> {
        return User.signIn(id, password)
            .pipe(
                map(userProperties => this.goals[_u.goals.onSuccessInSigningInThenServicePresentsHomeView]({ user: userProperties }))
                , catchError((error: Error) => this.just(this.goals[_u.goals.onFailureInSigningInThenServicePresentsError]({ error })))
            );
    }
}