/* eslint-disable @typescript-eslint/no-explicit-any */
import dependencies from "../dependencies";
import { SignInStatus } from "../interfaces/authenticator";

import { Service } from "@/shared/system/interfaces/architecture";
import { Actor } from "../../application/actors";
import { isSignedInUser } from "../../application/actors/signedInUser";
import { isService } from "../../application/actors/service";
import { UsecaseKeys } from "../../application/usecases";
import { isNobody } from "robustive-ts";
import { Observable } from "rxjs";

export class Application implements Service {

    /**
     * アプリはユーザがサインインしているかどうかを知ることができなければならない。
     * @returns 
     */
    static signInStatus(): Observable<SignInStatus> {
        return dependencies.auth.signInStatus();
    }

    /**
     * アプリはどのアクターがどのユースケースを実行できるかを制御できなければならない。
     * @param actor 
     * @param usecase 
     * @returns 
     */
    static authorize(actor: Actor, usecase: UsecaseKeys): boolean {

        switch (usecase) {
        /* Nobody */
        case "boot": {
            return true;
        }
        case "signUp":
        case "signIn": {
            return isNobody(actor);
        }
        }

        // 開発時はここでエラーを発生させた方が分かりやすい
        throw new Error(`USECASE "${ usecase }" IS NOT AUTHORIZED FOR ACTOR "${ actor.constructor.name }."`);
    }
}