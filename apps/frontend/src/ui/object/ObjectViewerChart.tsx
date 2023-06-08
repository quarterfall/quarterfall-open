import { Typography, useTheme } from "@mui/material";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import merge from "lodash/merge";
import dynamic from "next/dynamic";
import React from "react";
import { ChartProps } from "react-chartjs-2";
import { ErrorBoundary } from "react-error-boundary";
import { BaseObjectViewerProps } from "./ObjectViewer";

const ChartComponent: React.ComponentType<ChartProps> = dynamic(() =>
    import("react-chartjs-2").then((mod) => mod.Chart)
);

export const chartTypes = [
    "bar",
    "bubble",
    "doughnut",
    "line",
    "pie",
    "polarArea",
    "radar",
    "scatter",
];

export type ObjectViewerChartProps = BaseObjectViewerProps & {
    type: keyof import("chart.js").ChartTypeRegistry;
    options?: any;
    data?: any;
};

export function ObjectViewerChart(props: ObjectViewerChartProps) {
    const { type, data } = props;

    const { palette } = useTheme();

    const chartColors = {
        textColor:
            palette.mode === "dark"
                ? palette.text.primary
                : palette.text.secondary,
    };
    // set default options
    const options = merge(
        {
            height: 300,
            responsive: true,
            maintainAspectRatio: false,
        },
        type !== "pie" &&
            type !== "doughnut" &&
            type !== "polarArea" &&
            type !== "radar"
            ? {
                  scales: {
                      y: {
                          ticks: {
                              color: chartColors.textColor,
                          },
                          position: "left",
                      },
                      x: {
                          ticks: {
                              color: chartColors.textColor,
                          },
                      },
                  },
              }
            : {
                  plugins: {
                      legend: {
                          labels: {
                              color: chartColors.textColor,
                          },
                      },
                  },
              },
        type === "polarArea" || type === "radar"
            ? {
                  scale: {
                      ticks: {
                          showLabelBackdrop: false, // for some reason, this doesn't work as a global setting
                      },
                  },
              }
            : {},
        props.options || {}
    );

    return (
        <div
            style={{
                height: options.height,
                width: options.width,
                margin: "auto",
                position: "relative",
            }}
        >
            <ErrorBoundary
                fallbackRender={({ error }) => (
                    <Typography color="error">{error.toString()}</Typography>
                )}
            >
                <ChartComponent type={type} options={options} data={data} />
            </ErrorBoundary>
        </div>
    );
}
