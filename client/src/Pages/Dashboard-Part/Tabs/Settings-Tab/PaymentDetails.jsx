import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

const PaymentDetails = ({ payment, onClose }) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg overflow-auto" style={{ width: "97%", height: "94%" }}>
        <div className="border-b p-2">
          <div className="mx-8 my-3 flex justify-between items-center">
            <p className="text-xl">
              <span className="text-orange-500 font-semibold">Payment Details</span> / {payment.paymentID}
            </p>
            <button className="shadow-lg rounded-full" onClick={onClose}>
              <MdOutlineCancel className="text-2xl" />
            </button>
          </div>
        </div>
        <div className="mx-10 pt-5 pb-2">
          <div className="text-xl space-x-10">
            <span className="text-orange-500 font-semibold pb-3 border-b-2 border-orange-500">Details</span>
          </div>
        </div>
        <div className="mx-16 mt-7 grid grid-cols-4">
          <div className="col-span-3">
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Payment ID</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{payment.paymentID}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Invoice ID</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{payment.invoiceID}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Amount Paid</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{payment.amountPaid}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Payment Date</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{payment.paymentDate}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Payment Method</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{payment.paymentMethod}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Transaction ID</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{payment.transactionID}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;