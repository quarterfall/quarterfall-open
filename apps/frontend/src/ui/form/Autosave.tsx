import { useEffect } from "react";
import {
    FieldValues,
    useForm,
    UseFormProps,
    UseFormReturn,
} from "react-hook-form";

export interface AutosaveFormOptions<
    TFieldValues extends FieldValues,
    TContext extends object
> extends UseFormProps<TFieldValues, TContext> {
    delay?: number;
    onSave?: (
        changedData: Partial<TFieldValues>,
        allData: TFieldValues
    ) => Promise<void> | void;
    onChange?: (
        changedData: Partial<TFieldValues>,
        allData: TFieldValues
    ) => Promise<void> | void;
}

// We need to do this, otherwise TypeScript complains: "Type instantiation is excessively deep and possibly infinite." :(
export type UseFormReturn_bug<TFieldValues extends FieldValues = FieldValues> =
    UseFormReturn<TFieldValues>;

export function useAutosaveForm<
    TFieldValues extends FieldValues = FieldValues,
    TContext extends object = object
>(options?: AutosaveFormOptions<TFieldValues, TContext>) {
    const {
        onSave,
        onChange,
        delay = 1000,
        mode = "onChange",
        ...rest
    } = options;
    // create the form
    const {
        formState: { isDirty, isValid, dirtyFields, ...formStateRest },
        ...methods
    } = useForm({ mode, ...rest });

    // watch the data
    const data = methods.watch();

    useEffect(() => {
        // if the form is not dirty, no action is needed
        if (!isDirty) {
            return;
        }

        const computeDiff = () => {
            const diff: Partial<TFieldValues> = {};
            for (const key of Object.keys(dirtyFields)) {
                diff[key as keyof TFieldValues] = data[key];
            }
            return diff;
        };

        // set a timeout for saving the change
        const handler = setTimeout(async () => {
            if (!isValid) {
                return;
            }
            // compute the object containing the dirty fields
            const diff = computeDiff();

            // if there is no difference in input, don't save
            if (Object.entries(diff).length === 0) {
                return;
            }
            // reset the form
            const resetOptions: any = Object.assign(
                {},
                options.defaultValues,
                diff
            );
            methods.reset(resetOptions);

            // save the data
            if (onSave) {
                await onSave(diff, data);
            }
        }, delay);

        // if there is an onChange callback, call it immediately
        if (onChange) {
            onChange(computeDiff(), data);
        }

        return () => {
            clearTimeout(handler);
        };
    }, [data]);

    return {
        formState: { isDirty, isValid, dirtyFields, ...formStateRest },
        ...methods,
    } as UseFormReturn_bug;
}
