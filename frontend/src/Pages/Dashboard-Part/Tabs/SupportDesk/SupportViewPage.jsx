/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { FaExternalLinkAlt, FaEdit, FaTicketAlt, FaUser, FaBuilding, FaCalendarAlt, FaTag, FaFileAlt } from "react-icons/fa";
import { Minimize, Expand, X } from 'lucide-react';
import { format, parseISO, isValid } from "date-fns";
//import SupportForm from "./SupportForm";

//const validReopenStatus = ["resolved", "cancel"];

const SupportViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketData = location.state?.ticketData;
  console.log("lastModifiedBy:",ticketData.updatedByUserId)
  const [isFullScreen, setIsFullScreen] = useState(false);
  //const [openForm, setOpenForm] = useState(false);

  console.log("ticketData",ticketData);

  useEffect(() => {
    document.title = "Support Ticket Details";
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM dd, yyyy") : "N/A";
  }, []);

  // const reopenStatus = validReopenStatus.includes(ticketData?.status?.toLowerCase());

  // const toggleForm = useCallback(() => {
  //   setOpenForm(prev => !prev);
  // }, []);

  // if (!ticketData) {
  //   navigate('/support-desk');
  //   return null;
  // }

  const content = (
    <div className={`${isFullScreen ? 'min-h-screen' : 'h-full'} flex flex-col`}>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-custom-blue">Support Ticket Details</h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={() => { navigate(`/support-desk/edit-ticket/${ticketData._id}`, { state: { ticketData: ticketData } }) }}
              className="p-2 hover:text-custom-blue rounded-full transition-colors"
              title="Edit Ticket"
            >
              <FaEdit className="w-5 h-5" />
            </button> */}
  

               <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 flex items-center justify-center bg-custom-blue/10 text-custom-blue rounded-full">
              <FaTicketAlt className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{ticketData.ticketCode}</h3>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full mt-2 ${ticketData.status === "Open" ? "bg-green-100 text-green-800" :
              ticketData.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                ticketData.status === "Resolved" ? "bg-gray-100 text-gray-800" :
                  "bg-red-100 text-red-800"
            }`}>
            {ticketData.status}
          </span>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Ticket Information</h4>
            {/* {reopenStatus && (
              <button
                onClick={toggleForm}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 text-sm font-medium"
              >
                Reopen
              </button>
            )} */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 col-span-1">
              <div className="p-2 bg-custom-bg rounded-lg">
                <FaTag className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Type</p>
                <p className="text-gray-700">{ticketData.issueType || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-1">
              <div className="p-2 bg-custom-bg rounded-lg">
                <FaUser className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-gray-700">{ticketData.contact || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 col-span-1">
              <div className="p-2 bg-custom-bg rounded-lg">
                <FaBuilding className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Organization</p>
                <p className="text-gray-700">{ticketData.organization || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Description</h4>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-custom-bg rounded-lg mt-1">
              <FaFileAlt className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 whitespace-pre-wrap">{ticketData.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        {ticketData.resolution && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Resolution</h4>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-custom-bg rounded-lg mt-1">
                <FaFileAlt className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 whitespace-pre-wrap">{ticketData.resolution}</p>
              </div>
            </div>
          </div>
        )}

        {ticketData.fileName && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h4>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <FaFileAlt className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-700">{ticketData.fileName}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">System Information</h4>
          <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <FaUser className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="text-gray-700">{ticketData.contact || 'Unknown'}, {formatDate(ticketData.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <FaUser className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Modified By</p>
                <p className="text-gray-700">{ticketData?.statusHistory?.[0]?.user || 'Unknown'}, {formatDate(ticketData.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`${isFullScreen ? 'fixed inset-0' : 'fixed inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2'} bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden`}>
        <div className="relative w-full max-w-4xl max-h-full overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow">
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-end">
              <div className={`bg-white shadow-lg overflow-auto ${isFullScreen ? 'w-full h-full' : 'w-[50%] h-[100%] sm:w-[100%] sm:h-[100%]'}`}>
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {openForm && (
        <SupportForm
          getTickets={() => {}}
        />
      )} */}
    </>
  );
};

export default SupportViewPage;
