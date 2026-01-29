import { formatCurrency, formatNumber } from "../../utils/formatters";

const TopProductsCard = ({ product, index }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-accent-foreground">
            #{index + 1}
          </span>
        </div>
        <div>
          <p className="font-semibold ">{product.productName}</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(product.quantitySold)} units sold
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold ">{formatCurrency(product.revenue)}</p>
        <p className="text-sm text-muted-foreground">revenue</p>
      </div>
    </div>
  );
};

export default TopProductsCard;
