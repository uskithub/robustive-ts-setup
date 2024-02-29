import { Performer, Store, Mutable, SharedStore, Service } from ".";
import { SignInStatus, SignInStatuses } from "@/shared/service/domain/interfaces/authenticator";
import { Actor } from "@/shared/service/application/actors";
import { R, Usecase, UsecasesOf } from "@/shared/service/application/usecases";
import { dictionary as t } from "@/client/main";
import { Account } from "@/shared/service/domain/authentication/user";

import { reactive } from "vue";
import { Subscription } from "rxjs";
import { InteractResultType } from "robustive-ts";


export interface AuthenticationStore extends Store {
    readonly signInStatus: SignInStatus | null;
    readonly idInvalidMessage: string | string[] | undefined;
    readonly passwordInvalidMessage: string | string[] | undefined;
    readonly signInFailureMessage: string | undefined;
    readonly isPresentAdministratorRegistrationDialog: boolean;
    readonly domain: string | null;
    readonly account: Account | null;
}

export interface AuthenticationPerformer extends Performer<"authentication", AuthenticationStore> {
    readonly store: AuthenticationStore;
    dispatch: (usecase: UsecasesOf<"authentication">, actor: Actor, service: Service) => Promise<Subscription | void>;
}

export function createAuthenticationPerformer(): AuthenticationPerformer {
    const store = reactive<AuthenticationStore>({
        signInStatus: null

        , idInvalidMessage: "" // ホントは null でいいはずが...
        , passwordInvalidMessage: "" // ホントは null でいいはずが...
        , signInFailureMessage: undefined
        , isPresentAdministratorRegistrationDialog: false
        , domain : null
        , account : null
    });

    const _store = store as Mutable<AuthenticationStore>;

    const d = R.authentication;
    
    const signUp = (usecase: Usecase<"authentication", "signUp">, actor: Actor, service: Service): Promise<void> => {
        const goals = d.signUp.keys.goals;
        const _shared = service.stores.shared as Mutable<SharedStore>;
        return usecase
            .interactedBy(actor)
            .then(result => {
                if (result.type !== InteractResultType.success) {
                    return console.error("TODO", result);
                }
                const context = result.lastSceneContext;

                switch (context.scene) {
                case goals.onSuccessInCreatingInitialTaskThenServicePresentsHomeView: {
                    const userProperties = context.userProperties;
                    service.change(SignInStatuses.signIn({ userProperties }));
                    service.dispatch(R.taskManagement.observingUsersTasks.basics.serviceGetsUsersTasksObservable({ user: userProperties }), service.serviceActor);
                    service.routingTo("/");
                    break;
                }
                case goals.onFailureInValidatingThenServicePresentsError: {
                    if (context.result === true) { break; }
                    const labelMailAddress = t.authentication.common.labels.mailAddress;
                    const labelPassword = t.authentication.common.labels.password;

                    switch (context.result.id) {
                    case "isRequired":
                        _store.idInvalidMessage = t.authentication.common.validations.isRequired(labelMailAddress);
                        break;
                    case "isMalformed":
                        _store.idInvalidMessage = t.authentication.common.validations.isMalformed(labelMailAddress);
                        break;
                    case null:
                        _store.idInvalidMessage = undefined;
                        break;
                    }

                    switch (context.result.password) {
                    case "isRequired":
                        _store.passwordInvalidMessage = t.authentication.common.validations.isRequired(labelPassword);
                        break;
                    case "isTooShort":
                        _store.passwordInvalidMessage = t.authentication.common.validations.isTooShort(labelPassword, 8);
                        break;
                    case "isTooLong":
                        _store.passwordInvalidMessage = t.authentication.common.validations.isTooLong(labelPassword, 20);
                        break;
                    case null:
                        _store.passwordInvalidMessage = undefined;
                        break;
                    }
                    break;
                }
                case goals.onFailureInPublishingThenServicePresentsError: {
                    console.error("SERVICE ERROR:", context.error);
                    break;
                }
                case goals.onFailureInCreatingUserDataThenServicePresentsError: {
                    console.error("SERVICE ERROR:", context.error);
                    break;
                }
                case goals.serviceDoNothing: {
                    // just wait for redirecting to google oauth
                    break;
                }
                case goals.servicePresentsSignInView: {
                    service.routingTo("/signin");
                    break;
                }
                case goals.domainOrganizationNotExistsThenServicePresentsAdministratorRegistrationDialog: {
                    _store.domain = context.domain;
                    _store.account = context.account;
                    _store.isPresentAdministratorRegistrationDialog = true;
                    _shared.isLoading = false;
                    break;
                }
                }
                return;
            });
    };
    
    const signIn = (usecase: Usecase<"authentication", "signIn">, actor: Actor, service: Service): Promise<void> => {
        const goals = d.signIn.keys.goals;
        return usecase
            .interactedBy(actor)
            .then(result => {
                if (result.type !== InteractResultType.success) {
                    return console.error("TODO", result);
                }
                const context = result.lastSceneContext;
                switch (context.scene) {
                case goals.onSuccessInSigningInThenServicePresentsHomeView:
                    service.routingTo("/");
                    break;

                case goals.onFailureInValidatingThenServicePresentsError: {
                    if (context.result === true) { return; }
                    const labelMailAddress = t.authentication.common.labels.mailAddress;
                    const labelPassword = t.authentication.common.labels.password;

                    switch (context.result.id) {
                    case "isRequired":
                        _store.idInvalidMessage = t.authentication.common.validations.isRequired(labelMailAddress);
                        break;
                    case "isMalformed":
                        _store.idInvalidMessage = t.authentication.common.validations.isMalformed(labelMailAddress);
                        break;
                    case null:
                        _store.idInvalidMessage = undefined;
                        break;
                    }

                    switch (context.result.password) {
                    case "isRequired":
                        _store.passwordInvalidMessage = t.authentication.common.validations.isRequired(labelPassword);
                        break;
                    case "isTooShort":
                        _store.passwordInvalidMessage = t.authentication.common.validations.isTooShort(labelPassword, 8);
                        break;
                    case "isTooLong":
                        _store.passwordInvalidMessage = t.authentication.common.validations.isTooLong(labelPassword, 20);
                        break;
                    case null:
                        _store.passwordInvalidMessage = undefined;
                        break;
                    }
                    break;
                }
                case goals.onFailureInSigningInThenServicePresentsError: {
                    console.error("SERVICE ERROR:", context.error);
                    _store.signInFailureMessage = context.error.message;
                    break;
                }
                case goals.servicePresentsSignUpView: {
                    service.routingTo("/signup");
                    break;
                }
                }
            })
            .catch(e => {
                _store.signInFailureMessage = e.message;
            });
    };
    
    const signOut = (usecase: Usecase<"authentication", "signOut">, actor: Actor, service: Service): Promise<void> => {
        const goals = d.signOut.keys.goals;
        return usecase
            .interactedBy(actor)
            .then(result => {
                if (result.type !== InteractResultType.success) {
                    return console.error("TODO", result);
                }
                const context = result.lastSceneContext;
                switch (context.scene) {
                case goals.onSuccessThenServicePresentsSignInView:
                    service.change(SignInStatuses.signOut());
                    service.routingTo("/signin");
                    break;
                case goals.onFailureThenServicePresentsError:
                    console.error("SERVICE ERROR:", context.error);
                    break;
                case goals.servicePresentsHomeView:
                    service.routingTo("/");
                    break;
                }
            });
    };

    return {
        store
        , dispatch: (usecase: UsecasesOf<"authentication">, actor: Actor, service: Service): Promise<Subscription | void> => {
            switch (usecase.name) {
            case "signUp": {
                return signUp(usecase, actor, service);
            }
            case "signIn": {
                return signIn(usecase, actor, service);
            }
            case "signOut": {
                return signOut(usecase, actor, service);
            }
            }
        }
    };
}