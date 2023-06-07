import Skeleton, { SkeletonProps } from "@mui/material/Skeleton";
import { ReactNode, useEffect, useState } from "react";

type Props = SkeletonProps & {
    component: ReactNode;
    loading?: boolean;
};

export const SkeletonContainer = (props: Props) => {
    const { component, ...skeletonProps } = props;
    const minimumDisplayTime = 500;
    const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(true);
    const [loading, setLoading] = useState(props.loading);

    useEffect(() => {
        setMinimumTimeElapsed(false);
        setTimeout(() => {
            setMinimumTimeElapsed(true);
        }, minimumDisplayTime);

        //simulate random load time between 0 and 5 seconds
        const randomLoadTime = Math.random() * 5000;
        setLoading(true);
        //simulate loading
        setTimeout(() => {
            setLoading(false);
        }, randomLoadTime);
    }, [setMinimumTimeElapsed, setLoading, minimumDisplayTime]);

    return !minimumTimeElapsed || loading ? (
        <Skeleton {...skeletonProps} />
    ) : (
        <>{component}</>
    );
};
