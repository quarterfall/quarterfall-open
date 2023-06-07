import { Field } from "type-graphql";
import {
    AdvancedOptions,
    MethodAndPropDecorator,
    ReturnTypeFunc,
} from "type-graphql/dist/decorators/types";

export function OptionalField(
    returnTypeFunction?: ReturnTypeFunc,
    options?: AdvancedOptions
): MethodAndPropDecorator {
    if (!returnTypeFunction) {
        return Field(Object.assign({ nullable: true }, options || {}));
    } else {
        return Field(
            returnTypeFunction,
            Object.assign({ nullable: true }, options || {})
        );
    }
}
