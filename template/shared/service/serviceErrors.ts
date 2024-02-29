import { ErrorContext } from "../system/systemErrors";

export class ServiceError extends Error {
    static {
        this.prototype.name = "ServiceError";
    }
    #context: ErrorContext;
    
    constructor(context: ErrorContext, options?: ErrorOptions) {
        super(`[${ context.component }_${ context.code }] ${ context.message } `, options);
        this.#context = context;

        // Set the prototype explicitly for making "instanceof" available.
        // @see: https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, new.target.prototype);
    }

    get code(): string {
        return this.#context.code;
    }
}