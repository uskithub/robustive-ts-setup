// service

// system
import { reactive } from "vue";
import { Performer, Dispatcher, Mutable, SharedStore, Store } from ".";
import { useRouter } from "vue-router";
import { SignInStatuses } from "@/shared/service/domain/interfaces/authenticator";
import { Actor, SignedInUser } from "@/shared/service/application/actors";
import { Nobody } from "@/shared/service/application/usecases/nobody";
import { Usecase } from "@/shared/service/application/usecases";
import { InteractResultType } from "robustive-ts";


export type ApplicationStore = Store
export interface ApplicationPerformer extends Performer<ApplicationStore> {
    readonly store: ApplicationStore;
    boot: (usecase: Usecase<"boot">, actor: Actor) => void;
}

export function createApplicationPerformer(dispatcher: Dispatcher): ApplicationPerformer {
    const router = useRouter();
    const store = reactive<ApplicationStore>({});

    return {
        store
        , boot: (usecase: Usecase<"boot">, actor: Actor) => {
            const goals = Nobody.boot.goals;
            const _shared = dispatcher.stores.shared as Mutable<SharedStore>;
            return usecase
                .interactedBy(actor)
                .then((interactResult) => {
                    console.log("interactResult", interactResult);
                    if (interactResult.type === InteractResultType.success) {
                        switch (interactResult.lastSceneContext.scene) {
                        case goals.sessionExistsThenServicePresentsHome: {
                            const user = { ...interactResult.lastSceneContext.user };
                            const actor = new SignedInUser(user);
                            dispatcher.change(actor);
                            _shared.signInStatus = SignInStatuses.signIn({ user });
                            break;
                        }
                        case goals.sessionNotExistsThenServicePresentsSignin: {
                            _shared.signInStatus = SignInStatuses.signOut();
                            router.replace("/signin")
                                .catch((error: Error) => {
                                });
                            break;
                        }
                        }
                    } else {

                    }
                });
        }
    };
}