import { Usecase as _Usecase, Usecases as _Usecases, UsecaseSelector } from "robustive-ts";

export type UsecaseDefinitions = {
    // your_usecase : { scenes: YourUsecaseScenes; scenario: YourUsecaseScenario; };
};

const usecases = new UsecaseSelector<UsecaseDefinitions>();

export const U = {
    // your_usecase : usecases.your_usecase(YourUsecaseScenario)
};

export type UsecaseKeys = keyof UsecaseDefinitions;
export type Usecases = _Usecases<UsecaseDefinitions>;
export type Usecase<T extends UsecaseKeys> = _Usecase<UsecaseDefinitions, T>;