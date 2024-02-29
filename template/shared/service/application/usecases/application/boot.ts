import { SignInStatus } from "@shared/service/domain/interfaces/authenticator";
import { Application } from "@/shared/service/domain/application/application";
import { User, Account, UserProperties } from "@/shared/service/domain/authentication/user";
import { MyBaseScenario } from "../../common";

import type { Context, Empty } from "robustive-ts";
import { Observable, firstValueFrom, map } from "rxjs";

/**
 * usecase: 起動する
 */
export type BootScenes = {
    basics: {
        userOpensSite: Empty;
        serviceChecksSession: Empty;
        sessionExistsThenServiceStartsNotifyingPresence: { account: Account; };
        servicePreparesForObservingUserData: { account: Account; };
    };
    alternatives: Empty;
    goals: {
        servicePresentsHomeView: { account: Account, userDataObservable: Observable<UserProperties | null>; };
        sessionNotExistsThenServicePresentsSignInView: Empty;
    };
};

/**
 * コンストラクタでSceneが保持するContextを設定します。
 * next関数で、一つ前のコンテキストを見て処理を分岐し、このSceneで実行した結果をContextとして保持する新たなSceneを返します。
 *
 * ※ シナリオの実装なので、分岐ロジックのみとし、ドメイン知識は持ち込まないこと
 */
export class BootScenario extends MyBaseScenario<BootScenes> {

    next(to: Context<BootScenes>): Promise<Context<BootScenes>> {
        switch (to.scene) {
        case this.keys.basics.userOpensSite: {
            return this.just(this.basics.serviceChecksSession());
        }
        case this.keys.basics.serviceChecksSession: {
            return this.checkSession();
        }
        case this.keys.basics.sessionExistsThenServiceStartsNotifyingPresence: {
            return this.startsNotifyingPresence(to.account);
        }
        case this.keys.basics.servicePreparesForObservingUserData: {
            return this.getUserDataObservable(to.account);
        }
        default: {
            throw new Error(`not implemented: ${ to.scene }`);
        }
        }
    }

    private checkSession(): Promise<Context<BootScenes>> {
        return firstValueFrom(
            Application
                .signInStatus()
                .pipe(
                    map((signInStatus) => {
                        switch (signInStatus.case) {
                        case SignInStatus.signingIn: {
                            return this.basics.sessionExistsThenServiceStartsNotifyingPresence({ account: signInStatus.account });
                        }
                        default: {     
                            return this.goals.sessionNotExistsThenServicePresentsSignInView();
                        }
                        }
                    })
                )
        );
    }

    private startsNotifyingPresence(account: Account): Promise<Context<BootScenes>> {
        new User(account).startNotifyingPresence();
        return this.just(this.basics.servicePreparesForObservingUserData({ account }));
    }

    private getUserDataObservable(account: Account): Promise<Context<BootScenes>> {
        const observable = new User(account).observable;
        return this.just(this.goals.servicePresentsHomeView({ account, userDataObservable: observable }));
    }
}