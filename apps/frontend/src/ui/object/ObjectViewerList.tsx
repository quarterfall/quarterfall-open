import { Stack, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { BaseObjectViewerProps, ObjectViewer } from "./ObjectViewer";

export type ObjectViewerListProps = BaseObjectViewerProps & {
    direction?: string;
    items?: any[];
};

export function ObjectViewerList(props: ObjectViewerListProps) {
    const { items, direction = "column", files, ...rest } = props;
    const { t } = useTranslation();

    if (["row", "column"].indexOf(direction) < 0) {
        return (
            <Typography color="error">
                {t("unknownListType", { type: direction })}
            </Typography>
        );
    }

    const vertical = direction === "column";

    return (
        <Stack {...rest}>
            {(items || []).map((item, index) => (
                <div
                    key={`list_item_${index}`}
                    style={{
                        width: vertical ? "100%" : undefined,
                        height: vertical ? undefined : "100%",
                    }}
                >
                    <ObjectViewer {...item} files={files} />
                </div>
            ))}
        </Stack>
    );
}
