import { Tab, Tabs, TabsProps } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next/";
import { useNavigation } from "ui/route/Navigation";

export interface Route {
    link: string;
    text?: string;
    icon?: React.ReactElement;
    disabled?: boolean;
}

interface RouteTabsProps extends TabsProps {
    routes: Route[];
}

export const RouteTabs = (props: RouteTabsProps) => {
    const { routes, ...rest } = props;
    const router = useNavigation();
    const { t } = useTranslation();

    const selectedTab = useMemo(() => {
        // remove the query or hash if any
        const routeCleaned = router.asPath.split(/\?|\#/)[0];

        // find the last part of the route
        const routeLast = routeCleaned.split("/").slice(-1)[0];
        // try to find a matching route
        let currentRouteIndex = routes.findIndex((r) => r.link === routeLast);
        if (currentRouteIndex >= 0) {
            return currentRouteIndex;
        } else {
            // if there is no matching route, set to 0 by default
            return 0;
        }
    }, [router, routes]);

    const handleChange = (
        event: React.ChangeEvent<{}>,
        newTabValue: number
    ) => {
        if (
            newTabValue === selectedTab ||
            newTabValue < 0 ||
            newTabValue >= routes.length
        ) {
            return;
        }
        const currentRoute = routes[selectedTab];
        // remove the query or hash if any from the current route
        const routeCleaned = router.asPath.split(/\?|\#/)[0];
        if (currentRoute.link === "") {
            router.push(`${routeCleaned}/${routes[newTabValue].link}`);
        } else {
            const routePreamble = routeCleaned
                .split(currentRoute.link)[0]
                .replace(/\/+$/g, "");
            router.push(`${routePreamble}/${routes[newTabValue].link}`);
        }
    };

    return (
        <Tabs
            value={selectedTab}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            {...rest}
        >
            {routes.map((route: Route, index: number) => {
                return (
                    <Tab
                        key={index}
                        data-cy={`tab_${route.text || route.link}`}
                        label={t(`${route.text || route.link}`)}
                        icon={route.icon}
                        iconPosition="start"
                        disabled={route.disabled}
                        sx={{
                            paddingTop: 0,
                            paddingBottom: 0,
                            minHeight: "64px",
                        }}
                    />
                );
            })}
        </Tabs>
    );
};
