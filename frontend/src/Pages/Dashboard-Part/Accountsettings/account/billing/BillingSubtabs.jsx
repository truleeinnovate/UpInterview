import React, { useEffect, useMemo, useState } from 'react'

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import InvoiceTab from './Invoice/InvoiceTab';

import axios from 'axios';
import Cookies from "js-cookie";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';


import { EditButton } from '../../common/Buttons';
import InvoiceTab from '../../../Tabs/Invoice-Tab/Invoice';

 


const BillingSubtabs = () => {
    const location = useLocation();
      const navigate = useNavigate();


        const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null)
  const [viewingPaymentMethod, setViewingPaymentMethod] = useState(null)
  const [billingHistory,setBillingHistory] = useState([])



       const authToken = Cookies.get("authToken");
       const tokenPayload = decodeJwt(authToken);
       const ownerId = tokenPayload.userId;
       const orgId = tokenPayload.tenantId;
       const organization = tokenPayload.organization;

       const formatDateTable = (date) => {
  if (!date) return "N/A";
  const formattedDate = new Date(date);

  const day = formattedDate.getDate().toString().padStart(2, '0');
  const month = formattedDate.toLocaleString("en-US", { month: "short" });
  const year = formattedDate.getFullYear();
  return `${day} ${month} ${year}`;
};

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
      
    //   const {contacts} = useCustomContext();
      // const subtab = location.pathname.split('/').pop();
    
    //   const authToken = Cookies.get("authToken");
    //   const tokenPayload = decodeJwt(authToken);
    
    //   const userId = tokenPayload.userId;
    

    
    
    
      
  return (
        <>
            {/* <div className="flex space-y-6 justify-between items-center mb-3">
              <h2 className="text-2xl font-bold">Billing</h2>
              <EditButton 
                onClick={() => alert('Edit billing settings')} 
                className="bg-gray-100 rounded-lg"
              />
            </div> */}

            <InvoiceTab />
      
         
      
            {/* Billing History */}
            {/* <div className="bg-white p-6 rounded-lg shadow">
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
            </div> */}
      
            {/* {editingPaymentMethod && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                  <h3 className="text-lg font-medium mb-4">Edit Payment Method</h3>
                
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
            )} */}
      
            {/* Invoice Popup */}
            {/* {selectedInvoice && (
              <InvoicePopup
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
              />
            )} */}
      
            {/* Payment Method Details Popup */}
            {/* {viewingPaymentMethod && (
              <PaymentMethodPopup
                paymentMethod={viewingPaymentMethod}
                onClose={() => setViewingPaymentMethod(null)}
              />
            )} */}
          </>
  )
}

export default BillingSubtabs