// v1.0.0 - Ashok - add first letter capital function
// v1.0.1 - Ashok - improved responsiveness
// v1.0.2 - Ashok - changed placement of edit mock interview button
// v1.0.3 - Ashok - fixed style related issues

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  // Plus,
  Edit,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
// import axios from "axios";
import StatusBadge from "../CommonCode-AllTabs/StatusBadge.jsx";
import Breadcrumb from "../CommonCode-AllTabs/Breadcrumb.jsx";
import MoockRoundCard from "./MockInterviewRoundCard.jsx";
import MockCandidateDetails from "./MockinterviewCandidate.jsx";
import { useMockInterviewById } from "../../../../apiHooks/useMockInterviews.js";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import MeetPlatformBadge from "../../../../utils/MeetPlatformBadge/meetPlatformBadge.js";

const MockInterviewDetails = () => {
  const { id } = useParams();
  const { mockInterview: mockinterview, isLoading } = useMockInterviewById(id);

  const navigate = useNavigate();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [expandedRounds, setExpandedRounds] = useState({});

  const handleView = (candidate) => {
    if (!candidate) return; // Prevents error if candidate is undefined
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };
  const [candidate, setCandidate] = useState([]);
  const [rounds, setRounds] = useState([]);

  // Track expanded rounds

  useEffect(() => {
    if (mockinterview) {
      setCandidate(mockinterview || null);
      const roundsData = mockinterview?.rounds;
      setRounds(
        Array.isArray(roundsData) ? roundsData : roundsData ? [roundsData] : []
      );
    }
  }, [mockinterview]);

  // v1.0.0 <----------------------------------------------------------------
  useEffect(() => {
    if (rounds.length > 0) {
      setExpandedRounds({ [rounds[0]._id]: true }); // Open first round
    }
  }, [rounds]);

  // v1.0.0 ---------------------------------------------------------------->

  // const [activeRound, setActiveRound] = useState(null);
  // const [roundsViewMode, setRoundsViewMode] = useState('vertical');

  // Entity details state
  // const [entityDetailsSidebar, setEntityDetailsSidebar] = useState(null);
  // const [entityDetailsModal, setEntityDetailsModal] = useState(null);

  // useEffect(() => {
  //   if (rounds) {
  //     // Set the active round to the first non-completed round
  //     const nextRound = rounds
  //       .filter(round => ['Pending', 'Scheduled'].includes(round.status))
  //       .sort((a, b) => a.sequence - b.sequence)[0];

  //     if (nextRound) {
  //       setActiveRound(nextRound._id);
  //     } else {
  //       // If all rounds are completed, set the last round as active
  //       const lastRound = [...rounds].sort((a, b) => b.sequence - a.sequence)[0];
  //       if (lastRound) {
  //         setActiveRound(lastRound._id);
  //       }
  //     }
  //   }
  // }, [rounds]);

  // Ensure hooks are always called before any conditional return
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  if (!mockinterview) {
    return (
      <div className="flex justify-center items-center h-screen">
        No interview found
      </div>
    );
  }

  // Toggle round expansion
  const toggleRound = (roundId) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundId]: !prev[roundId],
    }));
  };

  // Check if a round is expanded
  const isExpanded = (roundId) => !!expandedRounds[roundId];

  if (!mockinterview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Breadcrumb
              items={[
                { label: "Interviews", path: "/interviews" },
                { label: "Not Found" },
              ]}
            />
            <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Interview not found.</p>
              <Link
                to="/mock-interview"
                className="text-custom-blue hover:text-custom-blue/90 flex items-center mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Interviews
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Count internal and external interviewers across all rounds
  const allInterviewerIds = new Set();
  // const internalInterviewerIds = new Set();
  const externalInterviewerIds = new Set();

  // const updateInterviewStatus = async (newStatus, reason = null) => {
  //   if (rounds) {
  //     const interviewData = {
  //       status: newStatus,
  //       ...(reason && { completionReason: reason }), // Add reason only if provided
  //     };

  //     try {
  //       await axios.post(`${config.REACT_APP_API_URL}/interview`, {
  //         ...interviewData,
  //         interviewId: id,
  //         updatingInterviewStatus: true,
  //       });
  //     } catch (error) {
  //       console.error("Error updating interview status:", error);
  //     }
  //   }
  // };

  // Call this function for completion with a reason
  // const handleCompleteWithReason = (reason) => {
  //   updateInterviewStatus("Completed", reason);
  //   setShowCompletionModal(false);
  // };

  // Call this function for cancellation

  /*************  ✨ Windsurf Command 🌟  *************/
  /**
   * Check if the user can add a new round to the mock interview
   * @returns {boolean} True if the user can add a new round, false otherwise
   */
  const canAddRound = () => {
    // Check if the mock interview is in draft status
    // If it is, then the user can add a new round
    return mockinterview?.rounds?.status === "Draft";
  };
  /*******  0f06b6ee-9185-481b-bd68-17acfa422ab0  *******/

  // const canEditRound = (round) => {
  //   return mockinterview?.status === 'Draft' && round.status !== 'Completed';
  // };

  // const handleEditRound = (round) => {
  //   navigate(`/interviews/${id}/rounds/${round._id}`);
  // };

  const handleAddRound = () => {
    navigate(`/mock-interview/${id}/edit`, {
      state: { from: "tableMode" },
    });
    // navigate(`/interviews/${id}/rounds/new`);
  };

  // const handleSelectRound = (roundId) => {
  //   setActiveRound(roundId);
  // };

  // const toggleViewMode = () => {
  //   setRoundsViewMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  // };

  // const pendingRounds = rounds?.filter(round =>
  //   ['Pending', 'Scheduled'].includes(round.status)
  // );

  // const handleViewEntityDetails = (
  //   entity,
  //   type,
  //   viewType = 'sidebar'
  // ) => {
  //   if (viewType === 'sidebar') {
  //     setEntityDetailsSidebar({ entity, type });
  //     setEntityDetailsModal(null);
  //   } else {
  //     setEntityDetailsModal({ entity, type });
  //     setEntityDetailsSidebar(null);
  //   }
  // };

  // Handle opening entity in new modal
  // const handleOpenEntityInNew = (entity, type) => {
  //   setEntityDetailsModal({ entity, type });
  //   setEntityDetailsSidebar(null);
  // };

  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: "Mock Interview",
      path: "/mock-interview",
    },
    {
      label: candidate?.candidateName || "Mock Interview",
      path: `/interviews/${id}`,
      status: mockinterview?.status,
    },
  ];

  // Calculate progress percentage
  const completedRounds =
    rounds?.filter((round) => round.status === "Completed").length || 0;
  const totalRounds = rounds?.length || 0;
  const progressPercentage =
    totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  // Check if all rounds are completed
  // const allRoundsCompleted = totalRounds > 0 && completedRounds === totalRounds;

  // Normalize rounds for calculations
  const normalizedRounds = Array.isArray(rounds)
    ? rounds
    : rounds
    ? [rounds]
    : [];

  console.log(mockinterview);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center mb-4">
              <Link
                to="/mock-interview"
                className="text-custom-blue hover:text-custom-blue/90 flex items-center mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Interviews
              </Link>
            </div>

            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              {/* v1.0.2 <------------------------------------------------------------------------- */}
              <div className="flex flex-row justify-between items-start sm:items-center px-4 py-5 sm:px-6 gap-4">
                <div>
                  {/* v1.0.1 <----------------------------------------------------------------------------- */}
                  <h3 className="flex items-center text-lg leading-6 font-medium text-gray-900 gap-3">
                    Mock Interview Details
                    {mockinterview?.rounds[0]?.status && (
                      <span className="ml-1">
                        <StatusBadge
                          status={mockinterview?.rounds[0]?.status}
                          size="md"
                        />
                      </span>
                    )}
                  </h3>
                  {/* v1.0.1 -----------------------------------------------------------------------------> */}
                  {/* v1.0.0 <--------------------------------------------------------------- */}
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Created on{" "}
                    {mockinterview?.createdAt
                      ? new Date(mockinterview?.createdAt)?.toLocaleDateString()
                      : "N/A"}
                  </p>
                  {/* v1.0.0 ---------------------------------------------------------------> */}
                </div>
                <div className="flex space-x-2">
                  {![
                    "Completed",
                    "Rejected",
                    "Selected",
                    "Scheduled",
                    "Cancelled",
                    "RequestSent",
                  ].includes(rounds[0]?.status) &&
                    mockinterview?.rounds[0]?.interviewType.toLowerCase() ===
                      "instant" &&
                    mockinterview?.rounds[0]?.status.toLowerCase() ===
                      "draft" && (
                      <button
                        onClick={handleAddRound}
                        // to={`/mock-interview/${id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden inline">Edit Interview</span>
                      </button>
                    )}

                  {/* <Link
                    to={`/mock-interview/${id}/edit`}
                    // onClick={() =>  navigate(`/mock-interview/${mockinterview._id}/edit`, { state: { from: location.pathname }})}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4 sm:mr-0 mr-1" />
                    <span className="sm:hidden inline">Edit Interview</span>
                  </Link> */}
                </div>
              </div>
              {/* v1.0.2 -------------------------------------------------------------------------> */}
              {/* v1.0.1 <------------------------------------------------------ */}
              <div className="border-t border-gray-200 px-4 py-5">
                {/* v1.0.1 ------------------------------------------------------> */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-1">
                  <div className="sm:col-span-1">
                    {/* <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-5 w-5 mr-1" />
                      Candidate
                    </dt> */}
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="mr-0 mb-3 sm:mb-0 sm:mr-3">
                          {candidate?.imageData ? (
                            <img
                              src={candidate.imageData?.path}
                              alt={candidate?.candidateName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-6 font-medium">
                            {candidate?.candidateName || "Unknown"}
                            <div>
                              {candidate && (
                                <>
                                  <button
                                    title="View Details"
                                    // onClick={() => handleViewEntityDetails(candidate, 'candidate', 'sidebar')}
                                    onClick={() => handleView(candidate)}
                                    className="inline-flex items-center outline-none"
                                  >
                                    <ExternalLink className="h-4 w-4 text-custom-blue" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Role: {candidate?.currentRole}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Experience: {candidate?.currentExperience} Years
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Skills
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {candidate?.skills?.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-custom-blue border border-gray-200 font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </dd>
                  </div>
                </div>
                <div className="mt-10">
                  <dt className="text-sm font-medium text-gray-500">
                    Progress
                  </dt>
                  <dd className="mt-1">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">
                        {completedRounds} of {totalRounds} rounds completed
                      </span>
                      <span className="text-sm font-medium text-custom-blue">
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-custom-blue h-2.5 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </dd>
                </div>

                {/* Interviewers summary */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Interviewers
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <span className="font-medium">{internalInterviewerIds.size}</span> Internal
                    </div> */}
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <span className="font-medium">
                        {externalInterviewerIds.size}
                      </span>{" "}
                      Outsourced
                    </div>
                    <div className="px-3 py-1 bg-custom-blue/10 text-custom-blue rounded-full text-sm">
                      <span className="font-medium">
                        {allInterviewerIds.size}
                      </span>{" "}
                      Total
                    </div>
                  </div>
                </div>

                {/* Interview Rounds Table Header */}
                {/* v1.0.1 <---------------------------------------------- */}
                <div className="border-t border-gray-200 py-5">
                  {/* v1.0.1 ----------------------------------------------> */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg leading-6 font-medium text-gray-900">
                      Mock Interview Round
                    </h3>
                  </div>
                  {/* <InterviewProgress
                    rounds={normalizedRounds}
                    interviewId={id}
                    currentRoundId={activeRound || undefined}
                    // viewMode={roundsViewMode}
                    onSelectRound={handleSelectRound}
                  /> */}
                  {rounds.length > 0 && (
                    <div className="mt-6">
                      <div className="space-y-4">
                        {normalizedRounds.map((round) => (
                          <div
                            key={round._id}
                            className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
                            // className="bg-white rounded-lg shadow-md overflow-hidden"
                          >
                            <button
                              onClick={() => toggleRound(round._id)}
                              className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                              <div className="flex items-center">
                                {/* <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 mr-2">
                                  <span className="text-sm font-medium">
                                    {round.sequence + 1}
                                  </span>
                                </div> */}
                                <div>
                                  {/* v1.0.1 <------------------------------------------------------------------------------------------------------- */}
                                  <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold text-gray-900">
                                    {/* v1.0.1 -------------------------------------------------------------------------------------------------------> */}
                                    {round.roundTitle}
                                  </h3>
                                  {/* v1.0.0 <-------------------------------------------------------------------------- */}
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <span className="mr-2">
                                      {capitalizeFirstLetter(
                                        round?.interviewType
                                      )}
                                    </span>
                                    <span>•</span>
                                    <span className="mx-2">
                                      {capitalizeFirstLetter(
                                        round?.interviewMode
                                      )}
                                    </span>
                                    <span className="mr-2">•</span>
                                    <MeetPlatformBadge
                                      platform={round?.meetPlatform}
                                    />
                                  </div>
                                  {/* v1.0.0 <-------------------------------------------------------------------------- */}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {isExpanded(round.id) ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </button>

                            {isExpanded(round._id) && (
                              // v1.0.1 <----------------------------------------
                              <div className="sm:px-0 px-4 pb-4">
                                {/* v1.0.1 ----------------------------------------> */}
                                <MoockRoundCard
                                  mockinterview={mockinterview}
                                  round={round}
                                  // canEdit={canEditRound(round)}
                                  // onEdit={() => onEditRound(round)}
                                  isActive={false}
                                  hideHeader={true}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {normalizedRounds.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No rounds added yet.</p>
                      {/* {canAddRound() && ( */}

                      {/* <button
                        onClick={handleAddRound}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue  focus:outline-none "
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Round
                      </button> */}
                      {/* )} */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* {showFinalFeedbackModal && (
          <FinalFeedbackModal
            onClose={() => setShowFinalFeedbackModal(false)}
            interviewId={id}
          />
        )} */}

        {/* Confirmation Modal for cancle interview */}
        {/* {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4">
                Are you sure you want to cancel this interview?
              </h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  No
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* {showCompletionModal && (
          <CompletionReasonModal
            onClose={() => setShowCompletionModal(false)}
            onComplete={handleCompleteWithReason}
            pendingRoundsCount={pendingRounds.length}
            interviewId={id}
            interview={interview}
          />
        )} */}

        {/* Entity Details Sidebar */}
        {/* {entityDetailsSidebar && (
          <EntityDetailsSidebar
            onClose={() => setEntityDetailsSidebar(null)}
            entity={entityDetailsSidebar.entity}
            entityType={entityDetailsSidebar.type}
            onOpenInNew={() => handleOpenEntityInNew(entityDetailsSidebar.entity, entityDetailsSidebar.type)}
          />
        )}

        {entityDetailsModal && (
          <EntityDetailsModal
            onClose={() => setEntityDetailsModal(null)}
            entity={entityDetailsModal.entity}
            entityType={entityDetailsModal.type}
          />
        )} */}
        {selectCandidateView === true && (
          <MockCandidateDetails
            candidate={selectedCandidate}
            onClose={() => setSelectCandidateView(null)}
          />
        )}
        {/* {selectPositionView === true && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(null)}
        />
      )} */}
      </div>
    </>
  );
};

export default MockInterviewDetails;
