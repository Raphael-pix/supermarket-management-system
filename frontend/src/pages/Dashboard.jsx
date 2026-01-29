import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import BranchPieChart from "../components/dashboard/BranchPieChart";
import SalesLineChart from "../components/dashboard/SalesLineChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import { dashboardAPI } from "../utils/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import LowStockAlert from "../components/inventory/LowStockAlert";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, timelineRes, transactionsRes] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getSalesTimeline(),
        dashboardAPI.getRecentTransactions(10),
      ]);

      setMetrics(metricsRes.data);
      setTimeline(timelineRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your supermarket operations across all branches
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={metrics ? formatCurrency(metrics.totalRevenue) : "-"}
          icon={DollarSign}
          color="green"
          loading={loading}
        />
        <MetricCard
          title="Total Sales"
          value={metrics ? formatNumber(metrics.totalSales) : "-"}
          icon={ShoppingCart}
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Products"
          value={metrics ? metrics.revenueByProduct.length : "-"}
          icon={Package}
          color="purple"
          loading={loading}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={metrics ? metrics.lowStockAlerts.length : "-"}
          icon={AlertTriangle}
          color="orange"
          loading={loading}
        />
      </div>

      {metrics && metrics.lowStockAlerts.length > 0 && (
        <LowStockAlert metrics={metrics} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          data={metrics?.revenueByProduct || []}
          loading={loading}
        />
        <BranchPieChart data={metrics?.salesByBranch || []} loading={loading} />
      </div>

      <SalesLineChart data={timeline} loading={loading} />

      <RecentTransactions data={transactions} loading={loading} />
    </div>
  );
};

export default Dashboard;
