import React from "react";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerIFrameProps = BaseObjectViewerProps & IFrameBox;

export function ObjectViewerIFrame(props: ObjectViewerIFrameProps) {
    const { files, ...rest } = props;

    return <IFrameBox {...rest} />;
}
