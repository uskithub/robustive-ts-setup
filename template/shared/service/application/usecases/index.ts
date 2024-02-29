import { BootScenario } from "./application/boot";
import { ObservingUserDataScenario } from "./application/observingUserData";

import { SignInScenario } from "./authentication/signIn";
import { SignUpScenario } from "./authentication/signUp";
import { SignOutScenario } from "./authentication/signOut";

import { ObservingProjectScenario } from "./taskManagement/observingProject";
import { ObservingUsersTasksScenario } from "./taskManagement/observingUsersTasks";
import { ObservingUsersProjectsScenario } from "./taskManagement/observingUsersProjects";
import { GetWarrantyListScenario } from "./getWarrantyList";

import { ObservingUsersTimelineScenario } from "./timeline/observingUsersTimeline";
import { UpdateTaskTitleScenario } from "./taskManagement/updateTaskTitle";
import { RearrangeTaskScenario } from "./taskManagement/rearrangeTask";

import { AllUsecases, AllUsecasesOverDomain, Robustive, Usecase as _Usecase } from "robustive-ts";

export const requirements = {
    application : {
        boot : BootScenario
        , observingUserData: ObservingUserDataScenario
    }
    , authentication : {
        signIn : SignInScenario
        , signUp : SignUpScenario
        , signOut : SignOutScenario
    }
    , timeline : {
        observingUsersTimeline : ObservingUsersTimelineScenario
    }
    , taskManagement : {
        observingProject : ObservingProjectScenario
        , getWarrantyList : GetWarrantyListScenario
        /* service actor */
        , observingUsersTasks : ObservingUsersTasksScenario
        , observingUsersProjects : ObservingUsersProjectsScenario
        , updateTaskTitle: UpdateTaskTitleScenario
        , rearrangeTask: RearrangeTaskScenario
    }
};

export const R = new Robustive(requirements);

export type Requirements = typeof requirements;
export type DomainKeys = keyof Requirements;
export type UsecaseKeys = { [D in DomainKeys] : keyof Requirements[D]; }[DomainKeys];

export type Usecases = AllUsecasesOverDomain<Requirements>;
export type UsecasesOf<D extends keyof Requirements> = AllUsecases<Requirements, D>; 
export type Usecase<D extends keyof Requirements, U extends keyof Requirements[D]> = _Usecase<Requirements, D, U>;

export type UsecaseLog = {
    id: string;
    executing: { 
        domain: DomainKeys;
        usecase: UsecaseKeys;
    }
    startAt: Date;
};

