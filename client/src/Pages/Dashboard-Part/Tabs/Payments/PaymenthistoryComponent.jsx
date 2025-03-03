import React, { useMemo, useState,useEffect } from 'react'
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
const PaymenthistoryComponent = () => {
  const [invoiceData, setInvoiceData] = useState([]);
 const ownerId = Cookies.get('userId');
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const Invoice_res = await axios.get(`${process.env.REACT_APP_API_URL}/get-invoice-id/${ownerId}`);
      const Sub_Invoice_data = Invoice_res.data.invoiceData?.reverse() || [];
      setInvoiceData(Sub_Invoice_data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return (invoiceData || []).slice(start, end);
}, [invoiceData, currentPage]);

const totalPages = useMemo(() => Math.ceil((invoiceData || []).length / recordsPerPage), [invoiceData]);
  return (
    <div className="fixed top-24 left-0 ml-64 right-0">
    <div className='flex justify-between'>
      <div className="text-xl font-semibold text-[#217989]">Payment History</div>

      <div className="flex items-center h-8 ">

        <span className=" pe-1 text-md">
          {currentPage}-{totalPages}/{totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          //  onClick={prevPage}
          //  disabled={currentPage === 1}
          className="px-2  text-lg me-1  bg-gray-300 text-gray-500 rounded "
        >
          &lt;
        </button>

        <button

          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          //  onClick={nextPage}
          //  disabled={currentPage === totalPages}
          className="px-2 text-lg  bg-gray-300 text-gray-500 rounded"
        >
          &gt;
        </button>
      </div>
    </div>
    <div className="mt-4 space-y-4">

      <table className="w-full bg-white">
        <thead>
          <tr className="border-t-2 border-b-2 text-left text-lg border-gray-50 text-[#217989] bg-slate-100">
            <th className="p-4 font-semibold">Payment Id</th>
            <th className="p-4 font-semibold">Invoice Id</th>
            <th className="p-4 font-semibold">Payment Service</th>
            <th className="p-4 font-semibold">Total Amount</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">payment Date</th>
            <th className="p-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.length > 0 ? currentRecords.map((record, index) => (
            <tr key={index} className="border-t-2 border-b-2 border-gray-200">
              <td className="p-4 text-[#217989]">{record._id.slice(-5)}</td>
              <td className="p-4"> INV-{record._id.slice(0, 5) || "N/A"}</td>
              <td className="p-4">{record?.type || "N/A"}</td>
              <td className="p-4">{record?.status}</td>
              <td className="p-4">$ {record?.totalAmount || "N/A"}</td>
              <td className="p-4">{formatDateTable(record?.startDate) || "N/A"}</td>
              <td className="p-4 font-semibold text-2xl">
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
  </div>
  )
}

export default PaymenthistoryComponent