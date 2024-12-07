import React, { useState } from 'react';
import InvoiceLine from './InvoiceLine'; 
import Payment from '../Settings-Tab/Payment.jsx';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCaretDown, FaCaretUp, FaFileInvoice } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import InvoiceLineDetails from './InvoiceLineDetails';
import PaymentDetails from './PaymentDetails'; 

const InvoiceDetails = ({ onClose }) => {
    const [showInvoiceLines, setShowInvoiceLines] = useState(true);
    const [showPayments, setShowPayments] = useState(true);
    const [viewAll, setViewAll] = useState(false); 
    const [viewAllPayments, setViewAllPayments] = useState(false); 
    const [selectedInvoiceLine, setSelectedInvoiceLine] = useState(null); 
    const [selectedPayment, setSelectedPayment] = useState(null);

    const invoiceLines = [
        { lineId: 'LINE001', invoiceId: 'INV001', quantity: 2, unitPrice: 400.00, description: "Service A", quality: "High" },
        { lineId: 'LINE002', invoiceId: 'INV001', quantity: 3, unitPrice: 600.00, description: "Service B", quality: "Medium" },
       
    ];

    const payments = [
        { lineId: 'LINE002', invoiceId: 'INV001', quantity: 2, unitPrice: 400.00 },
        { lineId: 'LINE001', invoiceId: 'INV003', quantity: 3, unitPrice: 600.00 }
    ];

    const handleBack = () => {
        setViewAll(false);
        setViewAllPayments(false); 
    };

    if (viewAll) {
        return <InvoiceLine onClose={handleBack} />; 
    }

    if (viewAllPayments) {
        return <Payment onClose={handleBack} />;
    }

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center p-4 border-b">
                <button onClick={onClose} className="text-xl flex items-center">
                    <IoMdArrowRoundBack />
                    <span className="ml-2 text-2xl font-bold">Invoice</span>
                </button>
                <div className="flex-1"></div>
            </div>
            {/* Content Box */}
            <div className="p-4 flex-1 overflow-auto flex">
                <div className="border rounded-lg p-6 flex-[0.75] mr-4" style={{ height: '505px' }}>
                    <h2 className="text-lg font-bold mb-4">Details</h2>
                    <hr className="my-2" />
                    <div className="grid grid-cols-4 gap-4 text-md">
                        <div>Invoice ID</div>
                        <div className='text-gray-500'>INV001</div>
                        <div>Currency</div>
                        <div className='text-gray-500'>USD</div>

                        <div>Customer ID</div>
                        <div className='text-gray-500'>CUST123</div>
                        <div>Payment Status</div>
                        <div className='text-gray-500'>partially_paid</div>

                        <div>Invoice Date</div>
                        <div className='text-gray-500'>2024-09-20T10:00:00Z</div>
                        <div>Payment Method</div>
                        <div className='text-gray-500'>credit_card</div>

                        <div>Due Date</div>
                        <div className='text-gray-500'>2024-09-30T10:00:00Z</div>
                        <div>Discount</div>
                        <div className='text-gray-500'>Discount</div>

                        <div>Status</div>
                        <div className='text-gray-500'>issued</div>
                        <div>Notes</div>
                        <div className='text-gray-500'>Payment due by end of the month.</div>

                        <div>Total Amount</div>
                        <div className='text-gray-500'>1100.00</div>
                        <div>Subtotal</div>
                        <div className='text-gray-500'>1000.00</div>

                        <div>Tax Amount</div>
                        <div className='text-gray-500'>100.00</div>
                        <div>Discount</div>
                        <div className='text-gray-500'>50.00</div>
                    </div>
                </div>
                <div className="flex flex-col flex-[0.25]">
                    <div className="border rounded-lg p-2 flex-1 mb-4" style={{ height: '50%' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-bold flex items-center">
                                <FaFileInvoice className="mr-2" />
                                Invoice Lines ({invoiceLines.length})
                            </h2>
                            <button className="text-gray-500" onClick={() => setShowInvoiceLines(!showInvoiceLines)}>
                                {showInvoiceLines ? <FaCaretDown /> : <FaCaretUp />}
                            </button>
                        </div>
                        <hr className="my-1 " />
                        {showInvoiceLines && (
                            <>
                                {invoiceLines.map((line, index) => (
                                    <div key={index} className="border rounded-lg p-1 mb-1 relative">
                                        <div className="grid grid-cols-2 gap-1">
                                            <div>
                                                <div className="text-sm font-semibold">Line ID</div>
                                                <div className='text-xs'>{line.lineId}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Invoice ID</div>
                                                <div className='text-xs'>{line.invoiceId}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Quantity</div>
                                                <div className='text-xs'>{line.quantity}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Unit Price</div>
                                                <div className='text-xs'>{line.unitPrice}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 mt-1 mr-1">
                                            <button className="text-gray-500" onClick={() => setSelectedInvoiceLine(line)}>
                                                <FaCaretDown />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    className="text-sm font-semibold w-full text-center text-blue-500"
                                    onClick={() => setViewAll(true)} // Set viewAll to true
                                >
                                    View all
                                </button>
                            </>
                        )}
                    </div>
                    <div className="border rounded-lg p-2 flex-1 mb-2" style={{ height: '50%' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-bold flex items-center">
                                <MdPayment className=" text-lg mr-2" />
                                Payment ({payments.length})
                            </h2>
                            <button className="text-gray-500" onClick={() => setShowPayments(!showPayments)}>
                                {showPayments ? <FaCaretDown /> : <FaCaretUp />}
                            </button>
                        </div>
                        <hr className="my-1 " />
                        {showPayments && (
                            <>
                                {payments.map((payment, index) => (
                                    <div key={index} className="border rounded-lg p-1 mb-1 relative">
                                        <div className="grid grid-cols-2 gap-1">
                                            <div>
                                                <div className="text-sm font-semibold">Payment ID</div>
                                                <div className='text-xs'>{payment.lineId}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Invoice ID</div>
                                                <div className='text-xs'>{payment.invoiceId}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Quantity</div>
                                                <div className='text-xs'>{payment.quantity}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Unit Price</div>
                                                <div className='text-xs'>{payment.unitPrice}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 mt-1 mr-1">
                                            <button className="text-gray-500" onClick={() => setSelectedPayment(payment)}>
                                                <FaCaretDown />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    className="text-sm font-semibold w-full text-center text-blue-500"
                                    onClick={() => setViewAllPayments(true)} 
                                >
                                    View all
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {selectedInvoiceLine && (
                <InvoiceLineDetails invoice={selectedInvoiceLine} onClose={() => setSelectedInvoiceLine(null)} />
            )}
            {selectedPayment && (
                <PaymentDetails payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
            )}
        </div>



    );
};

export default InvoiceDetails;