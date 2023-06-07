import { Typography, useTheme } from "@mui/material";
import mermaid from "mermaid";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

export interface MermaidViewerProps {
    chart?: string;
}

export default function MermaidViewer(props: MermaidViewerProps) {
    const theme = useTheme();
    useEffect(() => mermaid.contentLoaded(), []);

    mermaid.initialize({
        startOnLoad: true,
        theme: theme.palette.mode === "dark" ? "dark" : "neutral",
        fontFamily: '"Fira Mono", monospace',
    });

    return (
        <ErrorBoundary
            fallbackRender={({ error }) => (
                <Typography color="error">{error.toString()}</Typography>
            )}
        >
            <div className="mermaid">{props.chart}</div>
        </ErrorBoundary>
    );
}
