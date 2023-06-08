import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";
import {
    LabeledRating,
    LabeledRatingProps,
} from "ui/form/inputs/LabeledRating";

export type UnnamedLabeledRatingProps = Pick<
    LabeledRatingProps,
    Exclude<keyof LabeledRatingProps, "name">
>;

export type LabeledRatingControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UnnamedLabeledRatingProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function LabeledRatingController(props: LabeledRatingControllerProps) {
    const { control, name, controllerProps, ...rest } = props;

    return (
        <Controller
            name={name}
            control={control}
            {...controllerProps}
            render={({ field: { onChange, value } }) => {
                return (
                    <LabeledRating
                        value={Number(value) || 0}
                        onChange={(event, v) => onChange(v)}
                        {...rest}
                    />
                );
            }}
        />
    );
}
