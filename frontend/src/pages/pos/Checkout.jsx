import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, Phone, Loader } from "lucide-react";
import posAPI from "../../utils/pos.service";
import { formatCurrency } from "../../utils/formatters";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");

  const { cart, branch } = location.state || {};

  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, waiting, success, failed
  const [error, setError] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [transactionRef, setTransactionRef] = useState("");

  useEffect(() => {
    if (!cart || cart.length === 0 || !branch) {
      navigate("/pos");
    }
  }, [cart, branch]);

  const getCartTotal = () => {
    return (
      cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    );
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, "");

    // Format as 07XX XXX XXX or 254XXX XXX XXX
    if (cleaned.startsWith("254")) {
      return cleaned.slice(0, 12);
    } else if (cleaned.startsWith("0")) {
      return cleaned.slice(0, 10);
    } else if (cleaned.startsWith("7")) {
      return "0" + cleaned.slice(0, 9);
    }
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = () => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.startsWith("254")) {
      return cleaned.length === 12;
    } else if (cleaned.startsWith("0") || cleaned.startsWith("7")) {
      return cleaned.length === 10;
    }
    return false;
  };

  const handleInitiatePayment = async () => {
    if (!validatePhoneNumber()) {
      setError(
        "Please enter a valid M-Pesa number (e.g., 0712345678 or 254712345678)",
      );
      return;
    }

    setProcessing(true);
    setError("");
    setPaymentStatus("initiating");

    try {
      // Prepare items for API
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const total = getCartTotal();

      // Initiate payment
      const response = await posAPI.initiatePayment(
        branchId,
        phoneNumber,
        items,
        total,
      );

      if (response.data.success) {
        setCheckoutRequestId(response.data.checkoutRequestId);
        setTransactionRef(response.data.transactionRef);
        setPaymentStatus("waiting");

        // Start polling for payment confirmation
        startPaymentPolling(response.data.checkoutRequestId, items, total);
      } else {
        setError(response.data.error || "Failed to initiate payment");
        setPaymentStatus("failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to initiate payment. Please try again.",
      );
      setPaymentStatus("failed");
    } finally {
      setProcessing(false);
    }
  };

  const startPaymentPolling = async (checkoutId, items, total) => {
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds (poll every second)

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await posAPI.confirmPayment(
          checkoutId,
          branchId,
          phoneNumber,
          items,
          total,
        );

        if (response.data.success) {
          clearInterval(pollInterval);
          setPaymentStatus("success");
          setTransactionRef(response.data.transactionRef);

          // Navigate to receipt after short delay
          setTimeout(() => {
            navigate(`/pos/receipt/${response.data.transactionRef}`);
          }, 2000);
        }
      } catch (err) {
        // If payment failed or timed out
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setPaymentStatus("failed");
          setError("Payment timeout. Please try again or contact support.");
        }
      }
    }, 1000);
  };

  if (!cart || !branch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {paymentStatus === "idle" && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
              <p className="text-sm text-slate-600">{branch.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">
                Total
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(getCartTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {paymentStatus === "idle" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  M-Pesa Payment
                </h2>
                <p className="text-sm text-slate-600">
                  Pay using M-Pesa STK Push
                </p>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mb-4">
                <p>{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="0712345678 or 254712345678"
                  className="input pl-12 text-lg"
                  disabled={processing}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Enter the M-Pesa number to receive the payment prompt
              </p>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={processing || !phoneNumber}
              className="btn btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>Pay {formatCurrency(getCartTotal())}</>
              )}
            </button>
          </div>
        )}

        {/* Waiting for Payment */}
        {paymentStatus === "waiting" && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Phone className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Waiting for Payment
            </h2>

            <p className="text-slate-600 mb-6">
              Please check your phone and enter your M-Pesa PIN to complete the
              payment
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Phone:</strong> {phoneNumber}
              </p>
              <p className="text-sm text-blue-900">
                <strong>Amount:</strong> {formatCurrency(getCartTotal())}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Loader className="w-5 h-5 animate-spin" />
              <p className="text-sm">Processing payment...</p>
            </div>
          </div>
        )}

        {/* Payment Success */}
        {paymentStatus === "success" && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-green-600 mb-3">
              Payment Successful!
            </h2>

            <p className="text-slate-600 mb-6">
              Your payment has been confirmed. Redirecting to receipt...
            </p>

            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin text-green-600" />
            </div>
          </div>
        )}

        {/* Payment Failed */}
        {paymentStatus === "failed" && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Payment Failed
            </h2>

            <p className="text-slate-600 mb-6">
              {error || "Payment could not be completed. Please try again."}
            </p>

            <button
              onClick={() => {
                setPaymentStatus("idle");
                setError("");
                setPhoneNumber("");
              }}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
