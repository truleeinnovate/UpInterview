import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import InvoiceLineDetails from "./InvoiceLineDetails.jsx";

import { ReactComponent as IoIosArrowBack } from '../../../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../../../icons/IoIosArrowForward.svg';
import { ReactComponent as FaList } from '../../../../icons/FaList.svg';
import { ReactComponent as IoMdSearch } from '../../../../icons/IoMdSearch.svg';
import { ReactComponent as FiFilter } from '../../../../icons/FiFilter.svg';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { ReactComponent as IoArrowBack } from '../../../../icons/IoArrowBack.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../../../icons/TbLayoutGridRemove.svg';

const InvoiceLine = ({ onClose }) => {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState("list");
  const [actionViewMore, setActionViewMore] = useState({});
  const [isMenuOpen, setMenuOpen] = useState(false);
  const rowsPerPage = 10;
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = [
        {
          lineID: "LINE001",
          invoiceID: "INV001",
          description: "Service A",
          quality: "2",
          unitprice: "400.00",
          linetotal: "800.00",
          taxrate: "10.00%",
          taxamount: "80.00",
        },
        {
          lineID: "LINE002",
          invoiceID: "INV001",
          description: "Service B",
          quality: "3",
          unitprice: "600.00",
          linetotal: "1800.00",
          taxrate: "10.00%",
          taxamount: "180.00",
        },
        {
          lineID: "LINE003",
          invoiceID: "INV002",
          description: "Service C",
          quality: "1",
          unitprice: "300.00",
          linetotal: "300.00",
          taxrate: "5.00%",
          taxamount: "15.00",
        },
       
      ];
      setInvoices(data);
    };
    fetchInvoices();
  }, []);

  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
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

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const handleViewClick = (invoice) => {
    setSelectedInvoice(invoice);
    setActionViewMore(null);
  };

  return (
    <div>
      <div className="fixed top-24 left-0 ml-64 right-0">

        <div>
          <div className="flex justify-between p-4">
            <div className="flex items-center">
              <button onClick={onClose} className="text-2xl">
                <IoArrowBack />
              </button>
              <span className="ml-2 text-lg font-semibold">Invoice Line</span>
            </div>
          </div>
        </div>




        <div className="fixed top-36 left-0 right-0 ml-64">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                <span onClick={handleListViewClick}>
                  <FaList
                    className={`text-2xl mr-4 ${viewMode === "list" ? "text-blue-500" : ""
                      }`}
                  />
                </span>
              </Tooltip>
              <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                <span onClick={handleKanbanViewClick}>
                  <TbLayoutGridRemove
                    className={`text-2xl ${viewMode === "kanban" ? "text-blue-500" : ""
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
                    className={`border-2 p-2 mr-2 text-2xl ${currentPage === 0 ? " cursor-not-allowed" : ""
                      }`}
                    onClick={prevPage}
                  >
                    <IoIosArrowBack />
                  </span>
                </Tooltip>

                <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    className={`border-2 p-2 text-2xl ${currentPage === totalPages - 1
                      ? " cursor-not-allowed"
                      : ""
                      }`}
                    onClick={nextPage}
                  >
                    <IoIosArrowForward />
                  </span>
                </Tooltip>
              </div>

              <div className="ml-4 text-2xl border-2 rounded-md p-2">
                <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                  <span
                    onClick={invoices.length === 0 ? null : toggleMenu}
                    style={{
                      opacity: invoices.length === 0 ? 0.2 : 1,
                      pointerEvents: invoices.length === 0 ? "none" : "auto",
                    }}
                  >
                    <FiFilter className={`${isMenuOpen ? "text-blue-500" : ""}`} />
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
                      Line ID
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Invoice ID
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Description
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Quality
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Unit Price
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Line Total
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Tax Rate
                    </th>
                    <th scope="col" className="py-3 px-6">
                      Tax Amount
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
                    currentFilteredRows.map((invoiceline) => (
                      <tr
                        key={invoiceline.id}
                        className="bg-white border-b cursor-pointer text-xs"
                      >
                        <td className="py-2 px-6">{invoiceline.lineID}</td>
                        <td className="py-2 px-6">{invoiceline.invoiceID}</td>
                        <td className="py-2 px-6">{invoiceline.description}</td>
                        <td className="py-2 px-6">{invoiceline.quality}</td>
                        <td className="py-2 px-6">{invoiceline.unitprice}</td>
                        <td className="py-2 px-6">{invoiceline.linetotal}</td>
                        <td className="py-2 px-6">{invoiceline.taxrate}</td>
                        <td className="py-2 px-6">{invoiceline.taxamount}</td>
                        <td className="py-2 px-6 relative">
                          <button onClick={() => toggleAction(invoiceline.lineID)}>
                            <FiMoreHorizontal className="text-3xl" />
                          </button>
                          {actionViewMore === invoiceline.lineID && (
                            <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                              <div className="space-y-1">
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3"
                                  onClick={() => handleViewClick(invoiceline)}
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
      {/* {selectedInvoice && (
        <InvoiceLineDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )} */}
    </div>
  );
};

export default InvoiceLine;