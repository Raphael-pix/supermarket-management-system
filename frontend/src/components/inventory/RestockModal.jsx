const RestockModal = ({
  branches,
  products,
  restockData,
  isRestocking,
  setRestockData,
  handleRestock,
  setRestockModalOpen,
}) => {
  return (
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
              <div key={product.id} className="flex items-center gap-4 mb-3">
                <span className="text-sm font-medium w-24">{product.name}</span>
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
  );
};

const RestockHqModal = ({
  products,
  restockHqData,
  isRestockingHq,
  setRestockHqData,
  handleRestockHq,
  setRestockHqModalOpen,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Restock HQ</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Supplier Name
            </label>
            <input
              type="text"
              id="supplierName"
              name="supplierName"
              value={restockHqData.supplierName}
              onChange={(e) =>
                setRestockHqData({
                  ...restockHqData,
                  supplierName: e.target.value,
                })
              }
              className="input"
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Reference Number (Optional)
            </label>
            <input
              type="text"
              id="referenceNo"
              name="referenceNo"
              value={restockHqData.referenceNo}
              onChange={(e) =>
                setRestockHqData({
                  ...restockHqData,
                  referenceNo: e.target.value,
                })
              }
              className="input"
              placeholder="Enter reference number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Products to Restock
            </label>
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 mb-3">
                <span className="text-sm font-medium w-24">{product.name}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  className="input flex-1"
                  onChange={(e) => {
                    const quantity = parseInt(e.target.value) || 0;
                    const existingProducts = restockHqData.products.filter(
                      (p) => p.productId !== product.id,
                    );
                    if (quantity > 0) {
                      setRestockHqData({
                        ...restockHqData,
                        products: [
                          ...existingProducts,
                          { productId: product.id, quantity },
                        ],
                      });
                    } else {
                      setRestockHqData({
                        ...restockHqData,
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
              value={restockHqData.notes}
              onChange={(e) =>
                setRestockHqData({ ...restockHqData, notes: e.target.value })
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
              setRestockHqModalOpen(false);
              setRestockHqData({
                supplierName: "",
                referenceNo: "",
                products: [],
                notes: "",
              });
            }}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleRestockHq}
            disabled={restockHqData.products.length === 0 || isRestockingHq}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRestockingHq ? (
              <span>Restocking...</span>
            ) : (
              <span>Confirm Restock</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { RestockModal, RestockHqModal };
