// v1.0.0 - Ashok - disabled outer scrollbar using custom hook
// v1.0.1 - Venkatesh - ticket code and status in align center
// v1.0.2 - Ashraf - Added subject field
// v1.0.3 - Ashok  - Fixed responsive issues
// v1.0.4 - Ashok  - Fixed issues
// v1.0.5 - Ashok  - Fixed style issues

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Eye,
  Ticket,
  User,
  Building,
  Tag,
  FileText,
  History,
  Info,
} from "lucide-react";
// v1.0.0 <-------------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
import Activity from "../CommonCode-AllTabs/Activity";
// v1.0.0 ------------------------------------------------------------------------->
//import SupportForm from "./SupportForm";

//const validReopenStatus = ["resolved", "cancel"];
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { useTicketById } from "../../../../apiHooks/useSupportDesks";

const SupportViewPage = () => {
  const navigate = useNavigate();
  // const location = useLocation();

  // const ticketData = location.state?.ticketData;
  // console.log("lastModifiedBy:", ticketData.updatedByUserId);
  const [activeTab, setActiveTab] = useState("details");
  const { id } = useParams();

  console.log("SupportViewPage Ticket ID:", id);

  const { data: ticket, isLoading, isError } = useTicketById(id);

  const ticketData = ticket?.ticket || {};
  console.log("ticketData", ticketData);
  // console.log("lastModifiedBy:", ticketData.updatedByUserId);

  useEffect(() => {
    document.title = "Support Ticket Details";
  }, []);

  useScrollLock(true);

  if (isLoading)
    return (
      <SidebarPopup title="Support Ticket Details">
        <div className="p-6">Loading...</div>
      </SidebarPopup>
    );

  if (isError)
    return (
      <SidebarPopup title="Support Ticket Details">
        <div className="p-6 text-red-500">Failed to load ticket</div>
      </SidebarPopup>
    );

  const content = (
    <div>
      {/* Sub tabs Navigation */}
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
            <Info className="w-4 h-4" />
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
            <History className="w-4 h-4" />
            Feeds
          </button>
        </div>
      </div>

      {/* <-------v1.0.1--------------Ticket Code and Status */}
      {/* Tab Content */}
      {activeTab === "details" ? (
        <div className="sm:px-0 p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center p-3 justify-center bg-custom-blue/10 text-custom-blue rounded-full">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="items-center text-center">
              {/* v1.0.4 <---------------------------------------------------------------- */}
              <h3 className="sm:text-xl md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl font-bold text-gray-900">
                {/* v1.0.4 ----------------------------------------------------------------> */}
                {ticketData?.ticketCode}
              </h3>
              <StatusBadge status={capitalizeFirstLetter(ticketData?.status)} />
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
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p
                    className="text-gray-700 truncate max-w-[200px] cursor-default"
                    title={capitalizeFirstLetter(ticketData?.subject)}
                  >
                    {capitalizeFirstLetter(ticketData?.subject) || "N/A"}
                  </p>
                </div>
              </div>
              {/* v1.0.2 - Ashraf - Added subject field */}
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <Tag className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Type</p>
                  <p className="text-gray-700">
                    {capitalizeFirstLetter(ticketData?.issueType) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-700">
                    {capitalizeFirstLetter(ticketData?.contact) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-1">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <Building className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="text-gray-700">
                    {capitalizeFirstLetter(ticketData?.organization) || "N/A"}
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
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-grow whitespace-pre-wrap break-words break-all">
                <p className="text-gray-700">
                  {capitalizeFirstLetter(ticketData?.description) ||
                    "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {ticketData?.resolution && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
              <h4 className="sm:text-md md:text-lg lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-800 mb-4">
                Resolution
              </h4>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-custom-bg rounded-lg mt-1">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {capitalizeFirstLetter(ticketData?.resolution)}
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
                  <FileText className="w-5 h-5 text-gray-500" />
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
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-gray-700">
                    {ticketData?.contact?.charAt(0).toUpperCase() +
                      ticketData?.contact?.slice(1) || "Unknown"}
                    , {formatDateTime(ticketData?.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modified By</p>
                  <p className="text-gray-700">
                    {ticketData?.statusHistory?.[0]?.user
                      ?.charAt(0)
                      .toUpperCase() +
                      ticketData?.statusHistory?.[0]?.user.slice(1) ||
                      "Unknown"}
                    , {formatDateTime(ticketData?.updatedAt)}
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
      <SidebarPopup title="Support Ticket Details" onClose={() => navigate(-1)}>
        {content}
      </SidebarPopup>
    </>
  );
};

export default SupportViewPage;
