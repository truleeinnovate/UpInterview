import { useState } from "react";
import {
  AiOutlineDownload,
  AiOutlineMail,
} from "react-icons/ai";
import StatusBadge from "../common/StatusBadge";
import { Minimize, Expand, X } from "lucide-react";

function ReceiptDetailsModal({ receipt, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
                Receipt Details
              </h3>
              <p className="text-gray-500 mt-1">Receipt ID: {receipt.id}</p>
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
                <h4 className="text-sm font-medium text-gray-500">
                  Receipt Information
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice ID</span>
                    <span className="font-mono">{receipt.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">
                      {formatCurrency(receipt.amount)}
                    </span>
                  </div>
                  {receipt.discount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Price</span>
                        <span className="text-gray-500">
                          {formatCurrency(receipt.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-success-600">
                          -{formatCurrency(receipt.discount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Payment Details
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="capitalize">
                      {receipt.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono">{receipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date</span>
                    <span>{formatDate(receipt.paymentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge
                      status={
                        receipt.status === "success" ? "success" : "warning"
                      }
                      text={receipt.status.toUpperCase()}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Receipt Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(receipt.price)}</span>
                  </div>
                  {receipt.discount > 0 && (
                    <div className="flex justify-between text-success-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(receipt.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span>Total Paid</span>
                    <span>{formatCurrency(receipt.amount)}</span>
                  </div>
                </div>
              </div>
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

export default ReceiptDetailsModal;
