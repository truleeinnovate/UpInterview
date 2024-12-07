import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaList, FaFilter } from "react-icons/fa";
import { TbLayoutGridRemove } from "react-icons/tb";
import { IoMdSearch } from "react-icons/io";
import { CgInfo } from "react-icons/cg";
import { MdMoreHoriz } from "react-icons/md";
import AddPayment from "../Settings-Tab/AddPayment.jsx";
import { IoMdArrowRoundBack } from "react-icons/io";
import PaymentDetails from "./PaymentDetails"; // Import the new component

const Payment = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState("list");
  const [showAddpayment, setShowAddpayment] = useState(false);
  const [actionViewMore, setActionViewMore] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const rowsPerPage = 10;
  const totalPages = 1;

  const payments = [
    {
      paymentID: "PAY001",
      invoiceID: "INV001",
      amountPaid: "$100",
      paymentDate: "2023-01-01",
      paymentMethod: "Credit Card",
      transactionID: "TXN12345",
    },
    {
      paymentID: "PAY002",
      invoiceID: "INV002",
      amountPaid: "$200",
      paymentDate: "2023-01-02",
      paymentMethod: "PayPal",
      transactionID: "TXN12346",
    },
    {
      paymentID: "PAY003",
      invoiceID: "INV003",
      amountPaid: "$300",
      paymentDate: "2023-01-03",
      paymentMethod: "Bank Transfer",
      transactionID: "TXN12347",
    },
  ];

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

  const handleListViewClick = () => {
    setViewMode("list");
  };

  const handleKanbanViewClick = () => {
    setViewMode("kanban");
  };

  const handleAddProfileClick = () => {
    setShowAddpayment(true);
  };

  const handleCloseAddpayment = () => {
    setShowAddpayment(false);
  };

  const toggleAction = (id) => {
    setActionViewMore((prev) => (prev === id ? null : id));
  };

  const handleViewClick = (payment) => {
    setSelectedPayment(payment);
    setActionViewMore(null);
  };

  return (
    <>
      {showAddpayment && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={handleCloseAddpayment}></div>
          <AddPayment onClose={handleCloseAddpayment} />
        </>
      )}
      <div className={`fixed inset-0 ${showAddpayment ? 'w-1/2' : 'w-full'} transition-all duration-300 z-30`}>
        <div className="fixed top-24 left-0 ml-64 right-0">
          <div className="flex justify-between p-4">
            <div className="flex items-center">
              <button onClick={onClose} className="text-2xl">
                <IoMdArrowRoundBack />
              </button>
              <span className="ml-2 text-lg font-semibold">Payment</span>
            </div>
            <div>
              <button className="p-2 text-md font-semibold border shadow rounded-3xl" onClick={handleAddProfileClick}>
                Add Payment
              </button>
            </div>
          </div>
        </div>

        <div className="fixed top-36 left-0 right-0 ml-64">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <FaList
                className={`text-2xl mr-4 ${viewMode === "list" ? "text-blue-500" : ""}`}
                onClick={handleListViewClick}
              />
              <TbLayoutGridRemove
                className={`text-2xl ${viewMode === "kanban" ? "text-blue-500" : ""}`}
                onClick={handleKanbanViewClick}
              />
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
                    placeholder="Search Users"
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
                <span
                  className={`border-2 p-2 mr-2 text-2xl ${currentPage === 0 ? " cursor-not-allowed" : ""}`}
                  onClick={prevPage}
                >
                  <IoIosArrowBack />
                </span>
                <span
                  className={`border-2 p-2 text-2xl ${currentPage === totalPages - 1 ? " cursor-not-allowed" : ""}`}
                  onClick={nextPage}
                >
                  <IoIosArrowForward />
                </span>
              </div>

              <div className="ml-4 text-2xl border-2 rounded-md p-2">
                <FaFilter />
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
                    <th scope="col" className="py-3 px-6">Payment ID</th>
                    <th scope="col" className="py-3 px-6">Invoice ID</th>
                    <th scope="col" className="py-3 px-6">Amount Paid</th>
                    <th scope="col" className="py-3 px-6">Payment Date</th>
                    <th scope="col" className="py-3 px-6">Payment Method</th>
                    <th scope="col" className="py-3 px-6">Transaction ID</th>
                    <th scope="col" className="py-3 px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center p-5">
                          <p className="text-9xl rotate-180 text-blue-500"><CgInfo /></p>
                          <p className="text-center text-lg font-normal">No data available.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.paymentID} className="bg-white border-b cursor-pointer text-xs">
                        <td className="py-2 px-6">{payment.paymentID}</td>
                        <td className="py-2 px-6">{payment.invoiceID}</td>
                        <td className="py-2 px-6">{payment.amountPaid}</td>
                        <td className="py-2 px-6">{payment.paymentDate}</td>
                        <td className="py-2 px-6">{payment.paymentMethod}</td>
                        <td className="py-2 px-6">{payment.transactionID}</td>
                        <td className="py-2 px-6 relative">
                          <button onClick={() => toggleAction(payment.paymentID)}>
                            <MdMoreHoriz className="text-3xl" />
                          </button>
                          {actionViewMore === payment.paymentID && (
                            <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2 popup">
                              <div className="space-y-1">
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3"
                                  onClick={() => handleViewClick(payment)}
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
              {payments.map((payment) => (
                <div key={payment.paymentID} className="bg-white p-4 rounded shadow">
                  <h3 className="text-lg font-semibold">Payment ID: {payment.paymentID}</h3>
                  <p>Invoice ID: {payment.invoiceID}</p>
                  <p>Amount Paid: {payment.amountPaid}</p>
                  <p>Payment Date: {payment.paymentDate}</p>
                  <p>Payment Method: {payment.paymentMethod}</p>
                  <p>Transaction ID: {payment.transactionID}</p>
                  <button className="text-blue-500" onClick={() => handleViewClick(payment)}>View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedPayment && (
        <PaymentDetails payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </>
  );
};

export default Payment;