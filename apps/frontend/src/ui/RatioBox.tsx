import React, { useEffect, useRef, useState } from "react";

export interface RatioBoxProps
    extends React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > {
    ratio?: number;
}
export function RatioBox(props: RatioBoxProps) {
    const isClient = typeof window === "object";
    const ref = useRef<HTMLDivElement>(null);
    const { ratio = 0, style, ...rest } = props;

    const [width, setWidth] = useState<number>(0);

    useEffect(() => {
        handleResize();
        if (!isClient) {
            return;
        }

        function handleResize() {
            if (ref && ref.current) {
                setWidth(ref.current.clientWidth);
            }
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    const aspectBoxStyle = Object.assign(
        {
            height: ratio !== 0 ? width / ratio : undefined
        },
        style
    );

    return <div ref={ref} style={aspectBoxStyle} {...rest} />;
}
