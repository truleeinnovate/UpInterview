/* eslint-disable react/prop-types */
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import {
  FaExternalLinkAlt,
  FaTicketAlt,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaTag,
  FaFileAlt,
  FaCircle,
  FaCheckCircle,
  FaExchangeAlt,
} from "react-icons/fa";
import { format, parseISO, isValid } from "date-fns";
import StatusChangeModal from "./StatusChangeModal.jsx";
import StatusHistory from "./StatusHistory.jsx";
import axios from "axios";
import { config } from "../../../../config.js";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { usePermissions } from "../../../../Context/PermissionsContext.js";
import { Minimize, Expand, X, Eye } from "lucide-react";

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "inprogress":
      return "bg-orange-100 text-orange-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    case "assigned":
      return "bg-blue-100 text-blue-800";
    case "new":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

function SupportDetails() {
  const { userRole } = useCustomContext();
  const {
    effectivePermissions,
    superAdminPermissions,
    impersonatedUser_roleName,
    effectivePermissions_RoleName,
  } = usePermissions();

  const navigate = useNavigate();
  const location = useLocation();
  const [currentTicket, setCurrentTicket] = useState(
    location.state?.ticketData || null
  );
  //console.log("curentTicket-------",currentTicket)
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const statusSteps = [
    "",
    "New",
    "Assigned",
    "Inprogress",
    "Resolved",
    "Close",
  ];
  const [isOwnerEditing, setIsOwnerEditing] = useState(false);
  const [ownerOptions, setOwnerOptions] = useState([]);
  console.log("ownerOptions---", ownerOptions);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/users`);

        const filteredUsers = response.data.filter(
          (user) =>
            user.roleId === "680360b7682a6e89ff1c49e1" ||
            user.roleId === "67f77613588be9a9ef019765"
        );
        console.log("filteredUsers---", filteredUsers);
        setOwnerOptions(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [selectedOwner, setSelectedOwner] = useState(
    currentTicket?.assignedTo || ""
  );
  const [selectedOwnerId, setSelectedOwnerId] = useState(
    currentTicket?.assignedToId || ""
  );
  const [isUpdatingOwner, setIsUpdatingOwner] = useState(false);
  const currentStepIndex = statusSteps.indexOf(currentTicket.status);
  // User role - in a real app, this would come from authentication context or API
  // eslint-disable-next-line no-unused-vars

  // useEffect(() => {
  //   document.title = "Support Ticket Details";

  //   // In a real application, you would fetch the user role from an API or auth context
  //   // For demo purposes, we'll simulate getting the role
  //   // This could be replaced with actual authentication logic
  //   const getUserRole = () => {
  //     // This would typically be fetched from localStorage, context, or an API
  //     // For now, we'll use localStorage as an example
  //     const role = localStorage.getItem('userRole');
  //     setUserRole(role);
  //   };

  //   getUserRole();
  // }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  const toggleStatusModal = useCallback(() => {
    setIsStatusModalOpen((prev) => !prev);
  }, []);

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM dd, yyyy") : "N/A";
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleStatusUpdate = useCallback(
    (updatedTicket) => {
      setCurrentTicket((prevTicket) => ({
        ...prevTicket,
        status: updatedTicket.status,
        statusHistory: updatedTicket.statusHistory || prevTicket.statusHistory,
        modifiedDate: new Date().toISOString(),
        modifiedBy: "System",
      }));
      closeStatusModal();
    },
    [closeStatusModal]
  );

  const handleOwnerChange = (e) => {
    const selectedUserId = e.target.value;
    const selectedUser = ownerOptions.find(
      (user) => user._id === selectedUserId
    );

    if (selectedUser) {
      setSelectedOwner(selectedUser.firstName + " " + selectedUser.lastName);
      setSelectedOwnerId(selectedUser._id);
    } else {
      setSelectedOwner("");
      setSelectedOwnerId("");
    }
  };

  const toggleOwnerEdit = () => {
    setIsOwnerEditing(!isOwnerEditing);
    if (!isOwnerEditing) {
      setSelectedOwner(currentTicket.assignedTo || "");
      setSelectedOwnerId(currentTicket.assignedToId || "");
    }
  };

  const updateOwner = async () => {
    // Check if the selected owner is the same as the current ticket's owner
    if (
      selectedOwner === currentTicket.assignedTo &&
      selectedOwnerId === currentTicket.assignedToId
    ) {
      setIsOwnerEditing(false);
      return;
    }

    setIsUpdatingOwner(true);
    try {
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/update-ticket/${currentTicket._id}`,
        {
          assignedTo: selectedOwner,
          assignedToId: selectedOwnerId,
          issueType: currentTicket.issueType,
          description: currentTicket.description,
        }
      );

      const updatedTicket = {
        ...currentTicket,
        assignedTo: selectedOwner,
        assignedToId: selectedOwnerId,
      };

      setCurrentTicket(updatedTicket);
      setIsOwnerEditing(false);

      console.log("Owner updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating owner:", error);
    } finally {
      setIsUpdatingOwner(false);
    }
  };

  if (!currentTicket) {
    navigate("/support-desk");
    return null;
  }

  const ticketId = currentTicket._id?.slice(-5, -1) || "";
  const statusClass = getStatusColor(currentTicket.status);

  const content = (
    <div
      className={`${isFullScreen ? "min-h-screen" : "h-full"} flex flex-col`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text-custom-blue">
              Support Ticket Details
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {(impersonatedUser_roleName === "Super_Admin" ||
              impersonatedUser_roleName === "Support_Team") && (
              <button
                onClick={toggleStatusModal}
                className="p-2 bg-custom-blue text-white hover:bg-custom-blue/90 rounded-md transition-colors"
                title="Change Status"
              >
                <FaExchangeAlt className="w-5 h-5" />
              </button>
            )}

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
          <h3 className="text-2xl font-bold text-gray-900">
            {currentTicket.ticketCode}
          </h3>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full mt-2 ${statusClass}`}
          >
            {currentTicket.status}
          </span>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["details", "status"].map((tab) => (
              <button
                key={tab}
                className={`pt-2 pb-2 capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-custom-blue text-custom-blue"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab === "status" ? "Status History" : tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "details" ? (
          <>
            <div
              className={`flex justify-center items-center ${
                isFullScreen ? "max-w-4xl" : "w-[90%]"
              } mx-auto mt-10 mb-8`}
            >
              {statusSteps.map((step, index) => (
                <div
                  key={step || `step-${index}`}
                  className="flex items-center flex-1 last:flex-initial"
                >
                  <div className="flex flex-col items-center relative">
                    {/* Status Circle */}
                    <div
                      className={`${
                        isFullScreen ? "w-8 h-8" : "w-6 h-6"
                      } rounded-full border-2 flex items-center justify-center ${
                        index === 0
                          ? "border-teal-600" // Default first circle
                          : index < currentStepIndex
                          ? "border-teal-600"
                          : index === currentStepIndex
                          ? "border-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {/* First circle has no tick */}
                      {index === 0 ? (
                        <FaCircle
                          className={`${
                            isFullScreen
                              ? "h-5 w-5 rounded-full"
                              : "w-3 h-3 rounded-full"
                          } text-teal-600  text-base`}
                        />
                      ) : index < currentStepIndex ? (
                        <FaCheckCircle
                          className={`${
                            isFullScreen
                              ? "h-5 w-5 rounded-full"
                              : "w-3 h-3 rounded-full"
                          } text-teal-600 text-base`}
                        />
                      ) : index === currentStepIndex ? (
                        <div
                          className={`${
                            isFullScreen
                              ? "h-5 w-5 rounded-full"
                              : "w-3 h-3 rounded-full"
                          } bg-orange-500`}
                        ></div>
                      ) : (
                        <div
                          className={`${
                            isFullScreen
                              ? "h-5 w-5 rounded-full"
                              : "w-3 h-3 rounded-full"
                          } bg-gray-300`}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < statusSteps.length - 1 && (
                    <div className="relative flex-1 h-[2px] mx-2">
                      {/* Text Between Circles */}
                      {index >= 0 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 whitespace-nowrap">
                          {statusSteps[index + 1]}
                        </div>
                      )}
                      {/* Line */}
                      <div
                        className={`h-full ${
                          index < currentStepIndex - 1
                            ? "bg-teal-600"
                            : index === currentStepIndex - 1
                            ? "bg-orange-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 mt-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Ticket Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaUser className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-gray-700">
                      {currentTicket.contact.charAt(0).toUpperCase() + currentTicket.contact.slice(1) || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaBuilding className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organization</p>
                    <p className="text-gray-700">
                      {currentTicket.organization.charAt(0).toUpperCase() + currentTicket.organization.slice(1) || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaTag className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Type</p>
                    <p className="text-gray-700">
                      {currentTicket.issueType || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaCalendarAlt className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="text-gray-700">
                      {currentTicket.priority || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaUser className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div className="flex items-start gap-24">
                    <div className="flex flex-col items-start">
                      <p className="text-sm text-gray-500">Owner</p>
                      {isOwnerEditing ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="border border-gray-300 rounded-md p-1 text-sm"
                            value={selectedOwnerId}
                            onChange={handleOwnerChange}
                            disabled={isUpdatingOwner}
                          >
                            <option value="" hidden>
                              Select Owner
                            </option>
                            {ownerOptions.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.firstName + " " + user.lastName}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={updateOwner}
                            className="text-green-600 hover:text-green-800 p-1"
                            disabled={isUpdatingOwner}
                          >
                            {isUpdatingOwner ? (
                              <span>Saving...</span>
                            ) : (
                              <FaCheckCircle className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={toggleOwnerEdit}
                            className="text-red-600 hover:text-red-800 p-1"
                            disabled={isUpdatingOwner}
                          >
                            <MdOutlineCancel className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-nowrap">
                          {currentTicket.assignedTo || "N/A"}
                        </p>
                      )}
                    </div>
                    {impersonatedUser_roleName === "Super_Admin" && (
                      <div className="flex items-center justify-center w-full">
                        <button
                          onClick={toggleOwnerEdit}
                          className="p-1 text-custom-blue hover:bg-blue-50 rounded-full transition-colors"
                          title="Change Owner"
                        >
                          <FaExchangeAlt className="w-5 h-5 text-custom-blue" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Description
              </h4>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-custom-blue/10 rounded-lg mt-1">
                  <FaFileAlt className="w-5 h-5 text-custom-blue" />
                </div>
                <div className="flex-grow whitespace-pre-wrap break-words break-all">
                  <p className="text-gray-700 ">
                    {currentTicket.description || "No description provided."}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Attachment
                </h4>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg mt-1">
                    <FaFileAlt className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div className="flex-grow whitespace-pre-wrap break-words break-all">
                    <p className="text-gray-700 truncate">
                      {currentTicket?.attachment?.filename ||
                        "No attachment provided."}
                    </p>
                  </div>

                  {currentTicket?.attachment?.path && (
                    <button
                      type="button"
                      title="Preview Attachment"
                      onClick={() =>
                        window.open(currentTicket.attachment.path, "_blank")
                      }
                      className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Eye className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                System Information
              </h4>
              <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaUser className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="text-gray-700">
                      {currentTicket.contact.charAt(0).toUpperCase() + currentTicket.contact.slice(1) || "Unknown"},{" "}
                      {formatDate(currentTicket.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-custom-blue/10 rounded-lg">
                    <FaUser className="w-5 h-5 text-custom-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modified By</p>
                    <p className="text-gray-700">
                      {currentTicket?.statusHistory?.[0]?.user.charAt(0).toUpperCase() + currentTicket?.statusHistory?.[0]?.user.slice(1) || "Unknown"},{" "}
                      {formatDate(currentTicket?.statusHistory?.[0]?.date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Status History
            </h4>
            <StatusHistory history={currentTicket} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
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
              >
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        ticketId={currentTicket._id}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}

export default SupportDetails;
