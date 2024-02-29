// const results = ["isRequired", "isTooShort", "isTooLong", "isMalformed"] as const;
// export type ValidationResult = typeof results[number];

export const enum ValidationResult {
    isRequired = "isRequired"
    , isTooShort = "isTooShort"
    , isTooLong = "isTooLong"
    , isMalformed = "isMalformed"
}

export interface Validation<Input, Result> {
    isValid: true|Result
    input: Input|null

    convert<T>(closure: (result: true|Result) => T): T
}

export abstract class AbstructValidation<Input, Result> implements Validation<Input, Result> {
    isValid: true|Result;
    input: Input|null;

    constructor(input: Input|null) {
        this.isValid = true;
        this.input = input;
    }

    validators = {
        isRequired: (v:string|null) => !!v || ValidationResult.isRequired
        , isEqualToOrGreaterThan: (v:string|null, minLength: number) => v === null || v.length >= minLength || ValidationResult.isTooShort
        , isEqualToOrLessThan: (v:string|null, maxLength: number) => v === null || v.length <= maxLength || ValidationResult.isTooLong
        , isMailAddress: (v:string|null) => v === null || /.+@.+\..+/.test(v) || ValidationResult.isMalformed
    } as const;

    convert<T>(closure: (result: true|Result) => T): T  {
        return closure(this.isValid);
    }
}