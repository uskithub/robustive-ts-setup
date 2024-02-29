import { ApplicationStore, createApplicationPerformer } from "./application";
import { createAuthenticationPerformer } from "./authentication";
import type { AuthenticationStore } from "./authentication";
import { createTimelinePerformer } from "./timeline";
import { createTaskManagementPerformer, TaskManagementStore } from "./taskManagement";

import { Actor } from "@/shared/service/application/actors";
import { Service as ServiceActor } from "@/shared/service/application/actors/service";
import { SignInStatus, SignInStatuses } from "@/shared/service/domain/interfaces/authenticator";
import { Usecases, UsecaseLog, Requirements, UsecasesOf, R } from "@/shared/service/application/usecases";
import { Nobody } from "@/shared/service/application/actors/nobody";
import { AuthenticatedUser } from "@/shared/service/application/actors/authenticatedUser";
import { AuthorizedUser, isAuthorizedUser } from "@/shared/service/application/actors/authorizedUser";

import { InjectionKey, reactive, watch, WatchStopHandle } from "vue";
import { RouteLocationRaw } from "vue-router";
import { Subscription } from "rxjs";

export type Mutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Store {}
export interface Performer<D extends keyof Requirements, T extends Store> {
    readonly store: T;
    dispatch: (usecase: UsecasesOf<D>, actor: Actor, service: Service) => Promise<Subscription | void>;
}

type ImmutableActor = Readonly<Actor>;
type ImmutableUsecaseLog = Readonly<UsecaseLog>;

export interface SharedStore extends Store {
    readonly actor: ImmutableActor;
    readonly executingUsecase: ImmutableUsecaseLog | null;
    readonly signInStatus: SignInStatus;
    readonly currentRouteLocation: RouteLocationRaw;
    readonly isLoading: boolean;
}

export type Service = {
    stores: {
        shared: SharedStore;
        application: ApplicationStore;
        authentication: AuthenticationStore;
        taskManagement: TaskManagementStore;
    };

    serviceActor: ServiceActor;

    change: (signInStatus: SignInStatus) => void;
    routingTo: (path: string) => void;
    commonCompletionProcess: (subscription: Subscription | null) => void;
    dispatch: (usecase: Usecases, actor?: Actor) => Promise<Subscription | void>;
};

export function createService(initialPath: string): Service {
    const shared = reactive<SharedStore>({
        actor: new Nobody()
        , executingUsecase: null
        , signInStatus: SignInStatuses.unknown()
        , currentRouteLocation: initialPath
        , isLoading: true
    });

    const serviceActor = new ServiceActor();

    const performers = {
        application: createApplicationPerformer()
        , authentication: createAuthenticationPerformer()
        , taskManagement: createTaskManagementPerformer()
        , timeline: createTimelinePerformer()
    };
    
    const service = {
        stores: {
            shared
            , application: performers.application.store
            , authentication: performers.authentication.store
            , taskManagement: performers.taskManagement.store
        }
        , serviceActor
        , change: (signInStatus: SignInStatus) => {
            const prevStatus = shared.signInStatus.case;
            const prevActor = shared.actor;
            const prevActorName = prevActor.constructor.name;
            
            const _shared = shared as Mutable<SharedStore>;
            _shared.signInStatus = signInStatus;
            
            switch (signInStatus.case) {
            case SignInStatus.signIn: {
                _shared.actor = new AuthorizedUser(signInStatus.userProperties);
                break;
            }
            case SignInStatus.signingIn: {
                _shared.actor = new AuthenticatedUser(signInStatus.account);
                break;
            }
            case SignInStatus.signOut: {
                if (isAuthorizedUser(prevActor)) {
                    prevActor.unsubscribe();
                }
                _shared.actor = new Nobody();
                break;
            }
            case SignInStatus.unknown: {
                _shared.actor = new Nobody();
                break;
            }
            }

            console.info(`SignInStatus changed: ${ prevStatus } ---> ${ signInStatus.case}, actor changed: ${ prevActorName } --->`, _shared.actor);
        }
        , routingTo: (path: string) => {
            const _shared = shared as Mutable<SharedStore>;
            _shared.currentRouteLocation = path;
            _shared.isLoading = false;
        }
        , commonCompletionProcess: (subscription: Subscription | null) => {
            subscription?.unsubscribe();
            const _shared = shared as Mutable<SharedStore>;
            _shared.executingUsecase = null;
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        , dispatch: (usecase: Usecases, actor?: Actor): Promise<Subscription | void> => {
            const _shared = shared as Mutable<SharedStore>;
            const _actor = actor || shared.actor;
    
            console.info(`[DISPATCH] ${ usecase.domain }.${ usecase.name }.${ usecase.course }.${ usecase.scene } (${ usecase.id })` );
            _shared.executingUsecase = { id: usecase.id, executing: { domain: usecase.domain, usecase: usecase.name }, startAt: new Date() };
    
            // new Log("dispatch", { context, actor: { actor: actor.constructor.name, user: actor.user } }).record();
            if (usecase.domain === R.keys.application && usecase.name === R.application.keys.boot) {
                return performers.application.dispatch(usecase, _actor, service)
                    .finally(() => service.commonCompletionProcess(null));
            }
    
            // 初回表示時対応
            // signInStatus が不明の場合、signInUserでないと実行できないUsecaseがエラーになるので、
            // ステータスが変わるのを監視し、その後実行し直す
            if (shared.signInStatus.case === SignInStatus.unknown) {
                console.info("[DISPATCH] signInStatus が 不明のため、ユースケースの実行を保留します...");
                let stopHandle: WatchStopHandle | null = null;
                return new Promise<void>((resolve) => {
                    stopHandle = watch(() => shared.signInStatus, (newValue) => {
                        if (newValue.case !== SignInStatus.unknown) {
                            console.log(`[DISPATCH] signInStatus が "${ newValue.case as string }" に変わったため、保留したユースケースを再開します...`);
                            resolve();
                        }
                    });
                })
                    .then(() => {
                        stopHandle?.();
                        return service.dispatch(usecase);
                    });
            }
            
            return Promise.resolve()
                .then(() => {
                    switch (usecase.domain) {
                    case R.keys.application: {
                        return performers.application.dispatch(usecase, _actor, service);
                    }
                    case R.keys.authentication: {
                        return performers.authentication.dispatch(usecase, _actor, service);
                    }
                    case R.keys.taskManagement: {
                        return performers.taskManagement.dispatch(usecase, _actor, service);
                    }
                    case R.keys.timeline: {
                        return performers.timeline.dispatch(usecase, _actor, service);
                    }
                    default: {
                        console.warn("Serivce.dispatchにて未定義ドメインのユースケースです: ", usecase);
                    }
                    }
                })
                .finally(() => service.commonCompletionProcess(null));
        }
    } as Service;

    return service;
}

export const SERVICE_KEY = Symbol("Service") as InjectionKey<Service>;