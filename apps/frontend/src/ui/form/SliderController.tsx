import { Slider, SliderProps } from "@mui/material";
import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";

export type UnnamedSliderProps = Pick<
    SliderProps,
    Exclude<keyof SliderProps, "name">
>;
export type SliderControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UnnamedSliderProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function SliderController(props: SliderControllerProps) {
    const { control, name, controllerProps, ...rest } = props;

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field: { value, onChange } }) => {
                return (
                    <Slider
                        value={value}
                        onChange={(e, value) => {
                            onChange(value || 0);
                        }}
                        valueLabelDisplay="auto"
                        size="small"
                        {...rest}
                    />
                );
            }}
        />
    );
}
