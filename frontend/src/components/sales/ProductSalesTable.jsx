import { formatCurrency, formatNumber } from "../../utils/formatters";

const ProductSalesTable = ({ reports }) => {
  return (
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
                        className="bg-primary h-2 rounded-full"
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
  );
};

export default ProductSalesTable;
