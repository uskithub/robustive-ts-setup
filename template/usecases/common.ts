import { BaseScenario, Context, IActor, InteractResult, MutableContext, Scenes } from "robustive-ts";
import { Application } from "../../domain/application/application";
import { Actor } from "../actors";
import { UsecaseDefinitions, UsecaseKeys } from ".";

export abstract class MyBaseScenario<Z extends Scenes> extends BaseScenario<Z> {
    abstract next(to: MutableContext<Z>): Promise<Context<Z>>;

    authorize(actor: Actor, usecase: UsecaseKeys): boolean {
        return Application.authorize(actor, usecase);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    complete<A extends IActor<any>>(withResult: InteractResult<A, UsecaseDefinitions, UsecaseKeys, Z>) {
        // TODO: usecaseの実行結果をログに残す
        console.log("[COMPLETION]", withResult);
    }
}