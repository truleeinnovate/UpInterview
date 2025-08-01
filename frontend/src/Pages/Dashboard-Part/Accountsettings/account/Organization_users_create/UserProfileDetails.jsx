/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ArrowLeft, Edit2, Minus, Minimize, Expand } from "lucide-react";
import Modal from "react-modal";
import classNames from "classnames";
import maleImage from "../../../Images/man.png";
import femaleImage from "../../../Images/woman.png";
import genderlessImage from "../../../Images/transgender.png";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import BasicDetails from "../MyProfile/BasicDetails/BasicDetails";
import AdvancedDetails from "../MyProfile/AdvancedDetails/AdvacedDetails";
import InterviewUserDetails from "../MyProfile/InterviewDetails/InterviewDetails";
import AvailabilityUser from "../MyProfile/AvailabilityDetailsUser/AvailabilityUser";
import BasicDetailsEditPage from "../MyProfile/BasicDetails/BasicDetailsEditPage";
import EditAdvacedDetails from "../MyProfile/AdvancedDetails/EditAdvacedDetails";
import EditInterviewDetails from "../MyProfile/InterviewDetails/EditInterviewDetails";
import EditAvailabilityDetails from "../MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
// import ConfirmationModal from './ConfirmModel';

//this is already have common code but due to z index i have added here
const ConfirmationModal = ({
  show,
  userName,
  newStatus,
  onCancel,
  onConfirm,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
        <p className="mb-2">
          Are you sure you want to change the status of{" "}
          <span className="font-bold">
            {userName} to {newStatus}
          </span>
          ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-custom-blue text-white rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Set app element for accessibility
Modal.setAppElement("#root");

const UserProfileDetails = ({ type }) => {
  console.log("type in UserProfileDetails", type);

  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  const { toggleUserStatus, refetchUsers } = useCustomContext();
  console.log("SETTINGS SELECTED USER DATA ============================> : ", userData);
  const [activeTab, setActiveTab] = useState("basic");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newStatus, setNewStatus] = useState(userData?.status || "active");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [basicEditOpen, setBasicEditOpen] = useState(false);
  const [advacedEditOpen, setAdvacedEditOpen] = useState(false);
  const [interviewEditOpen, setInterviewEditOpen] = useState(false);
  const [availabilityEditOpen, setAvailabilityEditOpen] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);

  console.log("userData", userData);

  useEffect(() => {
    document.title = "User Profile Details";
  }, []);

  const handleBasicEditSuccess = () => {
    refetchUsers(); // Refresh the users data in context
  };

  const handleAdvacedEditSuccess = () => {
    refetchUsers(); // Refresh the users data in context
  };

  const handleInterviewEditSuccess = () => {
    refetchUsers(); // Refresh the users data in context
  };

  const handleAvailabilityEditSuccess = () => {
    refetchUsers(); // Refresh the users data in context
    setAvailabilityData(null); // Clear the availability data
  };

  const handleAvailabilityEditClick = (data) => {
    console.log("Availability edit clicked with data:", data);
    setAvailabilityData(data);
    setAvailabilityEditOpen(true);
  };

  const handleAvailabilityEditClose = () => {
    setAvailabilityEditOpen(false);
    setAvailabilityData(null); // Clear the availability data
  };

  // useEffect(() => {
  //   refetchUsers()

  // },[handleBasicEditSuccess])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleStatusToggle = () => {
    const updatedStatus = newStatus === "active" ? "inactive" : "active";
    setNewStatus(updatedStatus);
    setShowConfirmation(true);
    setIsModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (userData) {
      toggleUserStatus.mutate({
        userId: userData._id,
        newStatus,
      });
    }
    setShowConfirmation(false);
    setIsModalOpen(false);
  };

  const cancelStatusChange = () => {
    setNewStatus(userData.status);
    setShowConfirmation(false);
    setIsModalOpen(false);
  };

  if (!userData) {
    navigate("/users");
    return null;
  }

  const isInternalInterviewer = userData.roleName === "Internal_Interviewer";
  const tabs = isInternalInterviewer
    ? [
      { id: "basic", label: "Basic Details" },
      { id: "advanced", label: "Advanced Details" },
      { id: "interview", label: "Interview Details" },
      { id: "availability", label: "Availability" },
    ]
    : [
      { id: "basic", label: "Basic Details" },
      { id: "advanced", label: "Advanced Details" },
    ];

  console.log("userData", userData);


  const renderBasicDetails = () => (
    <div className={isFullScreen ? "mx-3" : ""}>
      <div className="bg-white p-6 rounded-lg">
        <BasicDetails
          mode="users"
          type={type}
          usersId={userData?._id}
          setBasicEditOpen={setBasicEditOpen}
        />
      </div>
    </div>
  );

  const renderAdvancedDetails = () => (
    <div className={isFullScreen ? "mx-3" : ""}>
      <div className="bg-white p-6 rounded-lg">
        <AdvancedDetails
          mode="users"
          usersId={userData?._id}
          setAdvacedEditOpen={setAdvacedEditOpen}
        />
      </div>
    </div>
  );

  const renderInterviewDetails = () => (
    <div className={isFullScreen ? "mx-3" : ""}>
      <div className="bg-white p-6 rounded-lg">
        <InterviewUserDetails
          mode="users"
          usersId={userData?._id}
          setInterviewEditOpen={setInterviewEditOpen}
        />
      </div>
    </div>
  );

  const renderAvailability = () => {
    return (
      <div className={isFullScreen ? "mx-3" : ""}>
        <AvailabilityUser
          mode="users"
          usersId={userData?._id}
          setAvailabilityEditOpen={setAvailabilityEditOpen}
          isFullScreen={isFullScreen}
          onEditClick={handleAvailabilityEditClick}
        />
      </div>
    );
  };

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200",
    {
      "overflow-y-auto": !isModalOpen,
      "overflow-hidden": isModalOpen,
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  return (
    <>
      <Modal
        isOpen={true}
        onRequestClose={handleClose}
        className={modalClass}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <div
          className={classNames("h-full", {
            "max-w-7xl mx-auto px-2": isFullScreen,
          })}
        >
          <div>
            <div className="flex justify-between items-center mb-2 mx-3 mt-3">
              <h2 className="text-xl font-bold text-custom-blue">
                User Profile
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                >
                  {isFullScreen ? (
                    <ArrowsPointingInIcon className="h-5 w-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2 mx-3">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={
                      userData.imageData?.path ||
                      (userData.gender === "Male"
                        ? maleImage
                        : userData.gender === "Female"
                          ? femaleImage
                          : genderlessImage)
                    }
                    alt={userData?.firstName || "User"}
                    onError={(e) => {
                      e.target.src = genderlessImage;
                    }}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {userData.firstName ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1) : ""} {userData.lastName ? userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1) : ""}
                  </h3>
                  <p className="text-gray-600">
                    {userData.currentRole || userData.label || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-medium ${newStatus === "active"
                    ? "text-custom-blue"
                    : "text-gray-500"
                    }`}
                >
                  {newStatus === "active" ? "Active" : "Inactive"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStatus === "active"}
                    onChange={handleStatusToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-custom-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-blue"></div>
                </label>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-gray-200 mx-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    "px-4 py-2 text-sm font-medium",
                    activeTab === tab.id
                      ? "border-b-2 border-custom-blue text-custom-blue"
                      : "text-gray-500 hover:text-custom-blue"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ maxHeight: "calc(100vh - 230px)" }}>
              <>
                {activeTab === "basic" && renderBasicDetails()}
                {activeTab === "advanced" && renderAdvancedDetails()}
                {activeTab === "interview" && renderInterviewDetails()}
                {activeTab === "availability" && renderAvailability()}

                <ConfirmationModal
                  show={showConfirmation}
                  userName={`${userData?.firstName} ${userData?.lastName}`}
                  newStatus={newStatus}
                  onCancel={cancelStatusChange}
                  onConfirm={confirmStatusChange}
                />
              </>
            </div>
          </div>
        </div>

        {basicEditOpen && (
          <BasicDetailsEditPage
            from="users"
            usersId={userData._id}
            setBasicEditOpen={setBasicEditOpen}
            onSuccess={handleBasicEditSuccess}
          />
        )}

        {advacedEditOpen && (
          <EditAdvacedDetails
            from="users"
            usersId={userData._id}
            setAdvacedEditOpen={setAdvacedEditOpen}
            onSuccess={handleAdvacedEditSuccess}
          />
        )}

        {interviewEditOpen && (
          <EditInterviewDetails
            from="users"
            usersId={userData._id}
            setInterviewEditOpen={setInterviewEditOpen}
            onSuccess={handleInterviewEditSuccess}
          />
        )}

        {availabilityEditOpen && (
          <EditAvailabilityDetails
            from="users"
            usersId={userData._id}
            setAvailabilityEditOpen={handleAvailabilityEditClose}
            onSuccess={handleAvailabilityEditSuccess}
            availabilityData={availabilityData}
          />
        )}
      </Modal>
    </>
  );
};

export default UserProfileDetails;
