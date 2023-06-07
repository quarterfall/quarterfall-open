import { Typography } from "@mui/material";
import { useMemo, useState } from "react";
import YAML from "yaml";
import { ObjectViewer, ObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerYamlProps = ObjectViewerProps & {
    yaml: string;
};

export function ObjectViewerYaml(props: ObjectViewerYamlProps) {
    const { yaml, __typename, ...rest } = props;
    const [error, setError] = useState("");

    const yamlObject = useMemo(() => {
        try {
            // remove any trailing whitespace
            const yamlCleaned =
                yaml.trimStart().length !== yaml.length
                    ? yaml
                          .split("\n")
                          .map((s) => s.trimStart())
                          .join("\n")
                    : yaml;
            const obj = YAML.parse(yamlCleaned) || {};
            if (__typename) {
                obj.__typename = __typename;
            }
            return obj;
        } catch (e) {
            setError(`YAMLSyntaxError: ${e.message}`);
        }
    }, [yaml]);

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return <ObjectViewer {...yamlObject} {...rest} />;
}

export default ObjectViewerYaml;
