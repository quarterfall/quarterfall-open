import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";
import {
    LabeledSwitch,
    LabeledSwitchProps,
} from "ui/form/inputs/LabeledSwitch";

export type UnnamedLabeledSwitchProps = Pick<
    LabeledSwitchProps,
    Exclude<keyof LabeledSwitchProps, "name">
>;

export type SwitchControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UnnamedLabeledSwitchProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function SwitchController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: SwitchControllerProps<TFieldValues, TName>) {
    const { control, controllerProps, name, ...rest } = props;

    return (
        <Controller
            name={name as any}
            control={control}
            {...controllerProps}
            render={({ field: { onChange, value } }) => (
                <LabeledSwitch
                    checked={Boolean(value || false)}
                    onChange={(e) => onChange(e.target.checked)}
                    {...rest}
                />
            )}
        />
    );
}
