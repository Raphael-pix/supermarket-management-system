const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "#e41c2d",
  loading = false,
}) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="w-6 h-6" color={color} />
      </div>
      {loading ? (
        <div className="h-8 bg-muted rounded animate-pulse w-32"></div>
      ) : (
        <p className="text-3xl font-bold ">{value || 0}</p>
      )}
    </div>
  );
};

export default StatsCard;
