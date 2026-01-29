import { formatCurrency, formatNumber } from "../../utils/formatters";

const BranchSalesTable = ({ reports }) => {
  return (
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
                <td className="table-cell font-medium">{branch.branchName}</td>
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
  );
};

export default BranchSalesTable;
