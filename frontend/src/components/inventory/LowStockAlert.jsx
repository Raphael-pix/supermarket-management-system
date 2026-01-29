import { AlertTriangle } from "lucide-react";

const LowStockAlert = ({ metrics }) => {
  return (
    <div className="alert alert-warning">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold mb-1">Low Stock Alert!</p>
          <p className="text-sm">
            {metrics.lowStockAlerts.length} product(s) are running low across
            branches. Check the Inventory section to restock.
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
  );
};

export default LowStockAlert;
