import { useEffect, useState, useCallback } from "react";
import InterviewStatusIndicator from "./InterviewStatusIndicator";
import FeedbackStatusChangeModal from "./FeedbackStatusChangeModal";
import maleImage from "../../Pages/Dashboard-Part/Images/man.png";
import Availability from "../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/Availability";
import axios from "axios";
import { config } from "../../config";
import { Minimize, Expand, X } from "lucide-react";

const InterviewerDetails = ({ selectedInterviewersData, onClose }) => {
  const interviewer = selectedInterviewersData.contactId;

  const [timeZone] = useState(interviewer?.timeZone || "Not Provided");
  const [selectedDuration, setSelectedDuration] = useState(
    interviewer?.PreferredDuration + " mints" || "Not Provided"
  );
  const [activeTab, setActiveTab] = useState("Details");
  const [readyToTakeMockInterview, setReadyToTakeMockInterview] = useState(
    interviewer?.IsReadyForMockInterviews === "yes"
  );

  const [feedbackData, setFeedbackData] = useState([]);

  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchInterviewers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/outsourceInterviewers`
      );

      console.log("response:", response.data);

      if (!interviewer || !interviewer._id) {
        console.error("No valid interviewer selected");
        return;
      }

      const interviewerId = interviewer._id;

      console.log("Interviewer._id:", interviewerId);

      // Filter data where contactId matches the selected interviewer's _id
      const filteredData = response.data.filter(
        (item) => item.contactId._id === interviewerId
      );

      console.log("filteredData:", filteredData);

      if (filteredData.length > 0) {
        setFeedbackData(filteredData || []);
      } else {
        setFeedbackData([]);
      }
    } catch (err) {
      console.error("Error fetching interviewers:", err);
    }
  }, [interviewer]);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  const getMappedPolicy = (policy) => {
    switch (policy) {
      case "25%":
        return "25-no-reschedule";
      case "50%":
        return "50-no-reschedule";
      case "100%":
        return "100-no-reschedule";
      case "100% with reschedule":
        return "100-with-reschedule";
      default:
        return ""; // Handle unknown cases
    }
  };

  // const [expertiseLevel, setExpertiseLevel] = useState('mid-level');
  const [noShowPolicy, setNoShowPolicy] = useState(
    getMappedPolicy(interviewer?.NoShowPolicy)
  );

  const [showStatusModal, setShowStatusModal] = useState(false);

  const closeFeedbackPopUp = () => {
    setNewStatus({ status: "", rating: 4.5, comments: "" });
    setShowStatusModal(false);
  };

  // eslint-disable-next-line no-unused-vars
  const [statusLine, setStatusLine] = useState({
    new: true,
    contacted: false,
    inprogress: false,
    selected: false,
    closed: false,
  });

  // const [feedback, setFeedback] = useState({
  //   status: 'New',
  //   rating: 4.5,
  //   comments: ''
  // });

  const [newStatus, setNewStatus] = useState({
    status: "",
    rating: 4.5,
    comments: "",
  });

  const [times, setTimes] = useState({});

  useEffect(() => {
    if (interviewer?.availability && interviewer?.availability.length > 0) {
      const initialTimes = {};
      interviewer?.availability?.forEach((availabilityItem) => {
        availabilityItem.days.forEach((dayItem) => {
          if (!initialTimes[dayItem.day]) {
            initialTimes[dayItem.day] = [];
          }
          dayItem.timeSlots.forEach((slot) => {
            initialTimes[dayItem.day].push({
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          });
        });
      });
      setTimes(initialTimes);
    } else {
      setTimes({});
    }
  }, [interviewer?.availability]);
  const [hasInterviewExperience, setHasInterviewExperience] = useState(
    interviewer?.InterviewPreviousExperience === "yes"
  );
  const [expertiseLevel, setExpertiseLevel] = useState("");

  useEffect(() => {
    if (
      hasInterviewExperience &&
      interviewer?.PreviousExperienceConductingInterviewsYears
    ) {
      const years = parseInt(
        interviewer?.PreviousExperienceConductingInterviewsYears,
        10
      );

      // Determine the expertise level based on years of experience
      if (years >= 0 && years <= 1) {
        setExpertiseLevel("junior");
      } else if (years >= 2 && years <= 5) {
        setExpertiseLevel("mid-level");
      } else if (years >= 6 && years <= 8) {
        setExpertiseLevel("senior");
      } else if (years >= 9) {
        setExpertiseLevel("lead");
      }
    }
  }, [
    hasInterviewExperience,
    interviewer?.PreviousExperienceConductingInterviewsYears,
  ]);
  console.log("SELECTED OUT SOURCE: ", interviewer);

  const statusOptions = [
    "Contacted",
    "In Progress",
    "Active",
    "InActive",
    "Blacklisted",
  ];

  // const updateStatusLine = (status) => {
  //   const newStatusLine = {
  //     new: true,
  //     contacted: false,
  //     inprogress: false,
  //     selected: false,
  //     closed: false,
  //   };

  //   switch (status) {
  //     case 'Contacted':
  //       newStatusLine.contacted = true;
  //       break;
  //     case 'In Progress':
  //       newStatusLine.contacted = true;
  //       newStatusLine.inprogress = true;
  //       break;
  //     case 'Active/InActive':
  //       newStatusLine.contacted = true;
  //       newStatusLine.inprogress = true;
  //       newStatusLine.selected = true;
  //       break;
  //     case 'Blacklisted':
  //       newStatusLine.contacted = true;
  //       newStatusLine.inprogress = true;
  //       newStatusLine.selected = true;
  //       newStatusLine.closed = true;
  //       break;
  //     default:
  //       break;
  //   }
  //   setStatusLine(newStatusLine);
  // };

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

  // const handleSave = () => {
  //   if (!newStatus.status) {
  //     return;
  //   }
  //   setFeedback({
  //     status: newStatus.status,
  //     rating: newStatus.rating,
  //     comments: newStatus.comments,
  //   });
  //   updateStatusLine(newStatus.status);
  //   setNewStatus({ status: '', rating: 4.5, comments: '' });
  //   setShowStatusModal(false);
  // };

  // const handleCancel = () => {
  //   setNewStatus({ status: '', rating: 4.5, comments: '' });
  //   setShowStatusModal(false);
  // };

  // Find the interviewer based on the ID
  // const interviewer = interviewers.find(int => int.id === parseInt(id));

  // if (!interviewer) {
  //   return <div>Interviewer not found</div>;
  // }

  const options = [
    { label: "Charge 25% without rescheduling", value: "25-no-reschedule" },
    { label: "Charge 50% without rescheduling", value: "50-no-reschedule" },
    { label: "Charge 100% without rescheduling", value: "100-no-reschedule" },
    {
      label: "Charge 100% with rescheduling option",
      value: "100-with-reschedule",
    },
  ];

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full h-screen flex flex-col ${
            isExpanded ? "w-full xl:w-1/2 2xl:w-1/2" : "w-full"
          }`}
        >
          {/* Header */}
          <div className="sticky top-0 border border-gray-300 bg-white px-4 sm:px-6 py-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="ml-8 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue">
                  Outsource Interviewer
                </h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleExpand}
                  className="p-2 hidden md:flex lg:flex xl:flex 2xl:flex hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title={isExpanded ? "Compress" : "Expand"}
                >
                  {isExpanded ? (
                    <Minimize size={20} className="text-gray-500" />
                  ) : (
                    <Expand size={20} className="text-gray-500" />
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
            className={`flex-1 grid p-3 gap-4 overflow-hidden ${
              isExpanded
                ? "grid-cols-1"
                : "md:grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr] 2xl:grid-cols-[250px_1fr]"
            }`}
          >
            {/* Left Content section */}
            <div
              className={`flex h-full p-6 border border-gray-200 rounded-lg ${
                isExpanded
                  ? "flex-row items-start"
                  : "lg:flex-col xl:flex-col 2xl:flex-col lg:items-center xl:items-center 2xl:items-center"
              }`}
            >
              <img
                src={interviewer?.imageData?.path || maleImage}
                alt={interviewer?.firstName || "Interviewer"}
                className={`rounded-full object-cover mb-4 transition-all duration-300 
                ${isExpanded ? "w-24 h-24" : "w-32 h-32"}
              `}
              />

              <div
                className={`sm:ml-6 md:ml-6 lg:ml-6 xl:ml-6 2xl:ml-6 ${
                  isExpanded
                    ? "text-left ml-6"
                    : "lg:text-center xl:text-center 2xl:text-center"
                }`}
              >
                <h2 className="text-2xl font-medium text-custom-blue mb-1">
                  {interviewer?.firstName || "N/A"}
                </h2>
                <p className="text-gray-700 font-medium mb-1">
                  {interviewer?.company || "N/A"}
                </p>
                <p className="text-gray-700 font-medium">
                  {interviewer?.currentRole || "N/A"}
                </p>
              </div>
            </div>

            {/* Right Content Section - Changes based on active tab */}
            {/* <div> */}
            <div className="flex flex-col h-full overflow-y-auto pr-2">
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
                className={`flex items-center w-[80%] lg:w-full xl:w-full 2xl:w-full max-w-4xl mx-auto mb-8 relative ${
                  isExpanded ? "justify-start w-[60%]" : "justify-center w-full"
                }`}
              >
                <InterviewStatusIndicator
                  currentStatus={feedbackData[0]?.status}
                  isExpanded={isExpanded}
                />
              </div>

              {/* Navigation Tabs */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-8 border-none border-gray-200">
                  {[
                    "Details",
                    "Experience details",
                    "Availability",
                    "Feedback",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-1 text-sm font-medium ${
                        activeTab === tab
                          ? "border-b-2 border-custom-blue text-custom-blue"
                          : "text-custom-blue"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  className="bg-custom-blue text-white text-sm px-3 py-1 lg:px-6 xl:px-6 2xl:px-6 lg:py-2 xl:py-2 2xl:py-2 rounded-md hover:bg-custom-blue"
                  onClick={handleChangeStatus}
                >
                  Change Status
                </button>
              </div>
              <div>
                {activeTab === "Details" && (
                  <>
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-6">
                        Basic Details:
                      </h3>
                      <div
                        className={`grid gap-y-6 ${
                          isExpanded
                            ? "grid-cols-1 "
                            : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
                        }`}
                      >
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Name
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.firstName || "Not Provided"}
                          </span>
                        </div>

                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Profile ID
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.profileId || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Email Address
                          </span>
                          {interviewer?.email ? (
                            <a
                              href={`mailto:${interviewer.email}`}
                              className="text-blue-600 hover:underline flex-1 break-words"
                            >
                              {interviewer.email}
                            </a>
                          ) : (
                            <span className="text-gray-600 flex-1">
                              Not Provided
                            </span>
                          )}
                        </div>

                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Phone Number
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.phone || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            LinkedIn URL
                          </span>
                          {interviewer?.linkedinUrl ? (
                            <a
                              href={interviewer.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex-1 break-words"
                            >
                              {interviewer.linkedinUrl}
                            </a>
                          ) : (
                            <span className="text-gray-600 flex-1">
                              Not Provided
                            </span>
                          )}
                        </div>
                      </div>

                      <hr className="border-gray-200 my-8" />
                      <h3 className="text-lg font-semibold mb-6">
                        Additional Details:
                      </h3>
                      {/* <div className="grid lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-6">
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Current Role
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.currentRole || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Industry
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.industry || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32 whitespace-nowrap ">
                            Years of Experience
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.yearsOfExperience || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Location
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.location || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8 col-span-2">
                          <span className="text-gray-700 font-medium w-32">
                            Introduction
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.Introduction || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Resume
                          </span>
                          <span className="text-gray-600 flex-1">
                            {interviewer?.resume?.filename || "Not Provided"}
                          </span>
                        </div>
                      </div> */}
                      {/* <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-6 gap-x-6"> */}
                      <div
                        className={`grid gap-y-6 gap-x-6 ${
                          isExpanded
                            ? "grid-cols-1"
                            : "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
                        }`}
                      >
                        <div className="flex flex-wrap gap-8">
                          <span className="text-gray-700 font-medium w-32 shrink-0">
                            Current Role
                          </span>
                          <span className="text-gray-600 flex-1 break-words min-w-0">
                            {interviewer?.currentRole || "Not Provided"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-8">
                          <span className="text-gray-700 font-medium w-32 shrink-0">
                            Industry
                          </span>
                          <span className="text-gray-600 flex-1 break-words min-w-0">
                            {interviewer?.industry || "Not Provided"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-8">
                          <span className="text-gray-700 font-medium w-32 shrink-0 whitespace-nowrap">
                            Experience
                          </span>
                          <span className="text-gray-600 flex-1 break-words min-w-0">
                            {interviewer?.yearsOfExperience || "Not Provided"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-8">
                          <span className="text-gray-700 font-medium w-32 shrink-0">
                            Location
                          </span>
                          <span className="text-gray-600 flex-1 break-words min-w-0">
                            {interviewer?.location || "Not Provided"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-8 col-span-1 lg:col-span-2">
                          <span className="text-gray-700 font-medium w-32 shrink-0">
                            Introduction
                          </span>
                          <span className="text-gray-600 flex-1 break-words min-w-0">
                            {interviewer?.Introduction || "Not Provided"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-8">
                          <span className="text-gray-700 font-medium w-32 shrink-0">
                            Resume
                          </span>
                          {interviewer?.resume?.path ? (
                            <a
                              href={interviewer.resume.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex-1 break-words min-w-0"
                            >
                              {interviewer.resume.filename}
                            </a>
                          ) : (
                            <span className="text-gray-600 flex-1 break-words min-w-0">
                              Not Provided
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-8">
                          <span className="text-gray-700 font-medium w-32 shrink-0">
                            Cover Letter
                          </span>
                          {interviewer?.resume?.path ? (
                            <a
                              href={interviewer.coverLetter.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex-1 break-words min-w-0"
                            >
                              {interviewer.coverLetter.filename}
                            </a>
                          ) : (
                            <span className="text-gray-600 flex-1 break-words min-w-0">
                              Not Provided
                            </span>
                          )}
                        </div>
                      </div>

                      <hr className="border-gray-200 my-8" />
                      <h3 className="text-lg font-semibold mb-6">
                        System Details:
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-6">
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Created By
                          </span>
                          <span className="text-gray-600 flex-1">
                            {formatDate(interviewer?.createdAt)}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <span className="text-gray-700 font-medium w-32">
                            Modified By
                          </span>
                          <span className="text-gray-600 flex-1">
                            {formatDate(interviewer?.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "Experience details" && (
                  <>
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-semibold mb-6">
                            Skills and Experience Details:
                          </h3>
                          <div className="space-y-6">
                            <div className="flex gap-20">
                              <span className="text-gray-700 font-medium w-32">
                                Technology
                              </span>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                                {interviewer?.technologies?.map(
                                  (technology, index) => (
                                    <div
                                      key={index}
                                      className="inline-block bg-blue-100 text-gray-800 px-3 py-1 rounded-full shadow-sm"
                                    >
                                      {technology}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="flex gap-20">
                              <span className="text-gray-700 font-medium w-32">
                                Skills
                              </span>
                              <span className="text-gray-600">
                                {interviewer?.skills?.join(", ")}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <p className="text-gray-700 font-medium">
                                Do you have any previous experience conducting
                                interviews?
                              </p>
                              <div className="flex gap-40">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="experience"
                                    disabled
                                    checked={hasInterviewExperience}
                                    onChange={() =>
                                      setHasInterviewExperience(true)
                                    }
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  <span className="text-gray-600">Yes</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="experience"
                                    disabled
                                    checked={!hasInterviewExperience}
                                    onChange={() =>
                                      setHasInterviewExperience(false)
                                    }
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  <span className="text-gray-600">No</span>
                                </label>
                              </div>
                            </div>

                            {/* Conditionally render expertise level section */}
                            {hasInterviewExperience && (
                              <div className="space-y-2">
                                <p className="text-gray-700 font-medium">
                                  Choose your level of expertise (comfort) in
                                  conducting interviews
                                </p>
                                <div className="flex gap-16">
                                  {[
                                    {
                                      label: "Junior (0-1 years)",
                                      value: "junior",
                                    },
                                    {
                                      label: "Mid-level (2-5 years)",
                                      value: "mid-level",
                                    },
                                    {
                                      label: "Senior (6-8 years)",
                                      value: "senior",
                                    },
                                    { label: "Lead (8+ years)", value: "lead" },
                                  ].map((option) => (
                                    <label
                                      key={option.value}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="radio"
                                        name="expertise"
                                        disabled
                                        value={option.value}
                                        checked={
                                          expertiseLevel === option.value
                                        }
                                        onChange={(e) =>
                                          setExpertiseLevel(e.target.value)
                                        }
                                        className="text-teal-600 focus:ring-teal-500"
                                      />
                                      <span className="text-gray-600 whitespace-nowrap">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <hr className="border-t border-gray-200" />

                        <div>
                          <h3 className="text-lg font-semibold mb-6">
                            Compensation Details:
                          </h3>
                          <div className="space-y-6">
                            <div className="flex gap-20">
                              <span className="text-gray-700 whitespace-nowrap font-medium w-32">
                                Expected Rate per Hour
                              </span>
                              <span className="text-gray-600">
                                {interviewer?.ExpectedRateMin} $ to{" "}
                                {interviewer?.ExpectedRateMax} $
                              </span>
                            </div>

                            {/* Mock Interview Question */}
                            <div className="space-y-2">
                              <p className="text-gray-700 font-medium">
                                Are you ready to take mock interviews?
                              </p>
                              <div className="flex gap-40">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="mockInterviews"
                                    disabled
                                    checked={readyToTakeMockInterview}
                                    onChange={() =>
                                      setReadyToTakeMockInterview(true)
                                    }
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  <span className="text-gray-600">Yes</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="mockInterviews"
                                    disabled
                                    checked={!readyToTakeMockInterview}
                                    onChange={() =>
                                      setReadyToTakeMockInterview(false)
                                    }
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  <span className="text-gray-600">No</span>
                                </label>
                              </div>
                            </div>
                            {/* Show Expected Rate Only if Ready for Mock Interviews */}
                            {readyToTakeMockInterview && (
                              <div className="flex gap-20">
                                <span className="text-gray-700 whitespace-nowrap font-medium w-32">
                                  Expected Rate per Hour
                                </span>
                                <span className="text-gray-600">
                                  {interviewer?.ExpectedRatePerMockInterviewMin}{" "}
                                  $ to{" "}
                                  {interviewer?.ExpectedRatePerMockInterviewMax}{" "}
                                  $
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <hr className="border-t border-gray-200" />

                        {readyToTakeMockInterview && (
                          <div>
                            <h3 className="text-lg font-semibold mb-6">
                              No-Show Policy Details:
                            </h3>
                            <div className="space-y-2">
                              <p className="text-gray-700 font-medium">
                                Policy for No-Show Cases
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                {options.map((option) => (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name="policy"
                                      disabled
                                      value={option.value}
                                      checked={noShowPolicy === option.value}
                                      onChange={(e) =>
                                        setNoShowPolicy(e.target.value)
                                      }
                                      className="text-teal-600 focus:ring-teal-500"
                                    />

                                    <span className="text-gray-600">
                                      {option.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "Availability" && (
                  <>
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-6">
                        Availability:
                      </h3>
                      <div className="grid gap-y-6">
                        {/* Time Zone */}
                        <div className="flex gap-4">
                          <span className="text-gray-700 font-medium w-32">
                            Time Zone
                          </span>
                          <span className="text-gray-600 flex-1">
                            {timeZone}
                          </span>
                        </div>

                        {/* Preferred Interview Duration */}
                        <div className="flex flex-col gap-4">
                          <span className="text-gray-700 font-medium">
                            Preferred Interview Duration
                          </span>
                          <div className="flex gap-4">
                            {[
                              "30 mints",
                              "45 mints",
                              "60 mints",
                              "90 mints",
                            ].map((duration) => (
                              <button
                                key={duration}
                                disabled
                                onClick={() => setSelectedDuration(duration)}
                                className={`px-4 py-2 rounded border ${
                                  selectedDuration === duration
                                    ? "bg-teal-600 text-white border-teal-600"
                                    : "border-gray-300 text-gray-600"
                                }`}
                              >
                                {duration}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Availability
                          from="outsourceInterviewerAdmin"
                          times={times}
                          onTimesChange={setTimes}
                        />
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "Feedback" && (
                  <>
                    <div className="bg-white border min-h-screen border-gray-200 p-6 rounded-lg">
                      <h2 className="text-lg font-medium mb-4">Feedback:</h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-x-20">
                          <span className="text-gray-700 font-medium w-24">
                            Status
                          </span>
                          <span className="text-gray-600">
                            {feedbackData[0]?.status}
                          </span>
                        </div>
                        <div className="flex items-start gap-x-20">
                          <span className="text-gray-700 font-medium w-24">
                            Rating
                          </span>
                          <span className="text-gray-600">
                            {feedbackData[0]?.feedback[0]?.rating}
                          </span>
                        </div>
                        <div className="flex items-start gap-x-20">
                          <span className="text-gray-700 font-medium w-24">
                            Notes
                          </span>
                          <span className="text-gray-600">
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
