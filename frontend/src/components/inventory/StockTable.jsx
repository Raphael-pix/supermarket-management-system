import { formatNumber, getStockStatusText } from "../../utils/formatters";

const StockTable = ({ branchName, items }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{branchName}</h3>
        <span className="badge badge-info">{items.length} products</span>
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
                <td className="table-cell font-medium">{item.product}</td>
                <td className="table-cell">KES {item.price.toFixed(2)}</td>
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
                    {getStockStatusText(item.quantity, item.lowStockThreshold)}
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
  );
};

export default StockTable;
