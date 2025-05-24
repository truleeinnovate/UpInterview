import { useEffect, useState } from 'react'
import { CreditCardIcon } from '@heroicons/react/24/outline'

import { ViewDetailsButton, EditButton } from '../../common/Buttons'
import { InvoicePopup } from './InvoicePopup'
import { PaymentMethodPopup } from './PaymentMethodPopup'
import { paymentMethods } from '../../mockData/billingData'
// import { invoices } from '../mockData/invoiceData'

import axios from 'axios';
import Cookies from 'js-cookie';
export  const formatDateTable = (date) => {
  if (!date) return "N/A";
  const formattedDate = new Date(date);

  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = formattedDate.toLocaleString("en-US", { month: "short" });
  const year = formattedDate.getFullYear();
  return `${day} ${month} ${year}`;
};


const BillingDetails = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null)
  const [viewingPaymentMethod, setViewingPaymentMethod] = useState(null)
  const [billingHistory,setBillingHistory] = useState([])

   const ownerId = Cookies.get('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Invoice_res = await axios.get(`${process.env.REACT_APP_API_URL}/get-invoice-id/${ownerId}`);
        const Sub_Invoice_data = Invoice_res.data.invoiceData?.reverse() || [];
        setBillingHistory(Sub_Invoice_data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [ownerId]);

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing</h2>
        <EditButton 
          onClick={() => alert('Edit billing settings')} 
          className="bg-gray-100 rounded-lg"
        />
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment Methods</h3>
          <button className="text-blue-600 hover:text-blue-800">
            + Add Payment Method
          </button>
        </div>
        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between border p-4 rounded-lg">
              <div className="flex items-center">
                <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">•••• {method.last4}</p>
                  <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {method.isDefault && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Default
                  </span>
                )}
                <ViewDetailsButton onClick={() => setViewingPaymentMethod(method)} />
                <EditButton onClick={() => setEditingPaymentMethod(method)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Billing History</h3>
          <button className="text-blue-600 hover:text-blue-800">
            Download All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
              <th className="text-left py-3">Payment Id</th>
            <th className="text-left py-3">Invoice Id</th>
            <th className="text-left py-3">Payment Service</th>
            <th className="text-left py-3">Total Amount</th>
            <th className="text-left py-3">Status</th>
            <th className="text-left py-3">payment Date</th>
            <th className="text-left py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.length > 0 ?
               billingHistory.map(bill => (
                <tr key={bill.id} className="border-b">
                  <td className="p-4 text-[#217989]">{bill._id.slice(-5)}</td>
                                <td className="py-3"> INV-{bill._id.slice(0, 5) || "N/A"}</td>
                                <td className="py-3">{bill?.type || "N/A"}</td>
                                <td className="py-3">{bill?.status}</td>
                                <td className="py-3">$ {bill?.totalAmount || "N/A"}</td>
                                <td className="py-3">{formatDateTable(bill?.startDate) || "N/A"}</td>
                                <td className="py-3 font-semibold text-2xl">
                                  ....
                                </td>


                  {/* <td className="py-3">{bill.date}</td>
                  <td className="py-3">{bill.invoice}</td>
                  <td className="text-right py-3">${bill.amount.toFixed(2)}</td>
                  <td className="text-right py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="text-right py-3">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          const invoice = invoices.find(inv => inv.id === bill.invoice.replace('#', ''))
                          setSelectedInvoice(invoice)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Invoice
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Download
                      </button>
                    </div>
                  </td> */}
                </tr> 
                 )) : (<tr>
            <td colSpan={7} className="p-4 text-center">
              No records found
            </td>
          </tr>)
             }
            </tbody>
          </table>
        </div>
      </div>

      {editingPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Edit Payment Method</h3>
            {/* Add payment method edit form here */}
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setEditingPaymentMethod(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Payment method updated')
                  setEditingPaymentMethod(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Popup */}
      {selectedInvoice && (
        <InvoicePopup
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Payment Method Details Popup */}
      {viewingPaymentMethod && (
        <PaymentMethodPopup
          paymentMethod={viewingPaymentMethod}
          onClose={() => setViewingPaymentMethod(null)}
        />
      )}
    </div>
  )
}

export default BillingDetails