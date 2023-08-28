import { UserProperties } from "@/shared/service/domain/authentication/user";
import { BaseActor, Nobody } from "robustive-ts";

export class SignedInUser extends BaseActor<UserProperties> { }
export const isSignedInUser = (actor: Actor): actor is SignedInUser => actor.constructor === SignedInUser;

export class Service extends BaseActor<null> { }
export const isService = (actor: Actor): actor is Service => actor.constructor === Service && typeof actor.user === null;

export type Actor = Nobody | SignedInUser | Service;