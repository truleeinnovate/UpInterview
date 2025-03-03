import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import { BiSearch } from "react-icons/bi";
import { Tooltip } from 'react-tooltip';

import { IoIosList } from "react-icons/io";
import { AiOutlineEye, AiOutlineEdit } from "react-icons/ai";

import { MdFilterAlt, MdOutlineViewKanban } from "react-icons/md";

import { formatDateTable } from "../../../utils/apicalls";
import ReceiptView from "./ReceiptView";



const ReceiptTable = () => {
  const [invoices, setinvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [showForm, setShowForm] = useState(false);
  const [showInvoiceView,setShowInvoiceForm] = useState(false);
  
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [record,setRecord] = useState(null);
  
 

  const recordsPerPage = 10;

  useEffect(() => {
    handleInvoices();
  }, []);


  const filteredinvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (!searchTerm) return true;

      return (
        invoice.status?.toLowerCase().includes(searchTerm.toLowerCase())
       
      );
    });
  }, [invoices, searchTerm]);

  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return filteredinvoices.slice(start, end);
  }, [filteredinvoices, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredinvoices.length / recordsPerPage), [filteredinvoices]);

  const nextPage = () => {
    setCurrentPage((prevPage) => (prevPage < totalPages ? prevPage + 1 : prevPage));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };


  const handleInvoices = async () => {
    try {
        const Invoiceresponse = await axios.get(`${process.env.REACT_APP_API_URL}/all-invoices`);
        const Receiptresponse = await axios.get(`${process.env.REACT_APP_API_URL}/receipts-data`);
        // const subscriptionreponse = await axios.get(`${LOCAL_HOST}/get-CustomerSubscription`)

        const invoicesdata = Invoiceresponse.data.reverse() || [];
        const receiptsdata = Receiptresponse.data.reverse() || [];

        // const CustomerSubscription = subscriptionreponse.data || [];

        if (Array.isArray(invoicesdata) && Array.isArray(receiptsdata)) {
            const invoicesWithReceipts = receiptsdata.map(receipt => {
               
                // const relatedReceipts = receiptsdata.filter(receipt => {
                //     return receipt.invoiceId === invoice.invoiceId;
                // });

                // const relatedSubscriptions = CustomerSubscription.filter(subscriber => {
                //   return  subscriber.invoiceId === invoice.invoiceId;
                // })

                return {
                    ...receipt,
                    // receipts: relatedReceipts,
                    // customer:relatedSubscriptions,
                  
                };
            });

            setinvoices(invoicesWithReceipts);
        } else {
            console.error("Unexpected data format:", { invoicesdata, receiptsdata });
            setinvoices([]);
        }
    } catch (error) {
        console.error("Error fetching invoices:", error);
        setinvoices([]);
    }
};


const handleViewRecord = (record) => {
  setRecord(record);
  setShowInvoiceForm(true); 
}

if ( !record) {
console.log("no data")
}

console.log("data",currentRecords);



  return (
    <div className="p-6 bg-white">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Receipt</h2>
          <button
          onClick={() => setShowForm(true)}
            className="bg-[#217989]  text-[#C7EBF2] px-4 py-2 rounded shadow "
          >
            Add
          </button>
        </div>

        <div className="flex justify-between items-center w-full mb-4 ">
          <div className="flex text-2xl items-center gap-2">
            <button
              onClick={() => setViewMode("card")}

            >
              <MdOutlineViewKanban
                id="kanban-view"
                className={`cursor-pointer focus:outline-none border-none ${viewMode === "table" ? "text-black" : "text-blue-500"}`}
              />
            </button>
            <div className="text-center">
              <Tooltip
                anchorId="kanban-view"
                content="Kanban View"
                place="top"
                className="!text-xs   !bg-black !text-[#C7EBF2]"
              />
            </div>

            <button
              onClick={() => setViewMode("table")}

            >
              <IoIosList
                id="list-view"
                className={`cursor-pointer focus:outline-none  ${viewMode !== "table" ? "text-black" : "text-blue-500"}`}
              />
            </button>
            <Tooltip
              anchorId="list-view"
              content="List View"
              place="top"
              className="!text-xs !bg-black !text-[#C7EBF2]"
            />
          </div>



          <div className="flex items-center gap-4 h-9 " >

            <div className="flex items-center w-52 gap-4 h-8">
              <div className="flex items-center border border-black rounded-lg w-full h-full bg-white">
                <BiSearch className="text-[#217989] text-lg mx-3" />
                <input
                  type="text"
                  className="flex-1  text-xs placeholder-gray-500 focus:outline-none bg-transparent"
                  placeholder="Search position"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

              </div>



            </div>

            <div className="flex items-center h-8 ">

              <span className=" pe-1 text-md">
                {currentPage}-{totalPages}/{totalPages}
              </span>

              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-2  text-lg me-1  bg-gray-300 text-gray-500 rounded "
              >
                &lt;
              </button>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-2 text-lg  bg-gray-300 text-gray-500 rounded"
              >
                &gt;
              </button>
            </div>

            <div
              className=" h-7"
          
            >
              <button className="h-full  px-1 border rounded shadow border-[#217989] "
                onClick={() => setShowFilterCard(!showFilterCard)}
              >
                <MdFilterAlt className="text-2xl text-primary text-[#217989]" />
              </button>
             
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen flex overflow-hidden bg-white">

        <div
          className={`transition-all duration-300 ease-in-out ${showFilterCard ? "w-5/6" : "w-full"
            }  `}
        >

          {viewMode === "table" ?
            (
              <table className="w-full bg-white">
                <thead>
                  <tr className="border-t-2 border-b-2 text-left text-lg border-gray-50 text-[#217989] bg-slate-100">
                    <th className="p-4 font-semibold">Receipt Id</th>
                    <th className="p-4 font-semibold">Tentant Id</th>
                    <th className="p-4 font-semibold">Transaction Id</th>
                    <th  className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Total Amount</th>
                    <th className="p-4 font-semibold">Due Date</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0  ? currentRecords.map((record, index) => (
                    <tr key={index} className="border-t-2 border-b-2 border-gray-200">
                      <td className="p-4 text-[#217989]">  REC-{record._id.slice(0,5) || "N/A"}</td>
                      <td className="p-4">{record?.tenantId || "N/A"}</td>
                      <td className="p-4">{record?.transactionId || "N/A"}</td>
                      <td className="p-4">{record?.status}</td>
                      <td className="p-4">$ {record?.amount || "N/A"}</td>
                      <td className="p-4">{formatDateTable(record?.paymentDate)  || "N/A"}</td>
                      <td className="p-4">
                        <div className="flex justify-start gap-4">
                          <button title="View Details"
                          
                             onClick={() => handleViewRecord(record)}
                          ><AiOutlineEye size={20} /></button>
                         
                        </div>
                      </td>
                    </tr>
                  )) : ( <tr>
                    <td colSpan={7} className="p-4 text-center">
                      No records found
                    </td>
                  </tr>)
                  }
                </tbody>
              </table>
            )
            : (null
            
            )}

        </div>
    
      </div>
      
      {/* <InvoiceForm show={showForm} onClose={() => setShowForm(false)}/> */}

      <ReceiptView show={showInvoiceView && record} record={record} onClose={() => setShowInvoiceForm(false)} />

    </div>
  );
}

export default ReceiptTable