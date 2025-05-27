import React from 'react'
import { motion } from 'framer-motion';
import { Eye, Pencil, Mail, Phone, Briefcase, Linkedin, Badge, Info } from 'lucide-react';
import maleImage from "../../Images/man.png";
import femaleImage from "../../Images/woman.png";
import genderlessImage from "../../Images/transgender.png";
import { useNavigate } from "react-router-dom";


const InvocieKanban = ({ currentFilteredRows, handleUserClick, handleEditClick, loading,  toggleSidebar }) => {
 
  const navigate = useNavigate();
    return (
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-200px)]"
    >
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  overflow-y-auto">
        {loading ? (
          <div className="col-span-full py-10 text-center">
            <div className="wrapper12">
              <div className="circle12"></div>
              <div className="circle12"></div>
              <div className="circle12"></div>
              <div className="shadow12"></div>
              <div className="shadow12"></div>
              <div className="shadow12"></div>
            </div>
          </div>
        ) : currentFilteredRows.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <div className="flex flex-col items-center justify-center p-5">
              {/* <p className="text-9xl rotate-180 text-blue-500">
                <Info />
              </p> */}
              <p className="text-center text-lg font-normal">
                 No Billing Data Found.
              </p>
              {/* <p
                onClick={toggleSidebar}
                className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
              >
                Add Users
              </p> */}
            </div>
          </div>
        ) : currentFilteredRows.length === 0 ? (
          <div className="col-span-full py-10 text-center">
            <p className="text-lg font-normal">
              No data found.
            </p>
          </div>
        ) : (
          currentFilteredRows.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* User card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative">
                
                  </div>
                  <div className="ml-1">
                    <span> Payment Id</span>
                    <h4 className="text-sm font-medium text-gray-900">{invoice?.paymentId || ""} </h4>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      navigate(`details/${invoice.id}`, { state: { invoiceData: invoice } });
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {/* <button
                    onClick={() => {
                      navigate(`edit/${invoice._id}`, { state: { userData: invoice } });
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button> */}
                </div>
              </div>

              {/* Contact information */}
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col   text-gray-600">
                    <span>Invoice Id</span>
                    <span  className='text-black font-medium'>{invoice?.invoiceNumber || ""}</span>
                  </div>
                  <div className="flex flex-col  text-gray-600">
                    <span>Payment Service</span>
                    <span  className='text-black font-medium'>{invoice?.type || ""}</span>
                  </div>
                  <div className="flex flex-col   text-gray-600">
                   <span>Total Amount</span>
                    <span  className='text-black font-medium'>$ {invoice?.amount?.paid || 0}</span>
                  </div>
                   <div className="flex flex-col   text-gray-600">
                   <span>Status</span>
                    <span className='text-black font-medium' >{invoice?.status || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default InvocieKanban