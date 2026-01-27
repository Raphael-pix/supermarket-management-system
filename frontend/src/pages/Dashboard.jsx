import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import MetricCard from "../components/dashboard/MetricCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import BranchPieChart from "../components/dashboard/BranchPieChart";
import SalesLineChart from "../components/dashboard/SalesLineChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import { dashboardAPI } from "../utils/api";
import { formatCurrency, formatNumber } from "../utils/formatters";

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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Overview of your supermarket operations across all branches
        </p>
      </div>

      {/* Metrics Grid */}
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

      {/* Low Stock Alerts */}
      {metrics && metrics.lowStockAlerts.length > 0 && (
        <div className="alert alert-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Low Stock Alert!</p>
              <p className="text-sm">
                {metrics.lowStockAlerts.length} product(s) are running low
                across branches. Check the Inventory section to restock.
              </p>
              <div className="mt-2 space-y-1">
                {metrics.lowStockAlerts.slice(0, 3).map((alert, idx) => (
                  <p key={idx} className="text-sm">
                    <span className="font-medium">{alert.product}</span> at{" "}
                    {alert.branch}:
                    <span className="ml-1 font-semibold">
                      {alert.currentStock} units
                    </span>
                    <span className="text-yellow-700">
                      {" "}
                      (threshold: {alert.threshold})
                    </span>
                  </p>
                ))}
                {metrics.lowStockAlerts.length > 3 && (
                  <p className="text-sm font-medium">
                    +{metrics.lowStockAlerts.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          data={metrics?.revenueByProduct || []}
          loading={loading}
        />
        <BranchPieChart data={metrics?.salesByBranch || []} loading={loading} />
      </div>

      {/* Sales Timeline */}
      <SalesLineChart data={timeline} loading={loading} />

      {/* Recent Transactions */}
      <RecentTransactions data={transactions} loading={loading} />
    </div>
  );
};

export default Dashboard;
