import React from "react";
import { MdOutlineClose } from "react-icons/md";

const Payment = ({ onClose, handleChange }) => {
  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-white z-50 flex flex-col"> 
      {/* Header */}
      <div className="bg-white border-b z-10">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-bold">Payment</h2>
          <button onClick={onClose} className="focus:outline-none">
            <MdOutlineClose className="text-xl" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <form>
          {/* Invoice ID */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="InvoiceID"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Invoice ID <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="InvoiceID"
                id="InvoiceID"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
              />
            </div>
          </div>

          {/* Amount Paid */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="AmountPaid"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Amount Paid <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="AmountPaid"
                id="AmountPaid"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
              />
            </div>
          </div>

          {/* Payment Date */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="PaymentDate"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Payment Date <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="PaymentDate"
                id="PaymentDate"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="PaymentMethod"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Payment Method <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="PaymentMethod"
                id="PaymentMethod"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
              />
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="TransactionID"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Transaction ID <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="TransactionID"
                id="TransactionID"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-full border-gray-300 focus:border-black"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="bg-white border-t p-4 flex justify-end z-10">
        <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Save</button>
      </div>
    </div>
  );
};

export default Payment;