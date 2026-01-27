import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const BranchPieChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="h-80 flex items-center justify-center">
          <div className="spinner border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.branchName,
    value: item.salesCount,
    revenue: item.revenue,
  }));

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Sales by Branch
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Distribution of sales across locations
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value, name, props) => [
              `${value} sales (${formatCurrency(props.payload.revenue)})`,
              props.payload.name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BranchPieChart;
