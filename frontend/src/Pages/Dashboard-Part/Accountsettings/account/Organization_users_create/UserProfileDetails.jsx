/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ArrowLeft, Edit2, Minus, Minimize, Expand } from 'lucide-react';
import Modal from 'react-modal';
import classNames from 'classnames';
import maleImage from '../../../Images/man.png';
import femaleImage from '../../../Images/woman.png';
import genderlessImage from '../../../Images/transgender.png';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import BasicDetails from "../MyProfile/BasicDetails/BasicDetails";
import AdvancedDetails from "../MyProfile/AdvancedDetails/AdvacedDetails";
import InterviewUserDetails from "../MyProfile/InterviewDetails/InterviewDetails";
import AvailabilityUser from "../MyProfile/AvailabilityDetailsUser/AvailabilityUser";
// import ConfirmationModal from './ConfirmModel';

//this is already have common code but due to z index i have added here
const ConfirmationModal = ({
  show,
  userName,
  newStatus,
  onCancel,
  onConfirm
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
        <p className="mb-2">
          Are you sure you want to change the status of <span className="font-bold">{userName} to {newStatus}</span>?
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
Modal.setAppElement('#root');

const UserProfileDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData;
  const { toggleUserStatus } = useCustomContext();

  const [activeTab, setActiveTab] = useState('basic');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newStatus, setNewStatus] = useState(userData?.status || 'active');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "User Profile Details";
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleStatusToggle = () => {
    const updatedStatus = newStatus === 'active' ? 'inactive' : 'active';
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
    navigate('/users');
    return null;
  }

  const isInternalInterviewer = userData.roleName === 'Internal_Interviewer';
  const tabs = isInternalInterviewer
    ? [
      { id: 'basic', label: 'Basic Details' },
      { id: 'advanced', label: 'Advanced Details' },
      { id: 'interview', label: 'Interview Details' },
      { id: 'availability', label: 'Availability' },
    ]
    : [
      { id: 'basic', label: 'Basic Details' },
      { id: 'advanced', label: 'Advanced Details' },
    ];

  const renderBasicDetails = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4"> */}
          
          <BasicDetails mode='users' usersId={userData.contactId}/>
          {/* <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{userData.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-medium">{userData.firstName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-medium">{userData.lastName || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date Of Birth</p>
            <p className="font-medium">{userData.dateOfBirth || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Profile ID</p>
            <p className="font-medium">{userData.profileId || userData._id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{userData.gender || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{userData.countryCode || "N/A"} - {userData.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">LinkedIn</p>
            <p className="font-medium">{userData.linkedinUrl || "N/A"}</p>
          </div> */}
          {/* {userData.portfolioUrl && (
            <div>
              <p className="text-sm text-gray-500">Portfolio URL</p>
              <p className="font-medium">{userData.portfolioUrl || "N/A"}</p>
            </div>
          )} */}
        {/* </div> */}
      </div>
    </div>
  );

  const renderAdvancedDetails = () => (
    <div className="space-y-6">
      <div className="space-y-4 bg-white p-6 rounded-lg shadow">
        <AdvancedDetails  mode='users' usersId={userData.contactId}/>
        {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Role</p>
            <p className="font-medium">{userData.currentRole || userData.label || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="font-medium">{userData.industry || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Years of Experience</p>
            <p className="font-medium">{userData.experienceYears || "N/A"} Years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{userData.location || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Resume PDF</p>
            <p className="font-medium">{userData.resumePdf || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cover Letter</p>
            <p className="font-medium">{userData.coverLetter || "N/A"}</p>
          </div>
        </div>
        {userData.coverLetterDescription && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Cover Letter Description</span>
            <p className="text-gray-800 text-sm mt-1 font-medium">{userData.coverLetterDescription || "N/A"}</p>
          </div>
        )} */}
      </div>
    </div>
  );

  const renderInterviewDetails = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <InterviewUserDetails mode='users' usersId={userData.contactId}/>
        {/* <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div className="mt-2">
            <p className="text-sm text-gray-500">Technologies</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userData?.technologies?.length > 0 ? (
                userData.technologies.map((technology, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {technology || "N/A"}
                  </span>
                ))
              ) : (
                "No Technologies Available"
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userData?.skills?.length > 0 ? (
                userData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {skill || "N/A"}
                  </span>
                ))
              ) : (
                "No Skills Available"
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Previous Experience Conducting Interviews</p>
            <p className="font-medium">{userData?.previousExperienceConductingInterviews || "N/A"}</p>
          </div>
          {userData?.previousExperienceConductingInterviews === "yes" && (
            <div>
              <p className="text-sm text-gray-500">Previous Experience</p>
              <p className="font-medium">{userData?.previousExperienceConductingInterviewsYears || "N/A"} Years</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Expertise Level Conducting Interviews</p>
            <p className="font-medium">{userData?.expertiseLevelConductingInterviews || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hourly Charges</p>
            <p className="font-medium">$ {userData.hourlyRate || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Interview Formats You Offer</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userData?.interviewFormatWeOffer?.length > 0 ? (
                userData.interviewFormatWeOffer.map((interview, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-custom-blue rounded-full text-sm">
                    {interview || "N/A"}
                  </span>
                ))
              ) : (
                "No Interview Formats Available"
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">No Show Policy</p>
            <p className="font-medium">{userData?.noShowPolicy || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Professional Title</p>
            <p className="font-medium">{userData?.professionalTitle || "N/A"}</p>
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <span className="text-sm text-gray-500">Professional Bio</span>
          <p className="text-gray-800 text-sm mt-3 font-medium">{userData.bio || "N/A"}</p>
        </div> */}
      </div>
    </div>
  );

  const renderAvailability = () => {
    // const times = userData.availability?.[0]?.days?.reduce(
    //   (acc, day) => ({
    //     ...acc,
    //     [day.day]: day.timeSlots.map(slot => ({
    //       startTime: slot.startTime ? new Date(slot.startTime) : 'unavailable',
    //       endTime: slot.endTime ? new Date(slot.endTime) : 'unavailable',
    //     })),
    //   }),
    //   {
    //     Monday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //     Tuesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //     Wednesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //     Thursday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //     Friday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //     Saturday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //     Sunday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   }
    // ) || {
    //   Monday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   Tuesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   Wednesday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   Thursday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   Friday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   Saturday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    //   Sunday: [{ startTime: 'unavailable', endTime: 'unavailable' }],
    // };

    return (
     
        <div className="grid grid-cols-1 gap-2 
     bg-white p-2  rounded-lg shadow">
          <AvailabilityUser mode='users' usersId={userData.contactId}/>
          {/* <div className="text-sm flex flex-col">
            <div className="border border-gray-300 rounded-lg w-full max-w-md  p-4 
        sm:p-3 md:p-3 lg:p-4 xl:p-4 2xl:p-4">
              {Object.entries(times).map(([day, slots]) => (
                <div key={day} className="mb-3 last:mb-0">
                  <div className="flex items-start gap-3">
                    <p className="border border-gray-400 rounded text-center font-medium min-w-[70px] py-2">
                      {day}
                    </p>
                    <div className="flex-1 space-y-2">
                      {slots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {slot.startTime === 'unavailable' ? (
                            <span className="w-full py-2 bg-gray-200 text-center rounded text-sm">
                              Unavailable
                            </span>
                          ) : (
                            <>
                              <span className="border border-gray-400 rounded text-center py-2 px-3 w-24 text-sm">
                                {slot.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <Minus className="text-gray-600" />
                              <span className="border border-gray-400 rounded text-center py-2 px-3 w-24 text-sm">
                                {slot.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div>
              <p className="text-sm text-gray-500">Timezone</p>
              <p className="font-medium">
                {userData.timeZone || "N/A"}
              </p>
            </div>
            <div className="mt-5">
              <p className="text-sm text-gray-500">Preferred Duration</p>
              <p className="font-medium">
                {userData.preferredDuration || "N/A"} minutes
              </p>
            </div>
          </div> */}

        </div>
      
    );
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200',
    {
      'overflow-y-auto': !isModalOpen,
      'overflow-hidden': isModalOpen,
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
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
        <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-4">
                <button
                  className="text-gray-500 hover:bg-gray-200 rounded-full p-2"
                  onClick={handleClose}
                >
                  <ArrowLeft className="text-2xl" />
                </button>
                <h2 className="text-2xl font-bold text-custom-blue">User Profile</h2>
              </div>
              <div className="flex items-center gap-2">
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
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={userData.imageData?.path ||
                      (userData.gender === "Male" ? maleImage :
                        userData.gender === "Female" ? femaleImage : genderlessImage)}
                    alt={userData?.firstName || "User"}
                    onError={(e) => { e.target.src = genderlessImage; }}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <p className="text-gray-600">{userData.currentRole || userData.label || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${newStatus === 'active' ? 'text-custom-blue' : 'text-gray-500'
                  }`}>
                  {newStatus === 'active' ? 'Active' : 'Inactive'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStatus === 'active'}
                    onChange={handleStatusToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-custom-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-blue"></div>
                </label>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    'px-4 py-2 text-sm font-medium',
                    activeTab === tab.id
                      ? 'border-b-2 border-custom-blue text-custom-blue'
                      : 'text-gray-500 hover:text-custom-blue'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 230px)' }}>
              <>
                {activeTab === 'basic' && renderBasicDetails()}
                {activeTab === 'advanced' && renderAdvancedDetails()}
                {activeTab === 'interview' && renderInterviewDetails()}
                {activeTab === 'availability' && renderAvailability()}

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
      </Modal>


    </>
  );
};

export default UserProfileDetails;