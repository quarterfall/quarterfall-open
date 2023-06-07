import { Typography } from "@mui/material";
import { File } from "interface/File.interface";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ObjectViewerType } from "./ObjectViewerType";

const objectViewers: Partial<
    Record<ObjectViewerType, (props: BaseObjectViewerProps) => ReactElement>
> = {};

export function registerObjectViewer(
    type: ObjectViewerType,
    cls: (props: BaseObjectViewerProps) => ReactElement
) {
    objectViewers[type] = cls;
}

export function unregisterObjectViewer(type: ObjectViewerType) {
    delete objectViewers[type];
}

export interface BaseObjectViewerProps {
    files?: File[];
}

export type ObjectViewerProps = BaseObjectViewerProps & {
    __typename: ObjectViewerType;
};

export function ObjectViewer(props: ObjectViewerProps) {
    const { __typename, ...rest } = props;
    const { t } = useTranslation();

    if (!__typename) {
        return (
            <Typography color="error">
                {t("missingObjectViewerTypename")}
            </Typography>
        );
    }

    const objectViewer = objectViewers[__typename];

    if (!objectViewer) {
        return (
            <Typography>
                {t("unknownObjectViewerTypename", { __typename })}
            </Typography>
        );
    } else {
        return objectViewer(rest);
    }
}
