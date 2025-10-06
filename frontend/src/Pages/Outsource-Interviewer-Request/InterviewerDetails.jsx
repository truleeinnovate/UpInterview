// v1.0.0 - Ashok - changed url of maleImage (man.png) from local to cloud storage
import { useState, useMemo } from "react";
import InterviewStatusIndicator from "./InterviewStatusIndicator";
import FeedbackStatusChangeModal from "./FeedbackStatusChangeModal";
// v1.0.0 <------------------------------------------------------------------
// import maleImage from "../../Pages/Dashboard-Part/Images/man.png";
// v1.0.0 ------------------------------------------------------------------>
// Removed unused Availability imports since we're using AvailabilityUser component
// import axios from "axios";
// import { config } from "../../config";
import { Minimize, Expand, X } from "lucide-react";
import { useOutsourceInterviewers } from "../../apiHooks/superAdmin/useOutsourceInterviewers";

// Import same components as MyProfile
import BasicDetailsTab from "../Dashboard-Part/Accountsettings/account/MyProfile/BasicDetails/BasicDetails";
import AdvancedDetails from "../Dashboard-Part/Accountsettings/account/MyProfile/AdvancedDetails/AdvacedDetails";
import InterviewUserDetails from "../Dashboard-Part/Accountsettings/account/MyProfile/InterviewDetails/InterviewDetails";
import AvailabilityUser from "../Dashboard-Part/Accountsettings/account/MyProfile/AvailabilityDetailsUser/AvailabilityUser";
import { DocumentsSection } from "../Dashboard-Part/Accountsettings/account/MyProfile/DocumentsDetails/DocumentsSection";

const InterviewerDetails = ({ selectedInterviewersData, onClose }) => {
    const interviewer = selectedInterviewersData.contactId;
    console.log('interviewer', interviewer)
    const { outsourceInterviewers } = useOutsourceInterviewers();

    // Removed unused states as we're using MyProfile components now
    const [activeTab, setActiveTab] = useState("Basic Details");

    const [isExpanded, setIsExpanded] = useState(false);
    
    // Documents state for DocumentsSection component
    const [documents, setDocuments] = useState({
        resume: interviewer?.resume || null,
        coverLetter: interviewer?.coverLetter || null,
    });

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // fetching feedback
    const interviewerId = interviewer?._id;
    const feedbackData = useMemo(() => {
        if (!interviewerId || !outsourceInterviewers?.length) return [];

        return outsourceInterviewers
            .filter((item) => item.contactId?._id === interviewerId)
            .reverse();
    }, [interviewerId, outsourceInterviewers]);

    // No-Show policy UI removed; mapping helper not needed

    // const [expertiseLevel, setExpertiseLevel] = useState('mid-level');
    // No-Show policy state removed

    const [showStatusModal, setShowStatusModal] = useState(false);

    const closeFeedbackPopUp = () => {
        setNewStatus({ status: "", rating: 4.5, comments: "" });
        setShowStatusModal(false);
    };

    // eslint-disable-next-line no-unused-vars
    const [statusLine, setStatusLine] = useState({
        new: true,
        underReview: false,
        approved: false,
        rejected: false,
        suspended: false,
    });

    const [newStatus, setNewStatus] = useState({
        status: "",
        rating: 4.5,
        comments: "",
    });

    // Times state removed - handled by AvailabilityUser component
    // const [times, setTimes] = useState({});

    // Timezone and duration states removed - handled by imported components

    // Availability handled by AvailabilityUser component
    // The AvailabilityUser component will fetch and display availability data

    // Interview experience handled by AdvancedDetails component

    // Timezone and duration initialization removed - handled by imported components
    // useEffect(() => {
    //     if (!interviewer) return;
    //     // handled by AvailabilityUser component
    // }, [interviewer]);

    // Helper functions removed - handled by imported components

    // Grid helpers removed - handled by AvailabilityUser component


    const statusOptions = [
        "New",
        "Under Review",
        "Approved",
        "Rejected",
        "Suspended",
    ];

    const handleChangeStatus = () => {
        if (feedbackData?.length > 0) {
            setNewStatus({
                status: feedbackData[0].status || "",
                rating: feedbackData[0].feedback[0].rating || 0,
                comments: feedbackData[0].feedback[0].comments || "",
            });
        }
        setShowStatusModal(true);
    };

    // No-Show policy options removed

    // Date formatting removed - handled by imported components

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end">
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
                    onClick={onClose}
                />
                <div
                    className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full h-screen flex flex-col ${isExpanded ? "w-full xl:w-1/2 2xl:w-1/2" : "w-full"
                        }`}
                >
                    {/* Header */}
                    {/* <div className="sticky top-0 border border-gray-300 bg-white px-4 sm:px-6 py-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="ml-8 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue"> */}
                    {/* v1.0.0 <-------------------------------------------------------------------------------------------------------------------- */}
                    <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 z-10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue">
                                    {/* v1.0.0 -------------------------------------------------------------------------------------------------------------------- */}
                                    Outsource Interviewer
                                </h2>
                            </div>
                            <div className="flex space-x-2">
                            <button
                                    className="bg-custom-blue text-white text-sm px-3 py-1 lg:px-6 xl:px-6 2xl:px-6 lg:py-2 xl:py-2 2xl:py-2 rounded-md hover:bg-custom-blue ml-4"
                                    onClick={handleChangeStatus}
                                >
                                    Change Status
                                </button>
                                <button
                                    onClick={toggleExpand}
                                    className="p-2 hidden md:flex lg:flex xl:flex 2xl:flex hover:text-gray-600 rounded-full hover:bg-gray-100"
                                    title={isExpanded ? "Compress" : "Expand"}
                                >
                                    {isExpanded ? (
                                        <Expand size={20} className="text-gray-500" />
                                    ) : (
                                        <Minimize size={20} className="text-gray-500" />
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`flex-1 grid p-3 gap-4 h-full ${isExpanded
                            ? "grid-cols-1 overflow-y-auto h-full"
                            : "md:grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr] 2xl:grid-cols-[250px_1fr]"
                            }`}
                    >
                        {/* Left Content section */}
                        <div
                            className={`flex p-6 border border-gray-200 rounded-lg ${isExpanded
                                ? "flex-row items-start gap-6"
                                : "mb-[72px] lg:flex-col xl:flex-col 2xl:flex-col lg:items-center xl:items-center 2xl:items-center"
                                }`}
                        >
                            <img
                                // v1.0.0 <----------------------------------------------------------------------
                                // src={interviewer?.imageData?.path || maleImage}
                                src={
                                    interviewer?.imageData?.path ||
                                    "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/man_u11smn.png"
                                }
                                // v1.0.0 ---------------------------------------------------------------------->
                                alt={interviewer?.firstName || "Interviewer"}
                                className={`rounded-full object-cover mb-4 transition-all duration-300
                                    ${isExpanded ? "w-24 h-24" : "w-32 h-32"}
                                `}
                            />

                            <div
                                className={`${isExpanded
                                    ? "text-left"
                                    : "lg:text-center xl:text-center 2xl:text-center"
                                    }`}
                            >
                                <h2 className="text-xl font-medium text-custom-blue mb-1 font-serif">
                                    {interviewer?.firstName || "N/A"}
                                </h2>
                                {/* <p className="text-gray-700 font-medium mb-1">
                                    {interviewer?.company || "N/A"}
                                </p> */}
                                <p className="text-gray-700 font-medium">
                                    {interviewer?.currentRole || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Right Content Section - Changes based on active tab */}
                        <div
                            className={`flex flex-col pr-2 ${isExpanded ? "" : "overflow-y-auto h-full pb-[72px]"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <span
                                    className="text-custom-blue font-bold cursor-pointer"
                                    onClick={onClose}
                                >
                                    Outsource Interviewers
                                </span>

                                <span className="text-lg text-gray-400">/</span>
                                <span className="text-lg text-gray-400">
                                    {interviewer?.firstName || "Not Provided"}
                                </span>
                            </div>

                            {/* Status Timeline */}
                            <div
                                className={`flex items-center w-[80%] lg:w-full xl:w-full 2xl:w-full max-w-4xl mx-auto mb-8 relative ${isExpanded ? "justify-start w-[60%]" : "justify-center w-full"
                                    }`}
                            >
                                <InterviewStatusIndicator
                                    currentStatus={feedbackData[0]?.status}
                                    isExpanded={isExpanded}
                                />
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex items-center mb-2">
                                <div className="border-b sm:mt-6 md:mt-6 mt-0 flex-1">
                                    <nav className="flex overflow-x-auto lg:overflow-x-hidden scrollbar-hide sm:gap-0 gap-8">
                                        {[
                                            "Basic Details",
                                            "Advanced Details",
                                            "Interview Details",
                                            "Availability Details",
                                            "Documents Details",
                                            "Feedback",
                                        ].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`
                                                    flex-shrink-0 
                                                    sm:w-1/3 md:w-auto
                                                    lg:w-auto xl:w-auto 2xl:w-auto
                                                    text-center py-4 sm:px-0 px-2 border-b-2 font-medium text-sm
                                                    ${activeTab === tab
                                                        ? "border-custom-blue text-custom-blue"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                    }
                                                `}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                            <div>
                                {activeTab === "Basic Details" && (
                                    <BasicDetailsTab 
                                        mode="view" 
                                        usersId={interviewer?._id} 
                                        type="interviewer"
                                        externalData={interviewer}
                                    />
                                )}
                                {activeTab === "Advanced Details" && (
                                    <AdvancedDetails 
                                        mode="view"
                                        usersId={interviewer?._id}
                                        type="interviewer"
                                        externalData={interviewer}
                                    />  
                                )}
                                {activeTab === "Interview Details" && (
                                    <InterviewUserDetails 
                                        mode="view"
                                        usersId={interviewer?._id}
                                        externalData={interviewer}
                                    />
                                )}
                                {activeTab === "Documents Details" && (
                                    <DocumentsSection 
                                        documents={documents} 
                                        onUpdate={setDocuments}
                                        externalData={interviewer}
                                    />
                                )}
                                {activeTab === "Availability Details" && (
                                    <AvailabilityUser 
                                        mode="view"
                                        usersId={interviewer?._id}
                                        externalData={interviewer}
                                    />
                                )}
                                {activeTab === "Feedback" && (
                                    <>
                                        <div className="bg-white border min-h-screen border-gray-200 p-6 rounded-lg">
                                            <h2 className="text-lg font-medium mb-4">Feedback:</h2>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-[min-content,1fr] gap-x-20">
                                                    <span className="text-gray-700 font-medium">
                                                        Status
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {feedbackData[0]?.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-[min-content,1fr] gap-x-20">
                                                    <span className="text-gray-700 font-medium">
                                                        Rating
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {feedbackData[0]?.feedback[0]?.rating}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-[min-content,1fr] gap-x-20">
                                                    <span className="text-gray-700 font-medium">
                                                        Notes
                                                    </span>
                                                    <span className="text-gray-600 break-words">
                                                        {feedbackData[0]?.feedback[0]?.comments}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {showStatusModal && (
                        <FeedbackStatusChangeModal
                            showStatusModal={showStatusModal}
                            statusOptions={statusOptions}
                            newStatus={newStatus}
                            setNewStatus={setNewStatus}
                            onClose={closeFeedbackPopUp}
                            interviewer={interviewer}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default InterviewerDetails;
