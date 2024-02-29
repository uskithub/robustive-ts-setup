
import { UserProperties } from "@/shared/service/domain/authentication/user";
import { Actor } from ".";
import { MyBaseActor } from "../common";
import { DomainKeys, R, UsecaseKeys } from "../usecases";
import { Subscription } from "rxjs";

export class AuthorizedUser extends MyBaseActor<UserProperties> {
    // ハードプライベート（#subscriptions）にすると、reactiveに入れたときにエラーになるようなので、privateにしておく// 以下のエラーが発生する
    // Uncaught (in promise) TypeError: Cannot read private member #subscriptions from an object whose class did not declare it
    //  at Proxy.addSubscription (authorizedUser.ts:23:14)
    private subscriptions: Subscription[] = [];
    
    isAuthorizedTo(domain: DomainKeys, usecase: UsecaseKeys): boolean {
        if (domain === R.keys.authentication && usecase === R.authentication.keys.signOut
            || domain === R.keys.taskManagement && usecase === R.taskManagement.keys.updateTaskTitle
            || domain === R.keys.taskManagement && usecase === R.taskManagement.keys.rearrangeTask) {
            return true;
        }
        return false;
    }

    /**
     * サインイン時に unsubscribe する Subscription を追加します。
     * @param subscription 
     */
    addSubscription(subscription: Subscription): void { 
        this.subscriptions.push(subscription); 
    }

    /**
     * 保持しているすべての Subscription を unsubscribe します。
     */
    unsubscribe(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}

export const isAuthorizedUser = (actor: Actor): actor is AuthorizedUser => actor.constructor === AuthorizedUser;