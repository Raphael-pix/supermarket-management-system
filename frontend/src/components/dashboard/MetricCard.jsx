import { TrendingUp, TrendingDown } from "lucide-react";

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  loading = false,
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse w-32"></div>
          ) : (
            <p className="text-3xl font-bold  mb-2">{value}</p>
          )}

          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-sm text-muted-foreground">
                vs last period
              </span>
            </div>
          )}
        </div>

        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
