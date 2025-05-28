import type { ChartOptions } from "chart.js";

export const trackChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
};

export const chartOptions: ChartOptions<"radar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
      align: "center",
      labels: {
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: "#282828",
      titleColor: "#ffffff",
      bodyColor: "#b3b3b3",
      borderColor: "#404040",
      borderWidth: 1,
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || "";
          const value = context.raw;
          const rounded = typeof value === "number" ? value.toFixed(2) : value;
          return `${label}: ${rounded}`;
        },
      },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 1,
      ticks: {
        color: "#535353",
        backdropColor: "transparent",
      },
      grid: {
        color: "#404040",
      },
      angleLines: {
        color: "#404040",
      },
      pointLabels: {
        color: "#b3b3b3",
        font: {
          size: 11,
          family: "'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      },
    },
  },
};

export const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#282828",
      titleColor: "#ffffff",
      bodyColor: "#b3b3b3",
      borderColor: "#404040",
      borderWidth: 1,
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || "";
          const value = context.raw;
          const rounded = typeof value === "number" ? value.toFixed(2) : value;
          return `${label}: ${rounded}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: "#b3b3b3",
        font: {
          family: "'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      },
    },
    y: {
      beginAtZero: true,
      max: 1,
      grid: {
        color: "#404040",
        drawBorder: false,
      },
      ticks: {
        color: "#b3b3b3",
        font: {
          family: "'Circular', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      },
    },
  },
};
