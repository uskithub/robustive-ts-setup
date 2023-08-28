import { createApplicationPerformer } from "./application";
import { createAuthenticationPerformer } from "./authentication";
import { Actor } from "@/shared/service/application/actors";
import { Service } from "@/shared/service/application/actors";
import { Usecases, UsecaseLog } from "@/shared/service/application/usecases";
import { SignInStatus, SignInStatuses } from "@/shared/service/domain/interfaces/authenticator";

// System
import { Nobody } from "robustive-ts";
import { InjectionKey, reactive, watch, WatchStopHandle } from "vue";

export type Mutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Store { };
export interface Performer<T extends Store> { readonly store: T; };

type ImmutableActor = Readonly<Actor>;
type ImmutableUsecaseLog = Readonly<UsecaseLog>;

export interface SharedStore extends Store {
    readonly actor: ImmutableActor;
    readonly executingUsecase: ImmutableUsecaseLog | null;
    readonly signInStatus: SignInStatus;
};

type Stores = {
    shared: SharedStore;
    // your_store: YourStore;
};

export type Dispatcher = {
    stores: Stores;
    change: (actor: Actor) => void;
    dispatch: (usecase: Usecases) => void; 
};

export function createDispatcher(): Dispatcher {
    const shared = reactive<SharedStore>({
        actor: new Nobody()
        , executingUsecase: null
        , signInStatus: SignInStatuses.unknown()
    });

    const dispatcher = {
        stores: {
            shared
        }
        , change(actor: Actor) {
            const _shared = shared as Mutable<SharedStore>;
            _shared.actor = actor;
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        , dispatch() {}
    } as Dispatcher;

    const performers = {
        application: createApplicationPerformer(dispatcher)
        , authentication: createAuthenticationPerformer(dispatcher)
    };

    dispatcher.dispatch = (usecase: Usecases) => {
        const _shared = shared as Mutable<SharedStore>;
        const actor = shared.actor;

        switch (usecase.name) {
        /* Nobody */
        case "boot": {
            console.info("[DISPATCH] Boot:", usecase);
            performers.application.boot(usecase, actor);
            return;
        }
        }

        // 初回表示時対応
        // signInStatus が不明の場合、signInUserでないと実行できないUsecaseがエラーになるので、
        // ステータスが変わるのを監視し、その後実行し直す
        if (shared.signInStatus.case === SignInStatus.unknown) {
            console.info("[DISPATCH] signInStatus が 不明のため、ユースケースの実行を保留します...");
            let stopHandle: WatchStopHandle | null = null;
            stopHandle = watch(() => shared.signInStatus, (newValue) => {
                if (newValue.case !== SignInStatus.unknown) {
                    console.log(`[DISPATCH] signInStatus が "${ newValue.case as string }" に変わったため、保留したユースケースを再開します...`);
                    dispatcher.dispatch(usecase);
                    stopHandle?.();
                }
            });
            return;
        }

        _shared.executingUsecase = { executing: usecase.name, startAt: new Date() };

        switch (usecase.name) {
        /* Nobody */
        case "signUp": {
            console.info("[DISPATCH] SignUp", usecase);
            _shared.executingUsecase = { executing: usecase.name, startAt: new Date() };
            performers.authentication.signUp(usecase, actor);
            return;
        }
        case "signIn": {
            console.info("[DISPATCH] SignIn", usecase);
            _shared.executingUsecase = { executing: usecase.name, startAt: new Date() };
            performers.authentication.signIn(usecase, actor);
            return;
        }

        /* SignedInUser */
        case "signOut": {
            console.info("[DISPATCH] SignOut", usecase);
            performers.authentication.signOut(usecase, actor);
            break;
        }

        default: {
            throw new Error(`dispatch先が定義されていません: ${ usecase.name }`);
        }
        }
    };
    
    return dispatcher;
};

export const DISPATCHER_KEY = Symbol("Dispatcher") as InjectionKey<Dispatcher>;