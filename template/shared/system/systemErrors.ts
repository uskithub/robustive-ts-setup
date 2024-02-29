type EnumDefs = { [key: string]: string; };

export type ErrorContextFactory<Component extends string, D extends EnumDefs> = { 
    [K in keyof D]: { readonly component: Component; readonly code: K; readonly message: D[K]; }
};

export const ErrorContextFactory = class ErrorContextFactory<Component extends string, D extends EnumDefs> {
    constructor(component: Component, defs: D) {
        const codeKeys = Object.keys(defs);
        return new Proxy(this, {
            get(target, prop, receiver) { // prop = code
                return ((typeof prop === "string") && codeKeys.includes(prop))
                    ? Object.freeze({ component, code: prop, message: defs[prop] })
                    : Reflect.get(target, prop, receiver);
            }
        });
    }
} as new <Component extends string, D extends EnumDefs>(component: Component, defs: D) => ErrorContextFactory<Component, D>;

export type ErrorContext = {
    readonly component: string;
    readonly code: string;
    readonly message: string;
};

export class SystemError extends Error {
    static {
        this.prototype.name = "SystemError";
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