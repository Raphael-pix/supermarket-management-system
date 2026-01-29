import { useState, useEffect } from "react";
import { Box, Package, RefreshCw, Truck } from "lucide-react";
import { inventoryAPI } from "../utils/api";

import { toast } from "sonner";
import StockTable from "../components/inventory/StockTable";
import {
  RestockModal,
  RestockHqModal,
} from "../components/inventory/RestockModal";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockHqModalOpen, setRestockHqModalOpen] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);
  const [isRestockingHq, setIsRestockingHq] = useState(false);
  const [restockData, setRestockData] = useState({
    toBranchId: "",
    products: [],
    notes: "",
  });
  const [restockHqData, setRestockHqData] = useState({
    supplierName: "",
    referenceNo: "",
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

  const handleRestockHq = async () => {
    try {
      setIsRestockingHq(true);
      await inventoryAPI.restockHq(restockHqData);
      toast.success("Restock Completed Successfully");
      setRestockHqModalOpen(false);
      setRestockHqData({
        supplierName: "",
        referenceNo: "",
        products: [],
        notes: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error restocking:", error);
      toast.success(error.response?.data?.error || "Failed to restock");
    } finally {
      setIsRestockingHq(false);
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
      <div className="flex items-start justify-between md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2 not-md:text-sm">
            Manage stock levels across all branches
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 not-md:mt-2">
          <button
            onClick={() => setRestockModalOpen(true)}
            className="btn btn-primary"
          >
            <Truck className="w-4 h-4" />
            <span className="hidden md:block">Restock Branch</span>
          </button>
          <button
            onClick={() => setRestockHqModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <Box className="w-4 h-4" />
            <span className="hidden md:block">Restock Hq</span>
          </button>
        </div>
      </div>

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
            <div key={branchName}>
              <StockTable branchName={branchName} items={items} />
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

      {restockModalOpen && (
        <RestockModal
          branches={branches}
          products={products}
          restockData={restockData}
          isRestocking={isRestocking}
          setRestockData={setRestockData}
          handleRestock={handleRestock}
          setRestockModalOpen={setRestockModalOpen}
        />
      )}

      {restockHqModalOpen && (
        <RestockHqModal
          products={products}
          restockHqData={restockHqData}
          isRestockingHq={isRestockingHq}
          setRestockHqData={setRestockHqData}
          handleRestockHq={handleRestockHq}
          setRestockHqModalOpen={setRestockHqModalOpen}
        />
      )}
    </div>
  );
};

export default Inventory;
