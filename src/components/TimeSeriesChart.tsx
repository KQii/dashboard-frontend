import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface TimeSeriesChartProps {
  data: any[];
  lines: {
    dataKey: string;
    stroke: string;
    name: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    legendGroup?: string; // Group lines by this value in legend
  }[];
  xAxisKey: string;
  yAxisLabel?: string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  lines,
  xAxisKey,
  yAxisLabel,
  height = 300,
}: TimeSeriesChartProps) {
  const formatXAxis = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "HH:mm");
    } catch {
      return timestamp;
    }
  };

  // Check if lines use legendGroup
  const hasGroups = lines.some((line) => line.legendGroup);

  // Custom legend renderer for grouped items
  const renderCustomLegend = () => {
    // Group lines by legendGroup
    const groups = lines.reduce((acc, line) => {
      const group = line.legendGroup || line.name;
      if (!acc[group]) {
        acc[group] = { color: line.stroke, group };
      }
      return acc;
    }, {} as Record<string, { color: string; group: string }>);

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "10px",
        }}
      >
        {Object.values(groups).map(({ group, color }) => (
          <div
            key={group}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: color,
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#666" }}>{group}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxis}
          stroke="#666"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          label={
            yAxisLabel
              ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: "insideLeft",
                  dx: -6,
                }
              : undefined
          }
          stroke="#666"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          labelFormatter={(label) => format(new Date(label), "PPpp")}
        />
        {hasGroups ? <Legend content={renderCustomLegend} /> : <Legend />}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
            strokeWidth={line.strokeWidth ?? 2}
            strokeDasharray={line.strokeDasharray}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
