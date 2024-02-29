import { User } from "@/shared/service/domain/authentication/user";
import { MyBaseScenario } from "../../common";

import type { Context, Empty } from "robustive-ts";
import { catchError, firstValueFrom, map } from "rxjs";

/**
 * usecase: サインアウトする
 */
export type SignOutScenes = {
    basics : {
        userStartsSignOutProcess: Empty;
        serviceClosesSession: Empty;
    };
    alternatives: {
        userResignSignOut: Empty;
    };
    goals: {
        onSuccessThenServicePresentsSignInView: Empty;
        onFailureThenServicePresentsError: { error: Error; };
        servicePresentsHomeView: Empty;
    };
};

export class SignOutScenario extends MyBaseScenario<SignOutScenes> {

    next(to: Context<SignOutScenes>): Promise<Context<SignOutScenes>> {
        switch (to.scene) {
        case this.keys.basics.userStartsSignOutProcess: {
            return this.just(this.basics.serviceClosesSession());
        }
        case this.keys.basics.serviceClosesSession: {
            return this.signOut();
        }
        case this.keys.alternatives.userResignSignOut: {
            return this.just(this.goals.servicePresentsHomeView());
        }
        default: {
            throw new Error(`not implemented: ${ to.scene }`);
        }
        }
    }

    private signOut(): Promise<Context<SignOutScenes>> {
        return firstValueFrom(
            User.signOut()
                .pipe(
                    map(() => this.goals.onSuccessThenServicePresentsSignInView())
                    , catchError((error: Error) => this.just(this.goals.onFailureThenServicePresentsError({ error })))
                )
        );
    }
}