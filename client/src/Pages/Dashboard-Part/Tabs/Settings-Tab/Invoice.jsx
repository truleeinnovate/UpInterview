import React, { useState, useRef, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import Sidebar from "./invoice_form.jsx";
import InvoiceDetail from "../Settings-Tab/InvoiceDetails.jsx";

import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState("list");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const rowsPerPage = 10;
  const [selectedInvoice, setSelectedInvoice] = useState(null); 

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = [
        {
          id: "0003",
          customerId: "nll1315",
          date: "12/10/2024",
          status: "Complete",
          amount: 2000,
          paymentStatus: "In progress",
          invoiceLines: [
            { lineId: 'LINE002', invoiceId: 'INV001', quantity: 2, unitPrice: 400.00 },
            { lineId: 'LINE001', invoiceId: 'INV003', quantity: 3, unitPrice: 600.00 },
          ],
          payments: [
            { lineId: 'LINE002', invoiceId: 'INV001', quantity: 2, unitPrice: 400.00 },
            { lineId: 'LINE001', invoiceId: 'INV003', quantity: 3, unitPrice: 600.00 },
          ],
        },
        // Add more mock data as needed
      ];
      setInvoices(data);
    };
    fetchInvoices();
  }, []);

  const [tableVisible] = useState(true);

  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const [candidateData, setCandidateData] = useState([]);
  const [activeArrow, setActiveArrow] = useState(null);
  const [actionViewMore, setActionViewMore] = useState({});

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const totalPages = Math.ceil(invoices.length / rowsPerPage);
  const currentFilteredRows = invoices.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleViewClick = (invoice) => { 
    setSelectedInvoice(invoice);
    setActionViewMore(null);
  };

  const closeInvoiceDetail = () => { 
    setSelectedInvoice(null);
  };

  return (
    <>
      <div>
        {!selectedInvoice && ( 
          <div className="fixed top-24 left-0 ml-64 right-0">
            <div className="flex justify-between p-4">
              <div>
                <span className="text-lg font-semibold">Invoice</span>
              </div>

              <div onClick={toggleSidebar} className="mr-6">
                <span className="p-2 text-md font-semibold border shadow rounded-3xl">
                  Add Invoice
                </span>
              </div>
            </div>
            <div className="fixed top-36 left-0 right-0 ml-64">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                    <span onClick={handleListViewClick}>
                      <FaList
                        className={`text-2xl mr-4 ${
                          viewMode === "list" ? "text-blue-500" : ""
                        }`}
                      />
                    </span>
                  </Tooltip>
                  <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                    <span onClick={handleKanbanViewClick}>
                      <TbLayoutGridRemove
                        className={`text-2xl ${
                          viewMode === "kanban" ? "text-blue-500" : ""
                        }`}
                      />
                    </span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <div className="relative">
                    <div className="searchintabs mr-5 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center">
                        <button type="submit" className="p-2">
                          <IoMdSearch />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Search by Candidate, Email, Phone."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="pl-10 pr-12"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="p-2 text-xl mr-2">
                      {currentPage + 1}/{totalPages}
                    </span>
                  </div>
                  <div className="flex">
                    <Tooltip
                      title="Previous"
                      enterDelay={300}
                      leaveDelay={100}
                      arrow
                    >
                      <span
                        className={`border-2 p-2 mr-2 text-2xl ${
                          currentPage === 0 ? " cursor-not-allowed" : ""
                        } ${activeArrow === "prev" ? "text-blue-500" : ""}`}
                        onClick={prevPage}
                      >
                        <IoIosArrowBack />
                      </span>
                    </Tooltip>

                    <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                      <span
                        className={`border-2 p-2 text-2xl ${
                          currentPage === totalPages - 1
                            ? " cursor-not-allowed"
                            : ""
                        } ${activeArrow === "next" ? "text-blue-500" : ""}`}
                        onClick={nextPage}
                      >
                        <IoIosArrowForward />
                      </span>
                    </Tooltip>
                  </div>

                  <div className="ml-4 text-2xl border-2 rounded-md p-2">
                    <Tooltip
                      title="Filter"
                      enterDelay={300}
                      leaveDelay={100}
                      arrow
                    >
                      <span
                        onClick={invoices.length === 0 ? null : toggleMenu}
                        style={{
                          opacity: invoices.length === 0 ? 0.2 : 1,
                          pointerEvents:
                          invoices.length === 0 ? "none" : "auto",
                        }}
                      >
                        <FiFilter
                          className={`${isMenuOpen ? "text-blue-500" : ""}`}
                        />
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed left-0 right-0 ml-64 mx-auto top-56 z-10">
              {viewMode === "list" ? (
                <div className="overflow-y-auto min-h-80 max-h-96">
                  <table className="text-left w-full border-collapse border-gray-300 mb-14">
                    <thead className="bg-gray-300 sticky top-0 z-10 text-xs">
                      <tr>
                        <th scope="col" className="py-3 px-6">
                          Invoice ID
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Customer ID
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Invoice Date
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Status
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Total Amount
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Payment Status
                        </th>
                        <th scope="col" className="py-3 px-6">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentFilteredRows.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-10 text-center">
                            <p className="text-lg font-normal">No data found.</p>
                          </td>
                        </tr>
                      ) : (
                        currentFilteredRows.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className="bg-white border-b cursor-pointer text-xs"
                          >
                            <td className="py-2 px-6">{invoice.id}</td>
                            <td className="py-2 px-6">{invoice.customerId}</td>
                            <td className="py-2 px-6">{invoice.date}</td>
                            <td className="py-2 px-6">{invoice.status}</td>
                            <td className="py-2 px-6">{invoice.amount}</td>
                            <td className="py-2 px-6">{invoice.paymentStatus}</td>
                            <td className="py-2 px-6 relative">
                              <button onClick={() => toggleAction(invoice.id)}>
                                <FiMoreHorizontal className="text-3xl" />
                              </button>
                              {actionViewMore === invoice.id && (
                                <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                                  <div className="space-y-1">
                                    <p
                                      className="hover:bg-gray-200 p-1 rounded pl-3"
                                      onClick={() => handleViewClick(invoice)}
                                    >
                                      View
                                    </p>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {currentFilteredRows.map((invoice) => (
                    <div key={invoice.id} className="bg-white border p-4 rounded">
                      <h3 className="font-bold">{invoice.id}</h3>
                      <p>Customer ID: {invoice.customerId}</p>
                      <p>Date: {invoice.date}</p>
                      <p>Status: {invoice.status}</p>
                      <p>Amount: {invoice.amount}</p>
                      <p>Payment Status: {invoice.paymentStatus}</p>
                      <button className="text-blue-500">View</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {sidebarOpen && (
        <>
          <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
            <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
              {/* <Sidebar
                onClose={closeSidebar}
                // onOutsideClick={handleOutsideClick}
                ref={sidebarRef}
              /> */}
            </div>
          </div>
        </>
      )}
      {/* {selectedInvoice && (
        <InvoiceDetail invoice={selectedInvoice} onClose={closeInvoiceDetail} />
      )} */}
    </>
  );
};

export default Invoice;
