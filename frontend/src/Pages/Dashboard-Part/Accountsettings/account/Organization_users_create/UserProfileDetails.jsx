// v1.0.0 - Ashok - Removed border left and set outline as none
/* v1.0.1 - Ashok - changed maleImage (man.png), femaleImage (woman.png) and genderlessImage (transgender.png) 
 path from local to cloud storage url
 */
// v1.0.2 - Ashok - Improved responsiveness and added common code to popup

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import classNames from "classnames";
// v1.0.0 <--------------------------------------------------------------
// import maleImage from "../../../Images/man.png";
// import femaleImage from "../../../Images/woman.png";
// import genderlessImage from "../../../Images/transgender.png";
// v1.0.0 -------------------------------------------------------------->
import { useCustomContext } from "../../../../../Context/Contextfetch";
import BasicDetails from "../MyProfile/BasicDetails/BasicDetails";
import AdvancedDetails from "../MyProfile/AdvancedDetails/AdvacedDetails";
import InterviewUserDetails from "../MyProfile/InterviewDetails/InterviewDetails";
import AvailabilityUser from "../MyProfile/AvailabilityDetailsUser/AvailabilityUser";
import BasicDetailsEditPage from "../MyProfile/BasicDetails/BasicDetailsEditPage";
import EditAdvacedDetails from "../MyProfile/AdvancedDetails/EditAdvacedDetails";
import EditInterviewDetails from "../MyProfile/InterviewDetails/EditInterviewDetails";
import EditAvailabilityDetails from "../MyProfile/AvailabilityDetailsUser/EditAvailabilityDetails";

// import ConfirmationModal from './ConfirmModel';
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";

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
      {/* v1.0.2 <-------------------------------------------------------- */}
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        {/* v1.0.2 --------------------------------------------------------> */}
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


  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  const { toggleUserStatus, refetchUsers } = useCustomContext();
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

  return (
    // v1.0.2 <------------------------------------------------------------------------
    <SidebarPopup title="User Profile" onClose={handleClose}>
      <div>
        <div
          className={classNames("h-full", {
            "max-w-7xl mx-auto px-2": isFullScreen,
          })}
        >
          <div>
            <div className="flex sm:flex-col md:flex-col sm:items-start md:items-start sm:gap-4 md:gap-4 items-center justify-between mb-2 mx-3">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    // v1.0.1 <------------------------------------------------------------------------------------------------------
                    src={
                      userData.imageData?.path ||
                      (userData.gender === "Male"
                        ? // ? maleImage
                          "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/man_u11smn.png"
                        : userData.gender === "Female"
                        ? // ? femaleImage
                          "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099369/woman_mffxrj.png"
                        : // : genderlessImage)
                          "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099367/transgender_le4gvu.png")
                    }
                    alt={userData?.firstName || "User"}
                    onError={(e) => {
                      // e.target.src = genderlessImage;
                      e.target.src =
                        "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099367/transgender_le4gvu.png";
                    }}
                    // v1.0.1 ------------------------------------------------------------------------------------------------------>
                    className="sm:w-20 sm:h-20 w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <h3 className="sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl font-bold text-gray-900">
                    {userData.firstName
                      ? userData.firstName.charAt(0).toUpperCase() +
                        userData.firstName.slice(1)
                      : ""}{" "}
                    {userData.lastName
                      ? userData.lastName.charAt(0).toUpperCase() +
                        userData.lastName.slice(1)
                      : ""}
                  </h3>
                  <p className="text-gray-600">
                    {userData.currentRole || userData.label || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center sm:justify-end sm:w-full md:justify-end md:w-full space-x-2">
                <span
                  className={`text-sm font-medium ${
                    newStatus === "active"
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
      </div>
    </SidebarPopup>
    // v1.0.2 ------------------------------------------------------------------------>
  );
};

export default UserProfileDetails;
