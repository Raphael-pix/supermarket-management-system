import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters";

const SalesLineChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="h-80 flex items-center justify-center">
          <div className="spinner border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Sales Trend</h3>
        <p className="text-sm text-slate-500 mt-1">
          Daily sales over the past 30 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelFormatter={(value) => formatDate(value)}
            formatter={(value, name) => {
              if (name === "Revenue") return [formatCurrency(value), name];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="salesCount"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
            name="Sales Count"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesLineChart;
