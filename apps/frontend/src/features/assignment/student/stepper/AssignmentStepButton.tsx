import { StepButton, StepButtonProps } from "@mui/material";
import React from "react";

export function AssignmentStepButton(props: StepButtonProps) {
    const { ...rest } = props;

    return <StepButton {...rest} />;
}
