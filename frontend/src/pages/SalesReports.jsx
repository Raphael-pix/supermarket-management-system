import { useState, useEffect } from "react";
import { TrendingUp, Download, RotateCcw } from "lucide-react";
import { salesAPI } from "../utils/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import ExportSalesModal from "../components/sales/ExportSalesModal";
import TopProductsCard from "../components/sales/TopProductsCard";
import BranchSalesTable from "../components/sales/BranchSalesTable";
import ProductSalesTable from "../components/sales/ProductSalesTable";

const SalesReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branchId: "",
  });
  const [exportFilters, setExportFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const response = await salesAPI.getReports(appliedFilters);
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
  const handleResetFilters = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      branchId: "",
    };

    setFilters(resetFilters);
    fetchReports(resetFilters);
  };

  const handleExport = async () => {
    try {
      const response = await salesAPI.exportReport(exportFilters, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `sales-report-${exportFilters.startDate}-to-${exportFilters.endDate}.csv`;
      link.click();

      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
      setExportFilters({
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
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
      <div className="flex items-start  md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Sales Reports</h1>
          <p className="text-muted-foreground mt-2 not-md:text-sm">
            Comprehensive sales analytics and reporting
          </p>
        </div>
        <button
          className="btn btn-primary not-md:mt-2"
          onClick={() => setShowExportModal(true)}
        >
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
              max={today}
              onChange={(e) => {
                const startDate = e.target.value;

                setFilters((prev) => {
                  let endDate = prev.endDate;
                  if (!prev.endDate) {
                    endDate = today;
                  }

                  if (endDate && endDate < startDate) {
                    endDate = today;
                  }

                  return { ...prev, startDate, endDate };
                });
              }}
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
              min={filters.startDate || undefined}
              max={today}
              onChange={(e) => {
                let selectedEndDate = e.target.value;

                if (
                  selectedEndDate > today ||
                  selectedEndDate < exportFilters.startDate
                ) {
                  selectedEndDate = today;
                }

                setFilters((prev) => ({
                  ...prev,
                  endDate: selectedEndDate,
                }));
              }}
              className="input"
            />
          </div>
          <div className="flex gap-4 items-end">
            <button
              onClick={handleApplyFilters}
              className="btn btn-secondary"
              disabled={!filters.startDate || !filters.endDate}
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm mb-1"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

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
      <ProductSalesTable reports={reports} />

      {/* Sales by Branch */}
      <BranchSalesTable reports={reports} />

      <div className="card">
        <h3 className="text-lg font-semibold  mb-4">Top Performing Products</h3>
        <div className="space-y-4">
          {reports?.topProducts.map((product, index) => (
            <div key={index}>
              <TopProductsCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
      {showExportModal && (
        <ExportSalesModal
          today={today}
          exportFilters={exportFilters}
          setExportFilters={setExportFilters}
          setShowExportModal={setShowExportModal}
          handleExport={handleExport}
        />
      )}
    </div>
  );
};

export default SalesReports;
