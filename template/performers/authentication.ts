// service
// system
import { Dictionary, DICTIONARY_KEY } from "@/shared/system/localizations";
import { inject, reactive } from "vue";
import { Performer, Store, Mutable, SharedStore, Dispatcher } from ".";
import { useRouter } from "vue-router";

import { Task } from "@/shared/service/domain/entities/task";
import { ItemChangeType } from "@/shared/service/domain/interfaces/backend";
import { SignInStatus, SignInStatuses } from "@/shared/service/domain/interfaces/authenticator";

import { Actor, SignedInUser as SignedInUserActor } from "@/shared/service/application/actors";
import { Nobody } from "@/shared/service/application/usecases/nobody";
import { SignedInUser } from "@/shared/service/application/usecases/signedInUser";
import { U, Usecase } from "@/shared/service/application/usecases";
import { InteractResultType, Nobody as NobodyActor } from "robustive-ts";

type ImmutableTask = Readonly<Task>;

export interface AuthenticationStore extends Store {
    readonly signInStatus: SignInStatus | null;
    readonly idInvalidMessage: string | string[] | undefined;
    readonly passwordInvalidMessage: string | string[] | undefined;
    readonly signInFailureMessage: string | undefined;
}

export interface AuthenticationPerformer extends Performer<AuthenticationStore> {
    readonly store: AuthenticationStore;
    signUp: (usecase: Usecase<"signUp">, actor: Actor) => void;
    signIn: (usecase: Usecase<"signIn">, actor: Actor) => void;
    signOut: (usecase: Usecase<"signOut">, actor: Actor) => void;
}

export function createAuthenticationPerformer(dispatcher: Dispatcher): AuthenticationPerformer {
    const t = inject(DICTIONARY_KEY) as Dictionary;
    const router = useRouter();
    const store = reactive<AuthenticationStore>({
        signInStatus: null
        , idInvalidMessage: "" // ホントは null でいいはずが...
        , passwordInvalidMessage: "" // ホントは null でいいはずが...
        , signInFailureMessage: undefined
    });

    const _store = store as Mutable<AuthenticationStore>;
    
    return {
        store
        , signUp: (usecase: Usecase<"signUp">, actor: Actor) => {
            const goals = Nobody.signUp.goals;
            const _shared = dispatcher.stores.shared as Mutable<SharedStore>;
            return usecase
                .interactedBy(actor)
                .then((interactResult) => {
                    if (interactResult.type === InteractResultType.success) {
                        switch (interactResult.lastSceneContext.scene) {
                        case goals.onSuccessInPublishingThenServicePresentsHomeView: {
                            const user = interactResult.lastSceneContext.user;
                            const actor = new SignedInUserActor(user);
                            _shared.actor = actor;
                            router.replace("/");
                            break;
                        }
                        case goals.onFailureInValidatingThenServicePresentsError: {
                            if (interactResult.lastSceneContext.result === true) { return; }
                            const labelMailAddress = t.common.labels.mailAddress;
                            const labelPassword = t.common.labels.password;

                            switch (interactResult.lastSceneContext.result.id) {
                            case "isRequired":
                                _store.idInvalidMessage = t.common.validations.isRequired(labelMailAddress);
                                break;
                            case "isMalformed":
                                _store.idInvalidMessage = t.common.validations.isMalformed(labelMailAddress);
                                break;
                            case null:
                                _store.idInvalidMessage = undefined;
                                break;
                            }

                            switch (interactResult.lastSceneContext.result.password) {
                            case "isRequired":
                                _store.passwordInvalidMessage = t.common.validations.isRequired(labelPassword);
                                break;
                            case "isTooShort":
                                _store.passwordInvalidMessage = t.common.validations.isTooShort(labelPassword, 8);
                                break;
                            case "isTooLong":
                                _store.passwordInvalidMessage = t.common.validations.isTooLong(labelPassword, 20);
                                break;
                            case null:
                                _store.passwordInvalidMessage = undefined;
                                break;
                            }
                            break;
                        }
                        case goals.onFailureInPublishingThenServicePresentsError:
                            console.error("SERVICE ERROR:", interactResult.lastSceneContext.error);
                            break;
                        }
                    } else {
                    }
                });
        }
        , signIn: (usecase: Usecase<"signIn">, actor: Actor) => {
            const goals = Nobody.signIn.goals;
            const _shared = dispatcher.stores.shared as Mutable<SharedStore>;
            return usecase
                .interactedBy(actor)
                .then((interactResult) => {
                    if (interactResult.type === InteractResultType.success) {
                        switch (interactResult.lastSceneContext.scene) {
                        case goals.onSuccessInSigningInThenServicePresentsHomeView:
                            router.replace("/");
                            break;

                        case goals.onFailureInValidatingThenServicePresentsError: {
                            if (interactResult.lastSceneContext.result === true) { return; }
                            const labelMailAddress = t.common.labels.mailAddress;
                            const labelPassword = t.common.labels.password;

                            switch (interactResult.lastSceneContext.result.id) {
                            case "isRequired":
                                _store.idInvalidMessage = t.common.validations.isRequired(labelMailAddress);
                                break;
                            case "isMalformed":
                                _store.idInvalidMessage = t.common.validations.isMalformed(labelMailAddress);
                                break;
                            case null:
                                _store.idInvalidMessage = undefined;
                                break;
                            }

                            switch (interactResult.lastSceneContext.result.password) {
                            case "isRequired":
                                _store.passwordInvalidMessage = t.common.validations.isRequired(labelPassword);
                                break;
                            case "isTooShort":
                                _store.passwordInvalidMessage = t.common.validations.isTooShort(labelPassword, 8);
                                break;
                            case "isTooLong":
                                _store.passwordInvalidMessage = t.common.validations.isTooLong(labelPassword, 20);
                                break;
                            case null:
                                _store.passwordInvalidMessage = undefined;
                                break;
                            }
                            break;
                        }
                        case goals.onFailureInSigningInThenServicePresentsError: {
                            console.error("SERVICE ERROR:", interactResult.lastSceneContext.error);
                            _store.signInFailureMessage = interactResult.lastSceneContext.error.message;
                            break;
                        }
                        }
                    } else {

                    }
                })
                .catch((e) => {
                    _store.signInFailureMessage = e.message;
                });
        }
        , signOut: (usecase: Usecase<"signOut">, actor: Actor) => {
            const goals = SignedInUser.signOut.goals;
            const _shared = dispatcher.stores.shared as Mutable<SharedStore>;
            return usecase
                .interactedBy(actor)
                .then((interactResult) => {
                    if (interactResult.type === InteractResultType.success) {
                        switch (interactResult.lastSceneContext.scene) {
                        case goals.onSuccessThenServicePresentsSignInView:
                            dispatcher.change(new NobodyActor());
                            _shared.signInStatus = SignInStatuses.signOut();
                            break;
                        case goals.onFailureThenServicePresentsError:
                            console.error("SERVICE ERROR:", interactResult.lastSceneContext.error);
                            break;
                        case goals.servicePresentsHomeView:
                            router.replace("/");
                        }
                    } else {

                    }
                });
        }
    };
}