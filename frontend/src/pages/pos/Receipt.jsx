import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, Home, CheckCircle } from "lucide-react";
import posAPI from "../../utils/pos.service";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const Receipt = () => {
  const { transactionRef } = useParams();
  const navigate = useNavigate();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transactionRef) {
      fetchReceipt();
    }
  }, [transactionRef]);

  const fetchReceipt = async () => {
    try {
      const response = await posAPI.getReceipt(transactionRef);
      setReceipt(response.data);
    } catch (err) {
      setError("Failed to load receipt. Please contact support.");
      console.error("Fetch receipt error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewOrder = () => {
    navigate("/pos");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="spinner border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Receipt Not Found
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={handleNewOrder} className="btn btn-primary">
            Back to POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Banner - No Print */}
          <div className="no-print bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Transaction Complete!
            </h2>
            <p className="text-green-700">Payment received successfully</p>
          </div>

          {/* Action Buttons - No Print */}
          <div className="no-print flex gap-4 mb-6">
            <button onClick={handlePrint} className="btn btn-outline flex-1">
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button onClick={handleNewOrder} className="btn btn-primary flex-1">
              <Home className="w-5 h-5" />
              New Order
            </button>
          </div>

          {/* Receipt Content */}
          <div
            id="receipt-content"
            className="bg-white rounded-xl shadow-lg p-8 print-full-width"
          >
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-slate-200">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Soft Drinks Distribution
              </h1>
              <p className="text-xl font-semibold text-green-600 mb-1">
                {receipt.branch}
              </p>
              <p className="text-sm text-slate-600">{receipt.location}</p>
            </div>

            {/* Transaction Details */}
            <div className="mb-8 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Transaction Ref:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {receipt.transactionRef}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Date & Time:</span>
                <span className="font-semibold text-slate-900">
                  {formatDateTime(receipt.date)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Payment Method:</span>
                <span className="font-semibold text-slate-900">
                  {receipt.paymentMethod}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Items Purchased
              </h3>

              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-600 border-b border-slate-200">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 text-slate-900">{item.name}</td>
                      <td className="py-3 text-center font-semibold">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-slate-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t-2 border-slate-300 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-slate-900">
                  TOTAL PAID
                </span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(receipt.total)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">
                Thank you for your purchase!
              </p>
              <p className="text-xs text-slate-500">
                For support, please contact your branch
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Powered by Soft Drinks Distribution System
              </p>
            </div>

            {/* QR Code Placeholder (optional) */}
            <div className="mt-6 flex justify-center">
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xs text-slate-400">QR Code</span>
              </div>
            </div>
          </div>

          {/* Mobile-friendly actions at bottom */}
          <div className="no-print mt-6 flex flex-col gap-3">
            <button
              onClick={handleNewOrder}
              className="btn btn-primary w-full text-lg py-3"
            >
              Start New Order
            </button>
            <button onClick={handlePrint} className="btn btn-outline w-full">
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
