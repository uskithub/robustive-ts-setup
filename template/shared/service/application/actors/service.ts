
import { Actor } from ".";
import { MyBaseActor } from "../common";
import { DomainKeys, R, UsecaseKeys } from "../usecases";

export class Service extends MyBaseActor<null> {
    
    isAuthorizedTo(domain: DomainKeys, usecase: UsecaseKeys): boolean {

        if (domain === R.keys.application 
            && (usecase === R.application.keys.boot
                || usecase === R.application.keys.observingUserData)
        ) {
            return true;
        }

        if (domain === R.keys.taskManagement 
            && (usecase === R.taskManagement.keys.observingUsersProjects
                || usecase === R.taskManagement.keys.observingUsersTasks)
        ) {
            return true;
        }

        if (domain === R.keys.timeline && usecase === R.timeline.keys.observingUsersTimeline) {
            return true;
        }
        
        return false;
    }
}
export const isService = (actor: Actor): actor is Service => actor.constructor === Service;