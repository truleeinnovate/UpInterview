// v1.0.0  - mansoor - added the path in the top to go back
// v1.0.1 - Ranjith - added the mode to the postion tab for the inetrview mode
// v1.0.2 - Ashok - modified some styles
// v1.0.3 - Ashok - fixed default view and unique key issue
// v1.0.4 - Ashok - Improved responsiveness
// v1.0.5 - Ashok - Fixed issues in responsiveness for activity
// v1.0.6 - Ashok - change placement of edit position button
// v1.0.7 - Ashok - changed Salary Range to Salary Range (Annual)

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  LayoutList,
  LayoutGrid,
  Edit,
  Users,
  ArrowLeft,
  IdCard,
  BarChart3,
  FileText,
} from "lucide-react";
import Modal from "react-modal";
import InterviewProgress from "../Interview-New/components/InterviewProgress";
import SingleRoundViewPosition from "./PositionRound/SingleRoundViewPosition";
import VerticalRoundsViewPosition from "./PositionRound/VerticalRoundsViewPosition";
// import Cookies from "js-cookie";
// import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Activity from "../../Tabs/CommonCode-AllTabs/Activity";
import AddCandidateForm from "../Candidate-Tab/AddCandidateForm";
import Loading from "../../../../Components/Loading";
import { usePositionById } from "../../../../apiHooks/usePositions";
import Breadcrumb from "../../Tabs/CommonCode-AllTabs/Breadcrumb";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import ResumeUploadPopup from "./ResumeUploadPopup";

Modal.setAppElement("#root");

const PositionSlideDetails = () => {
  const { id } = useParams();
  const { position: fetchedPosition, isLoading } = usePositionById(id);
  console.log(
    "CURRENT POSITION ============================> ",
    fetchedPosition
  );

  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [roundsViewMode, setRoundsViewMode] = useState("vertical");
  const [position, setPosition] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showResumeUploadPopup, setShowResumeUploadPopup] = useState(false);

  // Count internal and external interviewers across all rounds
  // const allInterviewerIds = new Set();
  // const internalInterviewerIds = new Set();
  // const externalInterviewerIds = new Set();
  const [allInterviewerCount, setAllInterviewerCount] = useState(0);
  const [internalInterviewerCount, setInternalInterviewerCount] = useState(0);
  const [externalInterviewerCount, setExternalInterviewerCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // <----- v1.0.1 - Ranjith -
  const mode = location.state?.mode;
  //   ------ >

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
  // const userId = tokenPayload?.userId;
  // const tenantId = tokenPayload?.tenantId;

  // v1.0.3 <----------------------------------------------------------------------
  // useEffect(() => {
  //   const fetchPosition = async () => {
  //     try {
  //       console.log('started position')
  //       const foundPosition = positionData?.find((pos) => pos._id === id);
  //       console.log("Found Position:", foundPosition);

  //       if (foundPosition) {
  //         setPosition(foundPosition || []);
  //         setRounds(foundPosition.rounds || []);
  //         console.log(`position roumds ------- ${foundPosition.rounds}`);
  //         setActiveRound(foundPosition.rounds[0]?._id);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching template:", error);
  //     }
  //   };
  //   fetchPosition();
  // }, [id, positionData]);

  useEffect(() => {
    if (!fetchedPosition) {
      return;
    }

    try {
      const foundPosition = fetchedPosition;

      const roundsList = foundPosition.rounds || [];

      setPosition(foundPosition);
      setRounds(roundsList);
      setActiveRound(roundsList[0]?._id);

      // If only one round exists, switch to vertical view
      if (roundsList.length === 1) {
        setRoundsViewMode("vertical");
      }

      // ✅ Collect interviewer counts
      const allSet = new Set();
      const internalSet = new Set();
      const externalSet = new Set();

      roundsList.forEach((round) => {
        round?.interviewers?.forEach((interviewer) => {
          if (interviewer?._id) {
            allSet.add(interviewer._id);

            if (round.interviewerType?.toLowerCase() === "internal") {
              internalSet.add(interviewer._id);
            } else if (round.interviewerType?.toLowerCase() === "external") {
              externalSet.add(interviewer._id);
            }
          }
        });
      });

      setAllInterviewerCount(allSet.size);
      setInternalInterviewerCount(internalSet.size);
      setExternalInterviewerCount(externalSet.size);
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  }, [fetchedPosition]);

  // v1.0.3 ---------------------------------------------------------------------->

  const handleAddRound = () => {
    navigate(`/position/view-details/${id}/rounds/new`);
  };

  const handleEditRound = (round) => {
    navigate(`/position/view-details/${id}/rounds/${round._id}`);
  };

  // <-----------------------v1.0.0
  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: "Positions",
      path: "/position",
    },
    {
      label: position?.title || "Position",
      path: `/position/view-details/${id}`,
      status: position?.status,
    },
  ];
  // v1.0.0--------------------------->

  const canEditRound = (round) => {
    return round.status !== "Completed";
  };

  const toggleViewMode = () => {
    if (roundsViewMode === "vertical") {
      setRoundsViewMode("horizontal");
      if (rounds?.length > 0) {
        setActiveRound(rounds[0]._id);
      }
    } else {
      setRoundsViewMode("vertical");
      setActiveRound(null);
    }
  };

  // Calculate progress percentage
  // const completedRounds = rounds?.filter(round => round.status === 'Completed').length || 0;
  // const totalRounds = rounds?.length || 0;
  // const progressPercentage = totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  const tabs = [
    { id: "Details", name: "Details", icon: FileText },
    { id: "Activity", name: "Feeds", icon: BarChart3 },
  ];

  if (isLoading || !position) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loading />
      </div>
    );
  }

  // Get user token information and check organization field
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const isOrganization = tokenPayload?.organization === true;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* v1.0.4 <------------------------------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto sm:px-6 md:px-6 lg:px-8 xl:px-8 2xl:px-8 bg-white shadow overflow-hidden sm:rounded-lg mb-4">
        {/* <-------------------------v1.0.0  */}
        {/* // <----- v1.0.1 - Ranjith - */}
        {/* Header */}
        <div className="flex flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8 pt-6">
          <button
            onClick={() =>
              mode === "Interview" ? navigate(-1) : navigate("/position")
            }
            // onClick={() => navigate("/position")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">
              Back to {mode === "Interview" ? "Interview" : "Positions"}
            </span>
          </button>
        </div>

        {mode !== "Interview" && <Breadcrumb items={breadcrumbItems} />}
        {/*  -------------------------------> */}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {["Overview", "Candidates", "Applications", "Interviews", "Activity Feed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab
                  ? "border-custom-blue text-custom-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        {/* v1.0.4 ------------------------------------------------------------------------------------------> */}

        {/* v1.0.0---------------------------> */}

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="flex-1 relative">
            {/* v1.0.8 - Updated Header Section */}
            <div className="flex flex-row sm:flex-col items-center justify-between gap-4 py-4 px-1 bg-gray-50/50 rounded-lg mb-6">
              {/* Left Side - Title, Company & Status */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {position?.title
                    ? position.title.charAt(0).toUpperCase() +
                    position.title.slice(1)
                    : "Position"}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-600 text-sm">
                    Company: {position?.companyname?.name || "N/A"}
                  </p>
                  {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {position?.status || "Open"}
                  </span> */}
                </div>
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/position/edit-position/${position?._id}`}
                  state={{ from: location.pathname }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit Position
                </Link>
                <button
                  onClick={() => setShowResumeUploadPopup(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Upload Resumes
                </button>
                <button
                  onClick={() => setShowAddCandidateModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                >
                  <Users className="h-4 w-4 mr-1.5" />
                  Add Candidate
                </button>
              </div>
            </div>
            {/* v1.0.8 - End Header Section */}

            <div className="space-y-6">

              {/* {position.rounds?.length === 0
                // && template.rounds?.length === 0
                && (
                  <div className="mb-1 sm:mb-4 rounded-xl border mt-2 border-yellow-300 bg-yellow-50 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="inline-flex items-center justify-center w-4 h-5 rounded-full  text-yellow-700">
                          ⚠️
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-yellow-800">This Position is currently in <strong>Draft</strong> status.</h4>
                          <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                            Add at least one interview round to make this Position usable. Position without rounds are not recommended.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )} */}

              <div className="space-y-4">
                {/* 3-Column Layout for Position Details */}
                <div className="grid grid-cols-3 sm:grid-cols-1 gap-6">
                  {/* Position Details Column */}
                  <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-4">Position Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-custom-blue mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-800">{position?.Location || "Not Disclosed"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-4 h-4 text-custom-blue mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Employment Type</p>
                          <p className="font-medium text-gray-800">{position?.employmentType ? position.employmentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-custom-blue mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Open Date</p>
                          <p className="font-medium text-gray-800">
                            {position?.createdAt
                              ? new Date(position.createdAt).toLocaleDateString('en-CA')
                              : "Not Available"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-custom-blue font-bold text-sm">#</span>
                        <div>
                          <p className="text-sm text-gray-500">No. of Positions</p>
                          <p className="font-medium text-gray-800">{position?.NoofPositions || 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Compensation Column */}
                  <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-4">Experience & Compensation</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-4 h-4 text-custom-blue mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Experience Required</p>
                          <p className="font-medium text-gray-800">
                            {position?.minexperience && position?.maxexperience
                              ? `${position.minexperience}-${position.maxexperience} years`
                              : "Not Disclosed"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-custom-blue font-bold text-sm">₹</span>
                        <div>
                          <p className="text-sm text-gray-500">Salary Range (Annual)</p>
                          <p className="font-medium text-gray-800">
                            {position?.minSalary && position?.maxSalary
                              ? `₹${position.minSalary?.toLocaleString()} - ₹${position.maxSalary?.toLocaleString()}`
                              : position?.minSalary
                                ? `₹${position.minSalary?.toLocaleString()} - Not Disclosed`
                                : position?.maxSalary
                                  ? `₹0 - ₹${position.maxSalary?.toLocaleString()}`
                                  : "Not Disclosed"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-custom-blue mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Interview Template</p>
                          <p className="font-medium text-gray-800">{position?.templateId?.title || "Not Assigned"}</p>
                        </div>
                      </div>
                      {position?.externalId && (
                        <div className="flex items-start gap-3">
                          <span className="text-custom-blue font-bold text-sm">#</span>
                          <div>
                            <p className="text-sm text-gray-500">External ID</p>
                            <p className="font-medium text-gray-800">{position.externalId}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hiring Team Column */}
                  <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-4">Hiring Team</h4>
                    {/* <div className="space-y-3"> */}
                    {/* Static Hiring Team members */}
                    {/* <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                          M
                        </div>
                        <p className="font-medium text-gray-800 text-sm">
                          Michael Roberts <span className="text-gray-500 font-normal">(CTO)</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                          J
                        </div>
                        <p className="font-medium text-gray-800 text-sm">
                          Jennifer Lee <span className="text-gray-500 font-normal">(Salesforce Architect)</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                          D
                        </div>
                        <p className="font-medium text-gray-800 text-sm">
                          David Chen <span className="text-gray-500 font-normal">(Senior Developer)</span>
                        </p>
                      </div>
                    </div> */}
                    <p className="text-gray-400 italic text-sm">
                      No Hiring Team assigned
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div className="bg-gray-50 rounded-lg p-6 w-full">
                <h4 className="font-semibold text-gray-800 mb-3">Job Description</h4>
                {position?.jobDescription ? (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {position.jobDescription}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No Job Description Provided
                  </p>
                )}
              </div>

              {/* Requirements Section */}
              <div className="bg-gray-50 rounded-lg p-6 w-full">
                <h4 className="font-semibold text-gray-800 mb-3">Requirements</h4>
                {position?.requirements ? (
                  <ul className="space-y-2 list-none">
                    {position.requirements.split('\n').filter(line => line.trim()).map((requirement, index) => (
                      <li key={index} className="flex items-baseline gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-custom-blue flex-shrink-0 mt-1.5"></span>
                        <span className="text-gray-600 text-sm">{requirement.trim()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No Requirements Provided
                  </p>
                )}
              </div>
              {/* v1.0.4 <---------------------------------------------------------------------------------- */}
              <div className="bg-white rounded-xl sm:shadow-none shadow-sm sm:border-none border border-gray-100 sm:p-0 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Skills
                </h4>
                <div className="flex flex-wrap sm:gap-4 gap-2">
                  {/* <------v1.0.0 ------ */}
                  {/* v1.0.3 <---------------------------------------------------------- */}
                  {/* {position?.skills ? (
                    position.skills.map((skill, index) => (
                      <>

                        <div className="flex gap-2 justify-center w-full px-3 py-3 space-x-2 bg-custom-bg rounded-full border border-blue-100">
                          <span
                            key={index}
                            className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                          >
                            {skill.skill}
                          </span>
                          <span
                            key={index}
                            className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                          >
                            {skill.experience}
                          </span>
                          <span
                            key={index}
                            className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200"
                          >
                            {skill.expertise}
                          </span>
                        </div>

                      </>
                    ))
                  ) : (
                    <span>No skills found</span>
                  )} */}
                  {position?.skills?.length > 0 ? (
                    position.skills.map((skill, index) => (
                      // <div
                      //   key={`skill-${index}`}
                      //   className="flex gap-2 justify-center w-full px-3 py-3 space-x-2 bg-custom-bg rounded-full border border-blue-100"
                      // >
                      //   <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                      //     {skill.skill}
                      //   </span>
                      //   <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                      //     {skill.experience}
                      //   </span>
                      //   <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                      //     {skill.expertise}
                      //   </span>
                      // </div>
                      <div
                        key={`skill-${index}`}
                        // className="flex gap-2 justify-center w-full px-3 py-3 bg-custom-bg rounded-full border border-blue-100"
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-2 w-full px-3 py-3 bg-custom-bg rounded-lg md:rounded-full lg:rounded-full xl:rounded-full 2xl:rounded-full border border-blue-100"
                      >
                        <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          <span className="truncate max-w-full">
                            {skill.skill}
                          </span>
                        </span>
                        <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          <span className="truncate max-w-full">
                            {skill.expertise}
                          </span>
                        </span>
                        <span className="flex justify-center px-3 py-1.5 w-full items-center bg-white text-custom-blue rounded-full text-sm font-medium border border-blue-200">
                          <span className="truncate max-w-full">
                            {skill.requirement_level === 'REQUIRED' ? 'Must-Have' :
                              skill.requirement_level === 'PREFERRED' ? 'Preferred' :
                                skill.requirement_level === 'NICE_TO_HAVE' ? 'Good to Have' :
                                  skill.requirement_level === 'OPTIONAL' ? 'Optional' : 'Must-Have'}
                          </span>
                        </span>
                      </div>
                    ))
                  ) : (
                    <span>No skills found</span>
                  )}

                  {/* v1.0.3 -----------------------------------------------------------> */}
                  {/* v1.0.0 -------> */}
                </div>
              </div>

              {/* Additional Note */}
              {position?.additionalNotes && <div className="bg-gray-50 rounded-lg p-6 w-full">
                <h4 className="font-semibold text-gray-800 mb-3">Additional Notes</h4>
                {position?.additionalNotes ? (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {position.additionalNotes}
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No Additional Notes Provided
                  </p>
                )}
              </div>}
              {/* v1.0.4 -----------------------------------------------------------------------------------> */}
            </div>

            {/* Interview Rounds Table Header */}
            {/* <div className="border-t border-gray-200 px-4 py-5 sm:px-6"> */}
            {/* v1.0.4 <----------------------------------------------------------------------------- */}
            <div className="py-5">
              <div className="flex justify-between items-center mb-4">
                {/* <h3 className="text-lg leading-6 font-medium text-gray-900"> */}
                <h3 className="sm:text-md text-lg leading-6 font-medium text-gray-900">
                  Position Rounds
                </h3>
                <div className="flex space-x-2">
                  {rounds.length > 0 && (
                    <>
                      {/* v1.0.2 <---------------------------------------------------------------------------------------------- */}
                      {rounds.length > 1 && (
                        // <button
                        //   onClick={toggleViewMode}
                        //   className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        // >
                        //   {roundsViewMode === "vertical" ? (
                        //     <>
                        //       <LayoutGrid className="h-4 w-4 mr-1" />
                        //       Horizontal View
                        //     </>
                        //   ) : (
                        //     <>
                        //       <LayoutList className="h-4 w-4 mr-1" />
                        //       Vertical View
                        //     </>
                        //   )}
                        // </button>
                        <button
                          onClick={toggleViewMode}
                          className="inline-flex items-center sm:px-2 sm:py-2 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          {roundsViewMode === "vertical" ? (
                            <>
                              <LayoutGrid className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
                              <span className="sm:hidden inline">
                                Horizontal View
                              </span>
                            </>
                          ) : (
                            <>
                              <LayoutList className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
                              <span className="sm:hidden inline">
                                Vertical View
                              </span>
                            </>
                          )}
                        </button>
                      )}
                      {/* v1.0.2 ------------------------------------------------------------------------------------------------>  */}
                      <button
                        onClick={handleAddRound}
                        className="inline-flex items-center sm:px-2 sm:py-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:outline-none"
                      >
                        <Plus className="sm:h-5 sm:w-5 h-4 w-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden inline">Add Round</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <InterviewProgress rounds={rounds} />

              {rounds.length > 0 && (
                <div className="mt-6">
                  {roundsViewMode === "horizontal" ? (
                    activeRound && (
                      <SingleRoundViewPosition
                        rounds={rounds}
                        interviewData={null}
                        currentRoundId={activeRound}
                        canEditRound={canEditRound}
                        onEditRound={handleEditRound}
                        onChangeRound={setActiveRound}
                      />
                    )
                  ) : (
                    <VerticalRoundsViewPosition
                      rounds={rounds}
                      interviewData={position}
                      canEditRound={canEditRound}
                      onEditRound={handleEditRound}
                    />
                  )}
                </div>
              )}

              {rounds.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No Rounds Added yet.</p>
                  <button
                    onClick={handleAddRound}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Round
                  </button>
                </div>
              )}
            </div>
            {/* v1.0.4 -----------------------------------------------------------------------------> */}
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === "Candidates" && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidates</h3>
            <p className="text-gray-500">Candidates associated with this position will appear here.</p>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "Applications" && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Applications</h3>
            <p className="text-gray-500">Applications for this position will appear here.</p>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === "Interviews" && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Interviews</h3>
            <p className="text-gray-500">Interviews scheduled for this position will appear here.</p>
          </div>
        )}
        {/* v1.0.5 <------------------------------- */}
        {activeTab === "Activity Feed" && (
          <div className="sm:p-0 p-6">
            <Activity parentId={id} />
          </div>
        )}
        {/* v1.0.5 -------------------------------> */}

        {/* Add Candidate Modal */}
        {showAddCandidateModal && (
          <Modal
            isOpen={showAddCandidateModal}
            onRequestClose={() => setShowAddCandidateModal(false)}
            className="fixed inset-0 flex items-center justify-center z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <AddCandidateForm
                isModal={true}
                onClose={() => setShowAddCandidateModal(false)}
              />
            </div>
          </Modal>
        )}

        {/* Resume Upload Popup */}
        {showResumeUploadPopup && (
          <SidebarPopup
            title="Upload Resumes"
            subTitle={`${position?.title || 'Position'} • Bulk resume screening`}
            onClose={() => setShowResumeUploadPopup(false)}
            icon={<FileText className="w-5 h-5" />}
          >
            <ResumeUploadPopup
              positionId={position?._id}
              positionTitle={position?.title}
              onClose={() => setShowResumeUploadPopup(false)}
            />
          </SidebarPopup>
        )}
      </div>
    </div>
    // v1.0.4 ---------------------------------------------------------------->
  );
};

export default PositionSlideDetails;
