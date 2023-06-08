import { Url } from "core";
import isArray from "lodash/isArray";
import isBoolean from "lodash/isBoolean";
import isEqual from "lodash/isEqual";
import isNumber from "lodash/isNumber";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function useQueryParams<T = any>(
    defaults: Partial<T> = {}
): [T, (p: Partial<T>) => void] {
    const router = useRouter();

    // retrieve the params from the url on mount
    const parseParams = (options?: { url?: string }): T => {
        const url = new Url(options?.url || router.asPath);
        const keys = Object.keys(url.query);

        const result = Object.assign({}, defaults);

        for (const key of keys) {
            try {
                let value: any = url.query[key];

                const ref = defaults[key];
                if (isArray(ref)) {
                    value = value.split(",");
                } else if (isNumber(ref)) {
                    value = parseInt(value, 10);
                    if (isNaN(value)) {
                        value = ref;
                    }
                } else if (isBoolean(ref)) {
                    value = value === "true";
                }

                result[key] = value;
            } catch (error) {
                // in case of error, ignore the parameter
                continue;
            }
        }
        return result as T;
    };

    const [params, setParams] = useState<T>(parseParams());

    const nonDefaultParams = () => {
        const nonDefault = {};
        for (const k of Object.keys(defaults || {})) {
            if (!isEqual((defaults || {})[k], params[k])) {
                nonDefault[k] = params[k];
            }
        }
        return nonDefault;
    };

    // update the query string if the params change
    useEffect(() => {
        // params have not been parsed yet, so ignore this effect call
        if (params === null) {
            return;
        }

        // get the current params according to the url
        const currentParams = parseParams();

        // update the query string if necessary
        if (!isEqual(currentParams, params)) {
            const url = new Url(router.asPath);
            url.query = nonDefaultParams();
            router.replace(url.toString());
        }
    }, [params]);

    return [
        params,
        (p: Partial<T>) => {
            const newParams = Object.assign({}, params, p);
            setParams(newParams);
        },
    ];
}
