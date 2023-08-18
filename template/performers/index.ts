import { Actor } from "@/shared/service/application/actors";
import { Service } from "@/shared/service/application/actors";
import { Usecases } from "@/shared/service/application/usecases";

// System
import { Nobody } from "robustive-ts";
import { InjectionKey, reactive, watch, WatchStopHandle } from "vue";
import { Subscription } from "rxjs";

export type Mutable<Type> = {
    -readonly [Property in keyof Type]: Type[Property];
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Store { };
export interface Performer<T extends Store> { readonly store: T; };

type ImmutableActor = Readonly<Actor>;

export interface SharedStore extends Store {
    readonly actor: ImmutableActor;
};

type Stores = {
    shared: SharedStore;
    // your_store: YourStore;
};

export type Dispatcher = {
    stores: Stores;
    change: (actor: Actor) => void;
    commonCompletionProcess: (subscription: Subscription | null) => void;
    dispatch: (usecase: Usecases) => void; 
};

export function createDispatcher(): Dispatcher {
    const shared = reactive<SharedStore>({
        actor: new Nobody()
    });

    const dispatcher = {
        stores: {
            shared
        }
        , change(actor: Actor) {
            const _shared = shared as Mutable<SharedStore>;
            _shared.actor = actor;
        }
        , commonCompletionProcess: (subscription: Subscription | null) => {
            subscription?.unsubscribe();
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        , dispatch() {}
    } as Dispatcher;

    const performers = {
        // your_performer: createYourPerformer(dispatcher)
    };

    dispatcher.dispatch = (usecase: Usecases) => {
        const _shared = shared as Mutable<SharedStore>;
        const actor = shared.actor;

        switch (usecase.name) {
        case "your_usecase": {
            console.info("[DISPATCH] your_usecase:", usecase);
            // performers.your_performer.xxx(usecase, actor);
            return;
        }
        default: {
            throw new Error(`dispatch先が定義されていません: ${ usecase.name }`);
        }
        }
    };
    
    return dispatcher;
}

export const DISPATCHER_KEY = Symbol("Dispatcher") as InjectionKey<Dispatcher>;