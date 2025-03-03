import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import { BiSearch } from "react-icons/bi";
import { Tooltip } from 'react-tooltip';

import { IoIosList } from "react-icons/io";
import { AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { MdFilterAlt, MdOutlineViewKanban } from "react-icons/md";

import LOCAL_HOST, { formatDateTable } from "../../../utils/apicalls";


const PaymentTable = () => {

  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [showFilterCard, setShowFilterCard] = useState(false);
 


  const navigate = useNavigate();

  const recordsPerPage = 10;

  useEffect(() => {
    handlePayments();
  }, []);


  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (!searchTerm) return true;

      return (
        payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) 
      );
    });
  }, [payments, searchTerm]);

  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredPayments.length / recordsPerPage), [filteredPayments]);

  const nextPage = () => {
    setCurrentPage((prevPage) => (prevPage < totalPages ? prevPage + 1 : prevPage));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };


  // const handlepayments = async () => {
  //   try {
  //     const response = await axios.get(`${LOCAL_HOST}/all-payments`);
  //     const payments = response.data || [];
  //     const rev_data = payments;
  //     setPayments(rev_data);
    
  //   } catch (error) {
  //     console.error("Error fetching payments:", error);
  //     // alert("Failed to fetch payments. Please try again later.");
  //     setPayments([]);
      
  //   }
  // };


  const handlePayments = async () => {
    try {
      const response = await axios.get(`${LOCAL_HOST}/all-payments`);
      const paymentsData = response.data || [];
      console.log(paymentsData)
      setPayments(paymentsData);
      if (response.length === 0){
        alert("Payments not available.")
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      if (error.response && error.response.status === 404) {
        alert("Payments not found, please check the server endpoint.");
      } else {
        alert("An error occurred while fetching the payments.");
      }
      setPayments([]);
    }
  };


  return (
    <div className="p-6 bg-white">
      <div className="">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payments</h2>
          <button
            onClick={() => navigate('/payment-form')}
            className="bg-[#217989]  text-[#C7EBF2] px-4 py-2 rounded shadow "
          >
            Add
          </button>
        </div>

        <div className="flex justify-between items-center w-full mb-4 ms-4">
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
                  <tr className="border-t-2 border-b-2 text-lg text-left border-gray-50 text-[#217989] bg-slate-100">
                    <th className="p-4 font-semibold">Transaction ID</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Payment Method</th>
                    <th className="p-4 font-semibold">Payment Status</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr key={index} className="border-t-2 border-b-2 border-gray-200">
                      <td className="p-4 text-[#217989]">{record.transactionId}</td>
                      <td className="p-4">{formatDateTable(record.dateOfPayment)}</td>
                      <td className="p-4">{record.amountToAdd}</td>
                      <td className="p-4">{record.paymentMethod || "N/A"}</td>
                      <td className="p-4">{record.status || "N/A"}</td>
                      <td className="p-4">
                        <div className="flex justify-start gap-4">
                          <button title="View Details"><AiOutlineEye size={20} /></button>
                         
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
            : (null
            
            )}

        </div>
    
      </div>

    </div>
  );
}

export default PaymentTable