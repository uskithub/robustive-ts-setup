import { DomainKeys, UsecaseKeys } from "./usecases";

import { BaseActor, BaseScenario, Context, DomainRequirements, IActor, InteractResult, Scenes } from "robustive-ts";

export abstract class MyBaseActor<User> extends BaseActor<User> {
    abstract isAuthorizedTo(domain: DomainKeys, usecase: UsecaseKeys): boolean;
}

export abstract class MyBaseScenario<Z extends Scenes> extends BaseScenario<Z> {
    abstract next(to: Context<Z>): Promise<Context<Z>>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorize<A extends IActor<any>, R extends DomainRequirements, D extends Extract<keyof R, string>, U extends Extract<keyof R[D], string>>(actor: A, domain: D, usecase: U): boolean {
        if ((actor as unknown as MyBaseActor<unknown>).isAuthorizedTo(domain as DomainKeys, usecase as UsecaseKeys)) {
            return true;
        }
        // 開発時はここでエラーを発生させた方が分かりやすい
        throw new Error(`USECASE "${ usecase }" IS NOT AUTHORIZED FOR ACTOR "${ actor.constructor.name }."`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    complete<A extends IActor<any>, R extends DomainRequirements, D extends keyof R, U extends keyof R[D]>(withResult: InteractResult<R, D, U, A, Z>): void {
        // TODO: usecaseの実行結果をログに残す
        console.info(`[COMPLETION] ${ String(withResult.domain) }.${ String(withResult.usecase) } (${ withResult.id })`, withResult);
    }
}