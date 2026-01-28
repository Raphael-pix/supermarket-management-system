import { ExternalLink } from "lucide-react";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const RecentTransactions = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="h-80 flex items-center justify-center">
          <div className="spinner border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Latest customer purchases across all branches
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Transaction ID</th>
              <th className="table-header-cell">Date & Time</th>
              <th className="table-header-cell">Branch</th>
              <th className="table-header-cell">Items</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">M-Pesa Ref</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="table-cell text-center text-muted-foreground py-8"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              data.map((transaction) => (
                <tr key={transaction.id} className="table-row-hover">
                  <td className="table-cell font-mono text-xs text-secondary-foreground">
                    {transaction.id.substring(0, 8)}...
                  </td>
                  <td className="table-cell text-sm">
                    {formatDateTime(transaction.date)}
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-info">
                      {transaction.branch}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm">
                      {transaction.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-secondary-foreground">
                          {item.quantity}x {item.product}
                        </div>
                      ))}
                      {transaction.items.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{transaction.items.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell font-semibold ">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-xs text-secondary-foreground">
                      {transaction.mpesaReference}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button className="btn btn-ghost btn-sm">
            View All Transactions
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
