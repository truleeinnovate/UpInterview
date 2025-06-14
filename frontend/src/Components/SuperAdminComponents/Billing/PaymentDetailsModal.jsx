import { useState } from "react";
import {
  AiOutlineDownload,
  AiOutlineMail,
  AiOutlineCreditCard,
  AiOutlineBank,
  AiOutlineUser,
  AiOutlineKey,
  AiOutlineShop,
} from "react-icons/ai";
import StatusBadge from "../common/StatusBadge";
import { Minimize, Expand, X } from "lucide-react";

function PaymentDetailsModal({ payment, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-end z-50">
      <div
        className={`bg-white h-screen overflow-y-auto transition-all duration-300 ${
          isExpanded ? "w-full" : "w-1/2"
        }`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-secondary-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Payment Details
              </h3>
              <p className="text-gray-500 mt-1">Payment ID: {payment.id}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-white/50"
              >
                {isExpanded ? <Minimize size={20} /> : <Expand size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-white/50"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <AiOutlineCreditCard className="mr-2" />
                  Payment Information
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge
                      status={
                        payment.status === "captured"
                          ? "success"
                          : payment.status === "pending"
                          ? "warning"
                          : "error"
                      }
                      text={payment?.status?.toUpperCase()}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="capitalize">
                      {payment?.paymentMethod?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <AiOutlineBank className="mr-2" />
                  Gateway Details
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gateway</span>
                    <span className="capitalize">{payment.paymentGateway}</span>
                  </div>
                  {payment.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razorpay Payment ID</span>
                      <span className="font-mono text-sm">
                        {payment.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                  {payment.razorpayOrderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razorpay Order ID</span>
                      <span className="font-mono text-sm">
                        {payment.razorpayOrderId}
                      </span>
                    </div>
                  )}
                  {payment.razorpaySignature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signature</span>
                      <span
                        className="font-mono text-sm truncate max-w-[200px]"
                        title={payment.razorpaySignature}
                      >
                        {payment.razorpaySignature}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <AiOutlineUser className="mr-2" />
                  Customer Information
                </h4>
                <div className="mt-2 space-y-2">
                  {payment.razorpayCustomerId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer ID</span>
                      <span className="font-mono text-sm">
                        {payment.razorpayCustomerId}
                      </span>
                    </div>
                  )}
                  {payment.cardId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card ID</span>
                      <span className="font-mono text-sm">
                        {payment.cardId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <AiOutlineKey className="mr-2" />
                  Transaction Details
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono">{payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Date</span>
                    <span>{formatDate(payment.transactionDate)}</span>
                  </div>
                  {payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid At</span>
                      <span>{formatDate(payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 flex items-center">
                  <AiOutlineShop className="mr-2" />
                  Subscription Details
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recurring</span>
                    <span>{payment.isRecurring ? "Yes" : "No"}</span>
                  </div>
                  {payment.isRecurring && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Cycle</span>
                        <span className="capitalize">
                          {payment.billingCycle}
                        </span>
                      </div>
                      {payment.subscriptionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subscription ID</span>
                          <span className="font-mono text-sm">
                            {payment.subscriptionId}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Additional Information
                  </h4>
                  <div className="mt-2 bg-gray-50 rounded-lg p-3">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(payment.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {payment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-2 text-gray-600">{payment.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button className="btn-secondary flex items-center">
              <AiOutlineDownload className="mr-2" />
              Download Receipt
            </button>
            <button className="btn-secondary flex items-center">
              <AiOutlineMail className="mr-2" />
              Email Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetailsModal;
