import { User, type SignUpValidationResult, type Account, UserProperties, RoleType } from "@/shared/service/domain/authentication/user";
import { Organization, OrganizationProperties } from "@/shared/service/domain/authentication/organization";
import { MyBaseScenario } from "../../common";

import type { Context, Empty } from "robustive-ts";
import { firstValueFrom, map } from "rxjs";
import { Task, TaskProperties } from "@/shared/service/domain/taskManagement/task";

/**
 * usecase: サインアップする
 */
export type SignUpScenes = {
    basics: {
        userStartsSignUpProcess: { id: string | null; password: string | null; };
        serviceValidateInputs: { id: string | null; password: string | null; };
        onSuccessInValidatingThenServicePublishesNewAccount: { id: string; password: string; };
        onSuccessInPublishingNewAccountThenServiceGetsOrganizationOfDomain: { account: Account; };
        domainOrganizationExistsThenServiceCreatesUserData: { account: Account; };
        onSuccessInCreatingUserDataThenServiceCreatesInitialTask: { userProperties: UserProperties; };
    };
    alternatives: {
        domainIsUnkownThenServiceCreatesUserData: { account: Account; };
        userStartsSignUpProcessWithGoogleOAuth: Empty;
        serviceRedirectsToGoogleOAuth: Empty;
        serviceGetsOrganizationOfDomain: { account: Account; };
        userTapsSignInButton: Empty;
        userSelectToBeAdministrator: { domain: string | null; account: Account | null };
        serviceCreatesNewOrganization: { domain: string; account: Account };
        userSelectNotToBeAdministrator: Empty;
        onSuccessInCreatingNewOrganizationThenThenServiceCreatesUserData: { organizationProperties: OrganizationProperties; account: Account; };
    };
    goals: {
        onSuccessInCreatingInitialTaskThenServicePresentsHomeView: { userProperties: UserProperties; taskProperties: TaskProperties; };
        onFailureInValidatingThenServicePresentsError: { result: SignUpValidationResult; };
        onFailureInCreatingUserDataThenServicePresentsError: { error: Error; };
        onFailureInCreatingInitialTaskThenServicePresentsError: { error: Error; };
        onFailureInPublishingThenServicePresentsError: { error: Error; };
        serviceDoNothing: Empty;
        servicePresentsSignInView: Empty;
        domainOrganizationNotExistsThenServicePresentsAdministratorRegistrationDialog: { domain: string; account: Account; };
    };
};

export class SignUpScenario extends MyBaseScenario<SignUpScenes> {

    next(to: Context<SignUpScenes>): Promise<Context<SignUpScenes>> {
        switch (to.scene) {
        case this.keys.basics.userStartsSignUpProcess: {
            return this.just(this.basics.serviceValidateInputs({ id: to.id, password: to.password }));
        }
        case this.keys.basics.serviceValidateInputs: {
            return this.validate(to.id, to.password);
        }
        case this.keys.basics.onSuccessInValidatingThenServicePublishesNewAccount: {
            return this.publishNewAccount(to.id, to.password);
        }
        case this.keys.basics.onSuccessInPublishingNewAccountThenServiceGetsOrganizationOfDomain: {
            return this.getOrganization(to.account);
        }
        case this.keys.basics.domainOrganizationExistsThenServiceCreatesUserData: {
            return this.createUser(to.account);
        }
        case this.keys.basics.onSuccessInCreatingUserDataThenServiceCreatesInitialTask: {
            return this.createTask(to.userProperties);
        }
        case this.keys.alternatives.domainIsUnkownThenServiceCreatesUserData: {
            return this.createUser(to.account);
        }
        case this.keys.alternatives.userStartsSignUpProcessWithGoogleOAuth: {
            return this.just(this.alternatives.serviceRedirectsToGoogleOAuth());
        }
        case this.keys.alternatives.serviceRedirectsToGoogleOAuth: {
            return this.redirect();
        }
        case this.keys.alternatives.serviceGetsOrganizationOfDomain: {
            return this.getOrganization(to.account);
        }
        case this.keys.alternatives.userTapsSignInButton: {
            return this.just(this.goals.servicePresentsSignInView());
        }
        case this.keys.alternatives.userSelectToBeAdministrator: {
            if (to.domain && to.account) {
                return this.just(this.alternatives.serviceCreatesNewOrganization({ domain: to.domain, account: to.account }));
            } else {
                throw new Error();
            }
        }
        case this.keys.alternatives.serviceCreatesNewOrganization: {
            return this.createNewOrganization(to.domain, to.account);
        }
        case this.keys.alternatives.onSuccessInCreatingNewOrganizationThenThenServiceCreatesUserData: {
            // TODO: Dateがclassだからうまいこといっていない
            return this.createUserAsOrganizationOwner(to.account, to.organizationProperties);
        }
        default: {
            throw new Error(`not implemented: ${ to.scene }`);
        }
        }
    }

    private validate(id: string | null, password: string | null): Promise<Context<SignUpScenes>> {
        const result = User.validate(id, password);
        if (result === true && id !== null && password != null) {
            return this.just(this.basics.onSuccessInValidatingThenServicePublishesNewAccount({ id, password }));
        } else {
            return this.just(this.goals.onFailureInValidatingThenServicePresentsError({ result }));
        }
    }

    private publishNewAccount(id: string, password: string): Promise<Context<SignUpScenes>> {
        return firstValueFrom(
            User
                .createAccount(id, password)
                .pipe(
                    map((account: Account) => {
                        return this.basics.onSuccessInPublishingNewAccountThenServiceGetsOrganizationOfDomain({ account });
                    })
                )
        );
    }

    private getOrganization(account: Account): Promise<Context<SignUpScenes>> {
        if (account.email) {
            const domain = account.email.split("@")[1];
            return Organization.get(domain)
                .then(organizationProperties => {
                    if (organizationProperties) {
                        return this.basics.domainOrganizationExistsThenServiceCreatesUserData({ account });
                    } else {
                        return this.goals.domainOrganizationNotExistsThenServicePresentsAdministratorRegistrationDialog({ domain, account });
                    }
                });
        } else {
            return this.just(this.alternatives.domainIsUnkownThenServiceCreatesUserData({ account }));
        }
    }

    private createTask(userProperties: UserProperties): Promise<Context<SignUpScenes>> {
        return Task.createInitialTasks(userProperties.id)
            .then((taskProperties) => {
                return this.goals.onSuccessInCreatingInitialTaskThenServicePresentsHomeView({ userProperties, taskProperties });
            })
            .catch((error: Error) => {
                return this.goals.onFailureInCreatingInitialTaskThenServicePresentsError({ error });
            });
    }

    private createUser(account: Account): Promise<Context<SignUpScenes>> {
        return new User(account).create()
            .then((userProperties) => {
                return this.basics.onSuccessInCreatingUserDataThenServiceCreatesInitialTask({ userProperties });
            })
            .catch((error: Error) => {
                return this.goals.onFailureInCreatingUserDataThenServicePresentsError({ error });
            });
    }

    private createUserAsOrganizationOwner(account: Account, organizationProperties: OrganizationProperties): Promise<Context<SignUpScenes>> {
        const organizationAndRols = { 
            organizationId: organizationProperties.id
            , role: RoleType.administrator
        };
        
        return new User(account).create(organizationAndRols)
            .then((userProperties) => {
                return this.basics.onSuccessInCreatingUserDataThenServiceCreatesInitialTask({ userProperties });
            })
            .catch((error: Error) => {
                return this.goals.onFailureInCreatingUserDataThenServicePresentsError({ error });
            });
    }

    private redirect(): Promise<Context<SignUpScenes>> {
        return User
            .oauthToGoogle()
            .then(() => {
                return this.goals.serviceDoNothing();
            });
    }

    private createNewOrganization(domain: string, account: Account) : Promise<Context<SignUpScenes>> {
        return Organization
            .create(domain, account)    
            .then((organizationProperties: OrganizationProperties) => {
                return this.alternatives.onSuccessInCreatingNewOrganizationThenThenServiceCreatesUserData({ organizationProperties, account }); 
            });
    }
}