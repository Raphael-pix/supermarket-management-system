import { useState, useEffect } from "react";
import { Package, RefreshCw, AlertCircle, Plus, Truck } from "lucide-react";
import { inventoryAPI } from "../utils/api";
import {
  formatNumber,
  getStockStatusColor,
  getStockStatusText,
} from "../utils/formatters";
import { toast } from "sonner";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [restockData, setRestockData] = useState({
    toBranchId: "",
    products: [],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [selectedBranch, showLowStock]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBranch) params.branchId = selectedBranch;
      if (showLowStock) params.lowStock = "true";

      const [inventoryRes, branchesRes, productsRes] = await Promise.all([
        inventoryAPI.getInventory(params),
        inventoryAPI.getBranches(),
        inventoryAPI.getProducts(),
      ]);

      setInventory(inventoryRes.data);
      setBranches(branchesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    try {
      setIsRestocking(true);
      await inventoryAPI.restockBranch(restockData);
      toast.success("Restock Completed Successfully");
      setRestockModalOpen(false);
      setRestockData({ toBranchId: "", products: [], notes: "" });
      fetchData();
    } catch (error) {
      console.error("Error restocking:", error);
      toast.success(error.response?.data?.error || "Failed to restock");
    } finally {
      setIsRestocking(false);
    }
  };

  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.branch]) {
      acc[item.branch] = [];
    }
    acc[item.branch].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2 not-md:text-sm">
            Manage stock levels across all branches
          </p>
        </div>
        <button
          onClick={() => setRestockModalOpen(true)}
          className="btn btn-primary not-md:mt-2"
        >
          <Truck className="w-4 h-4" />
          <span className="hidden md:block">Restock Branch</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-2 block">
              Filter by Branch
            </label>
            <div className="flex items-center gap-4">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="input w-64"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <div className="items-center gap-2 w-full hidden md:flex">
                <input
                  type="checkbox"
                  id="lowStock"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="lowStock" className="text-sm font-medium">
                  Show only low stock items
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="btn btn-outline btn-sm ml-auto not-md:mt-6"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:block">Refresh</span>
          </button>
        </div>
        <div className="flex items-center gap-2 w-full mt-3 px-2 md:hidden">
          <input
            type="checkbox"
            id="lowStock"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="lowStock" className="text-sm font-medium">
            Show only low stock items
          </label>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="h-64 flex items-center justify-center">
            <div className="spinner border-primary"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInventory).map(([branchName, items]) => (
            <div key={branchName} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{branchName}</h3>
                <span className="badge badge-info">
                  {items.length} products
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Product</th>
                      <th className="table-header-cell">Price</th>
                      <th className="table-header-cell">Current Stock</th>
                      <th className="table-header-cell">Threshold</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Last Restocked</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {items.map((item) => (
                      <tr key={item.id} className="table-row-hover">
                        <td className="table-cell font-medium">
                          {item.product}
                        </td>
                        <td className="table-cell">
                          KES {item.price.toFixed(2)}
                        </td>
                        <td className="table-cell">
                          <span
                            className={`font-semibold ${
                              item.quantity === 0
                                ? "text-red-600"
                                : item.isLowStock
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {formatNumber(item.quantity)} units
                          </span>
                        </td>
                        <td className="table-cell text-muted-foreground">
                          {item.lowStockThreshold} units
                        </td>
                        <td className="table-cell">
                          <span
                            className={`badge ${
                              item.quantity === 0
                                ? "badge-danger"
                                : item.isLowStock
                                  ? "badge-warning"
                                  : "badge-success"
                            }`}
                          >
                            {getStockStatusText(
                              item.quantity,
                              item.lowStockThreshold,
                            )}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-muted-foreground">
                          {item.lastRestocked
                            ? new Date(item.lastRestocked).toLocaleDateString()
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {Object.keys(groupedInventory).length === 0 && (
            <div className="card">
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No inventory items found
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Restock Modal */}
      {restockModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Restock Branch</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Branch to Restock
                </label>
                <select
                  value={restockData.toBranchId}
                  onChange={(e) =>
                    setRestockData({
                      ...restockData,
                      toBranchId: e.target.value,
                    })
                  }
                  className="input"
                >
                  <option value="">Select branch...</option>
                  {branches
                    .filter((b) => !b.isHQ)
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Products to Restock
                </label>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 mb-3"
                  >
                    <span className="text-sm font-medium w-24">
                      {product.name}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Quantity"
                      className="input flex-1"
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        const existingProducts = restockData.products.filter(
                          (p) => p.productId !== product.id,
                        );
                        if (quantity > 0) {
                          setRestockData({
                            ...restockData,
                            products: [
                              ...existingProducts,
                              { productId: product.id, quantity },
                            ],
                          });
                        } else {
                          setRestockData({
                            ...restockData,
                            products: existingProducts,
                          });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  value={restockData.notes}
                  onChange={(e) =>
                    setRestockData({ ...restockData, notes: e.target.value })
                  }
                  className="input"
                  rows="3"
                  placeholder="Add any notes about this restock operation..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setRestockModalOpen(false);
                  setRestockData({ toBranchId: "", products: [], notes: "" });
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={
                  !restockData.toBranchId ||
                  restockData.products.length === 0 ||
                  isRestocking
                }
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRestocking ? (
                  <span>Restocking...</span>
                ) : (
                  <span>Confirm Restock</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
