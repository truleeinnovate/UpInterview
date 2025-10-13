// v1.0.0 - Ashok - added loading view for the kanban itself
// v1.0.1 - Ashok - fixed responsiveness issue
// v1.0.2 - Ashok - changed fields structure and loading view

import React from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
// Fixing image imports - these images aren't needed for invoices
// import maleImage from "../../../../assets/images/man.png";
// import femaleImage from "../../../../assets/images/woman.png";
// import genderlessImage from "../../../../assets/images/transgender.png";
import { useNavigate } from "react-router-dom";

const InvoiceKanban = ({
  currentFilteredRows,
  handleUserClick = () => {},
  handleEditClick = () => {},
  toggleSidebar = () => {},
  loading = false,
}) => {
  const navigate = useNavigate();
  return (
    <>
      {/* v1.0.2 <-------------------------------------------------------------------------------- */}
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto mx-6">
        {loading ? (
          // shimmer cards
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-full animate-pulse"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="relative"></div>
                <div className="ml-1">
                  <div className="h-3 w-16 bg-gray-200 rounded shimmer"></div>
                  <div className="h-4 w-28 mt-2 bg-gray-200 rounded shimmer"></div>
                </div>
              </div>

              {/* Action button placeholder */}
              <div className="flex items-center gap-1">
                <div className="p-1.5 w-7 h-7 bg-gray-200 rounded-lg shimmer"></div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="grid grid-cols-2 items-center gap-2">
                  <div className="h-3 w-20 bg-gray-200 rounded shimmer"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded shimmer"></div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : currentFilteredRows.length === 0 ? (
          // 🔹 Empty state
          <div className="col-span-full py-10 text-center">
            <div className="flex flex-col items-center justify-center p-5">
              <p className="text-center text-lg font-normal">
                No Billing Data Found.
              </p>
            </div>
          </div>
        ) : (
          // 🔹 Actual data cards
          currentFilteredRows.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* User card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative"></div>
                  <div className="ml-1">
                    <span> Payment Id</span>
                    <h4 className="text-sm font-medium text-gray-900">
                      {invoice?.paymentId || ""}
                    </h4>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      navigate(`details/${invoice.id}`, {
                        state: { invoiceData: invoice },
                      });
                    }}
                    className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact information */}
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500">Invoice Id</span>
                  <span className="text-gray-800 font-medium">
                    {invoice?.invoiceNumber || ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500">Payment Service</span>
                  <span className="text-gray-800 font-medium">
                    {invoice?.type
                      ? invoice?.type.charAt(0).toUpperCase() +
                        invoice?.type.slice(1)
                      : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="text-gray-800 font-medium">
                    $ {invoice?.amount?.paid || 0}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center">
                  <span className="text-gray-500">Status</span>
                  <span className="text-gray-800 font-medium">
                    {invoice?.status
                      ? invoice?.status.charAt(0).toUpperCase() +
                        invoice?.status.slice(1)
                      : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      {/* v1.0.2 --------------------------------------------------------------------------------> */}
    </>
  );
};

export default InvoiceKanban;
