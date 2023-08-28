import { BootScenario, BootScenes } from "./nobody/boot";
import { SignInScenario, SignInScenes } from "./nobody/signIn";
import { SignUpScenario, SignUpScenes } from "./nobody/signUp";
import { SignOutScenario, SignOutScenes } from "./signedInUser/signOut";

import { Usecase as _Usecase, Usecases as _Usecases, UsecaseSelector } from "robustive-ts";

export type UsecaseDefinitions = {
    /* nobody */
    boot : { scenes: BootScenes; scenario: BootScenario; };
    signIn : { scenes: SignInScenes; scenario: SignInScenario; };
    signUp : { scenes: SignUpScenes; scenario: SignUpScenario; };
    signOut : { scenes: SignOutScenes; scenario: SignOutScenario; };
};

const usecases = new UsecaseSelector<UsecaseDefinitions>();

export const U = {
        /* nobody */
        boot : usecases.boot(BootScenario)
        , signIn : usecases.signIn(SignInScenario)
        , signUp : usecases.signUp(SignUpScenario)
        , signOut : usecases.signOut(SignOutScenario)    
};

export type UsecaseKeys = keyof UsecaseDefinitions;
export type Usecases = _Usecases<UsecaseDefinitions>;
export type Usecase<T extends UsecaseKeys> = _Usecase<UsecaseDefinitions, T>;

export type UsecaseLog = {
    [U in keyof UsecaseDefinitions] : { executing: U, startAt: Date }
}[keyof UsecaseDefinitions];