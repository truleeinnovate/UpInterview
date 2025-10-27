import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { Minimize, Expand, X, Download, Mail, Edit } from "lucide-react";

function InvoiceDetailsModal({ invoice, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 flex justify-end z-50">
      <div
        className={`bg-white h-screen overflow-y-auto transition-all duration-300 ${
          isExpanded ? "w-full" : "w-1/2"
        }`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-secondary-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Invoice Details
              </h3>
              <p className="text-gray-500 mt-1">Invoice ID: {invoice.id}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-500 hover:text-gray-500 rounded-full hover:bg-white/50"
              >
                {isExpanded ? <Minimize size={20} /> : <Expand size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-500 rounded-full hover:bg-white/50"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Invoice Information
                </h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="capitalize">
                      {invoice?.type?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge
                      status={
                        invoice.status === "paid"
                          ? "success"
                          : invoice.status === "partially_paid"
                          ? "warning"
                          : invoice.status === "overdue"
                          ? "error"
                          : "warning"
                      }
                      text={invoice?.status?.replace("_", " ").toUpperCase()}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>

              {invoice.type === "subscription" && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Subscription Period
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date</span>
                      <span>{formatDate(invoice.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date</span>
                      <span>{formatDate(invoice.endDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Payment Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span>{formatCurrency(invoice?.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span>{formatCurrency(invoice?.amountPaid)}</span>
                  </div>
                  {invoice?.outstandingAmount > 0 && (
                    <div className="flex justify-between text-error-600 font-medium">
                      <span>Outstanding Amount</span>
                      <span>{formatCurrency(invoice?.outstandingAmount)}</span>
                    </div>
                  )}
                  {invoice?.discount > 0 && (
                    <div className="flex justify-between text-success-600">
                      <span>Discount Applied</span>
                      <span>-{formatCurrency(invoice?.discount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Line Items
            </h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Tax
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice?.lineItems?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {formatCurrency(item.tax)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.amount * item.quantity + item.tax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {invoice.status === "pending" && (
              <button className="btn-secondary flex items-center">
                <Edit className="mr-2" />
                Edit Invoice
              </button>
            )}
            <button className="btn-secondary flex items-center">
              <Download className="mr-2" />
              Download PDF
            </button>
            <button className="btn-secondary flex items-center">
              <Mail className="mr-2" />
              Send Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetailsModal;
