import { BaseActor, Nobody } from "robustive-ts";

export class Service extends BaseActor<null> { }
export const isService = (actor: Actor): actor is Service => actor.constructor === Service && typeof actor.user === null;

export type Actor = Nobody | Service; // | SignedInUser