import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

const InvoiceLineDetails = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg overflow-auto" style={{ width: "97%", height: "94%" }}>
        <div className="border-b p-2">
          <div className="mx-8 my-3 flex justify-between items-center">
            <p className="text-xl">
              <span className="text-orange-500 font-semibold">Invoice Details</span> / {invoice.lineID}
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
                <div className="font-medium">Line ID</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.lineID}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Invoice ID</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.invoiceID}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Description</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.description}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Quality</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.quality}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Unit Price</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.unitprice}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Line Total</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.linetotal}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Tax Rate</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.taxrate}</span>
                </p>
              </div>
            </div>
            <div className="flex mb-5">
              <div className="w-1/3">
                <div className="font-medium">Tax Amount</div>
              </div>
              <div className="w-1/3">
                <p>
                  <span className="font-normal text-gray-500">{invoice.taxamount}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceLineDetails;