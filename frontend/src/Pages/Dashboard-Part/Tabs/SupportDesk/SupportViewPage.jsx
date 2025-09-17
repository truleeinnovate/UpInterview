// v1.0.0 - Ashok - disabled outer scrollbar using custom hook
// v1.0.1 - Venkatesh - ticket code and status in align center
// v1.0.2 - Ashraf - Added subject field
// v1.0.3 - Ashok  - Fixed responsive issues
// v1.0.4 - Ashok  - Fixed issues

/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { MdOutlineCancel } from "react-icons/md";
// import { IoArrowBack } from "react-icons/io5";

import {
  // FaExternalLinkAlt,
  // FaEdit,
  FaTicketAlt,
  FaUser,
  FaBuilding,
  // FaCalendarAlt,
  FaTag,
  FaFileAlt,
  FaHistory,
  FaInfoCircle,
} from "react-icons/fa";
import { Minimize, Expand, X, Eye } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
// v1.0.0 <-------------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
import Activity from "../CommonCode-AllTabs/Activity";
// v1.0.0 ------------------------------------------------------------------------->
//import SupportForm from "./SupportForm";

//const validReopenStatus = ["resolved", "cancel"];
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
const SupportViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketData = location.state?.ticketData;
  console.log("lastModifiedBy:", ticketData.updatedByUserId);
  const [isFullScreen, setIsFullScreen] = useState(false);
  //const [openForm, setOpenForm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  console.log("ticketData", ticketData);

  useEffect(() => {
    document.title = "Support Ticket Details";
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // v1.0.0 <-------------------------------------------------------------------------
  useScrollLock(true);
  // v1.0.0 ------------------------------------------------------------------------->

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
    <div
    // className={`${isFullScreen ? "min-h-screen" : "h-full"} flex flex-col`}
    >
      {/* <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-custom-blue">
              Support Ticket Details
            </h2>
          </div>
       
       
 
        <div className="flex items-center space-x-2">
          
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
  */}
      {/* Subtabs Navigation */}
      <div className="flex items-center ">
        <div className="flex border-b border-gray-200 ">
          <button
            className={`py-3 px-4 font-medium flex items-center gap-2 ${
              activeTab === "details"
                ? "text-custom-blue border-b-2 border-custom-blue"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            <FaInfoCircle className="w-4 h-4" />
            Details
          </button>
          <button
            className={`py-3 px-4 font-medium flex items-center gap-2 ${
              activeTab === "activity"
                ? "text-custom-blue border-b-2 border-custom-blue"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            <FaHistory className="w-4 h-4" />
            Activity
          </button>
        </div>
      </div>

      {/* <-------v1.0.1--------------Ticket Code and Status */}
      {/* Tab Content */}
      {activeTab === "details" ? (
        <div className="sm:px-0 p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center p-3 justify-center bg-custom-blue/10 text-custom-blue rounded-full">
              <FaTicketAlt className="w-8 h-8" />
            </div>
            <div className="items-center text-center">
              {/* v1.0.4 <---------------------------------------------------------------- */}
              <h3 className="sm:text-xl md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-gray-900">
              {/* v1.0.4 ----------------------------------------------------------------> */}
                {ticketData?.ticketCode}
              </h3>
              <StatusBadge
                status={ticketData?.status}
                text={
                  ticketData?.status
                    ? ticketData?.status.charAt(0).toUpperCase() +
                      ticketData?.status.slice(1)
                    : "Not Provided"
                }
              />
              {/*common status code add by Venkatesh*/}
              {/*-------v1.0.1-------------->*/}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800">
                Ticket Information
              </h4>
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
              {/* v1.0.2 - Ashraf - Added subject field */}
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-gray-700">
                    {ticketData?.subject || "N/A"}
                  </p>
                </div>
              </div>
              {/* v1.0.2 - Ashraf - Added subject field */}
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaTag className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Type</p>
                  <p className="text-gray-700">
                    {ticketData?.issueType || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaUser className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-700">
                    {ticketData?.contact?.charAt(0).toUpperCase() +
                      ticketData?.contact?.slice(1) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaBuilding className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="text-gray-700">
                    {ticketData?.organization?.charAt(0).toUpperCase() +
                      ticketData?.organization?.slice(1) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
            <h4 className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
              Description
            </h4>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-custom-bg rounded-lg mt-1">
                <FaFileAlt className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-grow whitespace-pre-wrap break-words break-all">
                <p className="text-gray-700">
                  {ticketData?.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {ticketData.resolution && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
              <h4 className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
                Resolution
              </h4>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-custom-bg rounded-lg mt-1">
                  <FaFileAlt className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {ticketData?.resolution}
                  </p>
                </div>
              </div>
            </div>
          )}

          {ticketData?.attachment && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="mb-4 sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800">
                Attachments
              </h4>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-gray-500" />
                </div>

                <div className="flex-1">
                  {/* v1.0.3 <----------------------------------------------- */}
                  {/* v1.0.4 <----------------------------------------------- */}
                  {/* <p className="text-gray-700">
                    {ticketData?.attachment?.filename}
                    {ticketData?.attachment?.filename
                      ? ticketData?.attachment?.filename.length > 12
                        ? ticketData?.attachment?.filename?.slice(0, 12) + "..."
                        : ticketData?.attachment?.filename
                      : "N/A"}
                  </p> */}
                  {/* <p className="text-gray-700">
                    {ticketData?.attachment?.filename
                      ? ticketData.attachment.filename.length > 16
                        ? ticketData.attachment.filename.slice(0, 16) + "..."
                        : ticketData.attachment.filename
                      : "N/A"}
                  </p> */}

                  <p className="text-gray-700 lg:hidden xl:hidden 2xl:hidden">
                    {ticketData?.attachment?.filename
                      ? ticketData.attachment.filename.length > 16
                        ? ticketData.attachment.filename.slice(0, 16) + "..."
                        : ticketData.attachment.filename
                      : "N/A"}
                  </p>
                  <p className="text-gray-700 hidden lg:inline xl:inline 2xl:inline">
                    {ticketData?.attachment?.filename
                      ? ticketData.attachment.filename.length > 46
                        ? ticketData.attachment.filename.slice(0, 46) + "..."
                        : ticketData.attachment.filename
                      : "N/A"}
                  </p>

                  {/* v1.0.4 -----------------------------------------------> */}
                  {/* v1.0.3 -----------------------------------------------> */}
                </div>

                {ticketData?.attachment?.path && (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(ticketData.attachment.path, "_blank")
                    }
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    title="View Attachment"
                  >
                    <Eye className="w-5 h-5 text-custom-blue" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
            <h4 className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
              System Information
            </h4>
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaUser className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-gray-700">
                    {ticketData?.contact?.charAt(0).toUpperCase() +
                      ticketData?.contact?.slice(1) || "Unknown"}
                    , {formatDate(ticketData?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FaUser className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modified By</p>
                  <p className="text-gray-700">
                    {ticketData?.statusHistory?.[0]?.user
                      ?.charAt(0)
                      .toUpperCase() +
                      ticketData?.statusHistory?.[0]?.user.slice(1) ||
                      "Unknown"}
                    , {formatDate(ticketData?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sm:px-0 p-4">
          <Activity parentId={ticketData?._id} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* <div
        className={`${
          isFullScreen
            ? "fixed inset-0"
            : "fixed inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2"
        } bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden`}
      >
        <div className="relative w-full max-w-4xl max-h-full overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow">
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-end">
              <div
                className={`bg-white shadow-lg overflow-auto ${
                  isFullScreen
                    ? "w-full h-full"
                    : "w-[50%] h-[100%] sm:w-[100%] sm:h-[100%]"
                }`}
              > */}
      <SidebarPopup title="Support Ticket Details" onClose={() => navigate(-1)}>
        {content}
      </SidebarPopup>
      {/* </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* {openForm && (
        <SupportForm
          getTickets={() => {}}
        />
      )} */}
    </>
  );
};

export default SupportViewPage;
