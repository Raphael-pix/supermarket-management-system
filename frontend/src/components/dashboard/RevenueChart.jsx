import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

const RevenueChart = ({ data, loading }) => {
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
        <h3 className="text-lg font-semibold text-slate-900">
          Revenue by Product
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Total revenue generated per drink brand
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="productName"
            tick={{ fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            tick={{ fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value) => [formatCurrency(value), "Revenue"]}
          />
          <Legend />
          <Bar
            dataKey="revenue"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            name="Revenue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
