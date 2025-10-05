// v1.0.0 - Ashok - added loading view for the kanban itself
// v1.0.1 - Ashok - fixed responsiveness issue

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
     {/* v1.0.1 <------------------------------------------------------------------------------------------------- */}
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto mx-6">
     {/* v1.0.1 -------------------------------------------------------------------------------------------------> */}
        {loading ? (
          // shimmer cards
          // v1.0.1 <-----------------------------------------------------------
          <div className="w-full col-span-full">
          {/* v1.0.1 -----------------------------------------------------------> */}
            <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div
                  key={card}
                  className="rounded-xl p-4 shadow-sm border border-gray-200"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="shimmer h-8 w-8 bg-gray-200 rounded-full mr-3"></div>
                      <div>
                        <div className="shimmer h-3 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="shimmer h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="shimmer h-6 w-6 bg-gray-200 rounded"></div>
                  </div>

                  {/* Card content shimmer */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item}>
                          <div className="shimmer h-3 bg-gray-200 rounded w-16 mb-1"></div>
                          <div className="shimmer h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col text-gray-600">
                    <span>Invoice Id</span>
                    <span className="text-black font-medium">
                      {invoice?.invoiceNumber || ""}
                    </span>
                  </div>
                  <div className="flex flex-col text-gray-600">
                    <span>Payment Service</span>
                    <span className="text-black font-medium">
                      {invoice?.type
                        ? invoice?.type.charAt(0).toUpperCase() +
                          invoice?.type.slice(1)
                        : ""}
                    </span>
                  </div>
                  <div className="flex flex-col text-gray-600">
                    <span>Total Amount</span>
                    <span className="text-black font-medium">
                      $ {invoice?.amount?.paid || 0}
                    </span>
                  </div>
                  <div className="flex flex-col text-gray-600">
                    <span>Status</span>
                    <span className="text-black font-medium">
                      {invoice?.status
                        ? invoice?.status.charAt(0).toUpperCase() +
                          invoice?.status.slice(1)
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
};

export default InvoiceKanban;
