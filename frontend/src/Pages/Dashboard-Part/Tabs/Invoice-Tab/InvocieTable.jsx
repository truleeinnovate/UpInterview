// v1.0.0 - Ashok - commented man.png, woman.png, transgender.png
import React from 'react'
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { MoreHorizontal, Info } from 'lucide-react';
// v1.0.0 <-----------------------------------------------------
// import maleImage from "../../Images/man.png";
// import femaleImage from "../../Images/woman.png";
// import genderlessImage from "../../Images/transgender.png";
// v1.0.0 ----------------------------------------------------->
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const InvocieTable = ({ currentFilteredRows, toggleAction, actionViewMore, handleUserClick, handleEditClick, loading, userData, toggleSidebar }) => {
     const navigate = useNavigate();

    //  if (currentFilteredRows?.length <= 0 ) {
    //     return (
    //     <div className='flex w-full h-10 justify-center items-center'>
    //                 <p className='text-center '>No Billing Data Found</p>
    //               </div>
    //     )
    //  }
  return (
       <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Id
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Id
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Service
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                    </th>
                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     payment Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">

                     {currentFilteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                    No Billing Data Found.
                    </td>
                  </tr>

                   ) :(
                 
              
                  currentFilteredRows?.length > 0 ? currentFilteredRows.sort((a, b) => {
                    const dateA = a.updatedAt ? new Date(a.updatedAt ) : new Date(0);
                    const dateB = b.updatedAt  ? new Date(b.updatedAt ) : new Date(0);
                    return dateB - dateA; // For descending order (newest first)
                }).map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                              {invoice?.paymentId || ''}                        
                          
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {invoice?.invoiceNumber || ""}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {invoice?.type || ""}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                       $ {invoice?.amount?.paid || 0}
                      </td>

                      {/* status */}
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {invoice?.status || ""}
                      </td>

                       {/* Created Date */}
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        {format(invoice.updatedAt, 'MMM dd, yyyy')}
                      </td>


                      
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button onClick={() => toggleAction(invoice._id)}>
                            <MoreHorizontal className="text-3xl" />
                          </button>
                          {actionViewMore === invoice.id && (
                            <div className="absolute z-10 w-36 rounded-md shadow-lg bg-white ring-1 p-4 ring-black ring-opacity-5 right-2">
                              <div className="space-y-1">
                                <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                  onClick={() => {
                                    // handleUserClick(invoice);
                                    navigate(`details/${invoice.id}`, { state: { invoiceData: invoice } });
                                  }}
                                >
                                  View
                                </p>
                                {/* <p
                                  className="hover:bg-gray-200 p-1 rounded pl-3 cursor-pointer"
                                  onClick={() => {
                                    // handleEditClick(invoice);
                                    navigate(`edit/${invoice._id}`, { state: { userData: invoice } });
                                  }}
                                >
                                  Edit
                                </p> */}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ) ) :
                   null
                  )}
                 
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default InvocieTable