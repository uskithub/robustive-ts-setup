
import { SignInValidationResult, User, Account } from "@/shared/service/domain/authentication/user";
import { MyBaseScenario } from "../../common";

import type { Context, Empty } from "robustive-ts";
import { catchError, firstValueFrom, map } from "rxjs";


/**
 * usecase: サインインする
 */
export type SignInScenes = {
    basics : {
        userStartsSignInProcess: { id: string | null; password: string | null; };
        serviceValidateInputs: { id: string | null; password: string | null; };
        onSuccessInValidatingThenServiceTrySigningIn: { id: string; password: string; };
    };
    alternatives: {
        userTapsSignUpButton: Empty;
    };
    goals : {
        onSuccessInSigningInThenServicePresentsHomeView: { account: Account; };
        onFailureInValidatingThenServicePresentsError: { result: SignInValidationResult; };
        onFailureInSigningInThenServicePresentsError: { error: Error; };
        servicePresentsSignUpView: Empty;
    };
};


export class SignInScenario extends MyBaseScenario<SignInScenes> {

    next(to: Context<SignInScenes>): Promise<Context<SignInScenes>> {
        switch (to.scene) {
        case this.keys.basics.userStartsSignInProcess: {
            return this.just(this.basics.serviceValidateInputs({ id: to.id, password: to.password }));
        }
        case this.keys.basics.serviceValidateInputs: {
            return this.validate(to.id, to.password);
        }
        case this.keys.basics.onSuccessInValidatingThenServiceTrySigningIn: {
            return this.signIn(to.id, to.password);
        }
        case this.keys.alternatives.userTapsSignUpButton: {
            return this.just(this.goals.servicePresentsSignUpView());
        }
        default: {
            throw new Error(`not implemented: ${ to.scene }`);
        }
        }
    }

    private validate(id: string | null, password: string | null): Promise<Context<SignInScenes>> {
        const result = User.validate(id, password);
        if (result === true && id !== null && password != null) {
            return this.just(this.basics.onSuccessInValidatingThenServiceTrySigningIn({ id, password }));
        } else {
            return this.just(this.goals.onFailureInValidatingThenServicePresentsError({ result }));
        }
    }

    private signIn(id: string, password: string): Promise<Context<SignInScenes>> {
        return firstValueFrom(
            User.signIn(id, password)
                .pipe(
                    map(account => this.goals.onSuccessInSigningInThenServicePresentsHomeView({ account }))
                    , catchError((error: Error) => this.just(this.goals.onFailureInSigningInThenServicePresentsError({ error })))
                )
        );
    }
}