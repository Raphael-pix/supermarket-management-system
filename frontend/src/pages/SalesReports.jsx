import { useState, useEffect } from "react";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { salesAPI } from "../utils/api";
import { formatCurrency, formatNumber } from "../utils/formatters";

const SalesReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branchId: "",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getReports(filters);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchReports();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start  md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Sales Reports</h1>
          <p className="text-muted-foreground mt-2 not-md:text-sm">
            Comprehensive sales analytics and reporting
          </p>
        </div>
        <button className="btn btn-primary not-md:mt-2">
          <Download className="w-4 h-4" />
          <span className="hidden md:block">Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-2 block">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="input"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-2 block">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="btn btn-secondary"
              disabled={!filters.startDate || !filters.endDate}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(reports?.summary.totalRevenue || 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Across all branches and products
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Sales
            </h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">
            {formatNumber(reports?.summary.totalSales || 0)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Number of transactions
          </p>
        </div>
      </div>

      {/* Sales by Product */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Sales by Product</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Product Name</th>
                <th className="table-header-cell">Quantity Sold</th>
                <th className="table-header-cell">Revenue</th>
                <th className="table-header-cell">% of Total</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {reports?.salesByProduct.map((product) => (
                <tr key={product.productId} className="table-row-hover">
                  <td className="table-cell font-medium">
                    {product.productName}
                  </td>
                  <td className="table-cell">
                    {formatNumber(product.quantitySold)} units
                  </td>
                  <td className="table-cell font-semibold">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2 max-w-xs">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${((product.revenue / reports.summary.totalRevenue) * 100).toFixed(1)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {(
                          (product.revenue / reports.summary.totalRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales by Branch */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Sales by Branch</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Branch Name</th>
                <th className="table-header-cell">Total Sales</th>
                <th className="table-header-cell">Revenue</th>
                <th className="table-header-cell">Avg Transaction</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {reports?.salesByBranch.map((branch) => (
                <tr key={branch.branchId} className="table-row-hover">
                  <td className="table-cell font-medium">
                    {branch.branchName}
                  </td>
                  <td className="table-cell">
                    {formatNumber(branch.totalSales)}
                  </td>
                  <td className="table-cell font-semibold">
                    {formatCurrency(branch.totalRevenue)}
                  </td>
                  <td className="table-cell text-muted-foreground">
                    {formatCurrency(branch.totalRevenue / branch.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h3 className="text-lg font-semibold  mb-4">Top Performing Products</h3>
        <div className="space-y-4">
          {reports?.topProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-semibold ">{product.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(product.quantitySold)} units sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold ">{formatCurrency(product.revenue)}</p>
                <p className="text-sm text-muted-foreground">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
