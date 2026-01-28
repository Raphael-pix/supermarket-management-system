import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Package,
} from "lucide-react";
import posAPI from "../../utils/pos.service";
import { formatCurrency } from "../../utils/formatters";

const ProductSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");

  const [branch, setBranch] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchId) {
      navigate("/pos");
      return;
    }
    fetchProducts();
  }, [branchId]);

  const fetchProducts = async () => {
    try {
      const response = await posAPI.getBranchProducts(branchId);
      setBranch(response.data.branch);
      setProducts(response.data.products);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.availableStock) {
        alert(
          `Maximum available stock for ${product.name} is ${product.availableStock}`,
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity > item.availableStock) {
              alert(`Maximum available stock is ${item.availableStock}`);
              return item;
            }
            return { ...item, quantity: Math.max(0, newQuantity) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Please add items to cart");
      return;
    }
    navigate(`/pos/checkout?branchId=${branchId}`, { state: { cart, branch } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/pos")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{branch?.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {branch?.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-secondary-foreground" />
              <span className="font-semibold text-secondary-foreground">
                {getTotalItems()} items
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <div className="alert alert-danger">
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Available Products</h2>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No products available at this branch
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-muted"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Stock:{" "}
                        <span className="font-semibold">
                          {product.availableStock}
                        </span>
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary btn-sm"
                        disabled={product.availableStock === 0}
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg sticky top-24">
              <div className="p-6 border-b border-muted">
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-muted pb-4 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-lg bg-muted/90 hover:bg-muted flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-lg bg-muted/90 hover:bg-muted flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-muted">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-secondary-foreground">
                      {formatCurrency(getCartTotal())}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="btn btn-primary w-full text-lg py-3"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;
