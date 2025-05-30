import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Calendar,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  LayoutList,
  LayoutGrid,
  ExternalLink,
  Users
} from 'lucide-react';


import Breadcrumb from '../../CommonCode-AllTabs/Breadcrumb.jsx';
import InterviewProgress from '../components/InterviewProgress';
import StatusBadge from '../../CommonCode-AllTabs/StatusBadge.jsx';
import FinalFeedbackModal from '../components/FinalFeedbackModal';
import CompletionReasonModal from '../components/CompletionReasonModal';
import SingleRoundView from '../components/SingleRoundView';
import VerticalRoundsView from '../components/VerticalRoundsView';
import EntityDetailsModal from '../components/EntityDetailsModal';
import EntityDetailsSidebar from '../components/EntityDetailsSidebar';
import { useCustomContext } from "../../../../../Context/Contextfetch.js";
import axios from "axios";
// import CandidateDetails from '../../Candidate-Tab/CandidateDetails.jsx';
import PositionSlideDetails from '../../Position-Tab/PositionSlideDetails';
import { config } from '../../../../../config.js';


const InterviewDetail = () => {
  const { id } = useParams();
  const {
    interviewData,
    fetchInterviewData,

  } = useCustomContext();
  useEffect(() => {
    fetchInterviewData();
  }, [fetchInterviewData]);

  const interview = interviewData?.find(interview => interview._id === id);
  console.log("interview", interview);

  const [loading, setLoading] = useState(true);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectPositionView, setSelectPositionView] = useState(false);
  const handleView = (candidate) => {
    if (!candidate) return; // Prevents error if candidate is undefined
    setSelectedCandidate(candidate);
    setSelectCandidateView(true);
  };
  const handleViewPosition = (position) => {
    setSelectedPosition(position);
    setSelectPositionView(true);
  };


  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [position, setPosition] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [template, setTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("rounds", rounds)

  useEffect(() => {
    if (interview) {
      setCandidate(interview?.candidateId || null);
      setPosition(interview?.positionId || null);
      setRounds(interview?.rounds || []);
      setTemplate(interview?.templateId || null)
    }
  }, [interview]);


  const [activeRound, setActiveRound] = useState(null);
  const [showFinalFeedbackModal, setShowFinalFeedbackModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [roundsViewMode, setRoundsViewMode] = useState('vertical');

  // Entity details state
  const [entityDetailsSidebar, setEntityDetailsSidebar] = useState(null);
  const [entityDetailsModal, setEntityDetailsModal] = useState(null);


  useEffect(() => {
    if (rounds) {
      // Set the active round to the first non-completed round
      const nextRound = rounds
        .filter(round => ['Pending', 'Scheduled'].includes(round.status))
        .sort((a, b) => a.sequence - b.sequence)[0];

      if (nextRound) {
        setActiveRound(nextRound._id);
      } else {
        // If all rounds are completed, set the last round as active
        const lastRound = [...rounds].sort((a, b) => b.sequence - a.sequence)[0];
        if (lastRound) {
          setActiveRound(lastRound._id);
        }
      }
    }
  }, [rounds]);

  // Ensure hooks are always called before any conditional return
  if (!interview) {
    return <div className='flex justify-center items-center h-screen'>No interview found</div>;
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Breadcrumb items={[
              { label: 'Interviews', path: '/interviewList' },
              { label: 'Not Found' }
            ]} />
            <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Interview not found.</p>
              <Link to="/interviewList" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
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
  const internalInterviewerIds = new Set();
  const externalInterviewerIds = new Set();

  // rounds.forEach(round => {
  //   round.interviewers?.forEach(id => {
  //     const interviewer = ;
  //     if (interviewer) {
  //       allInterviewerIds.add(id);
  //       if (interviewer.isExternal) {
  //         externalInterviewerIds.add(id);
  //       } else {
  //         internalInterviewerIds.add(id);
  //       }
  //     }
  //   });
  // });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // cancle interviwe popup


  const handleStatusChange = (newStatus) => {
    if (rounds) {
      const updatedInterview = {
        status: newStatus
      };
    }
  };

  const updateInterviewStatus = async (newStatus, reason = null) => {
    if (rounds) {
      const interviewData = {
        status: newStatus,
        ...(reason && { completionReason: reason }) // Add reason only if provided
      };

      try {
        await axios.post(`${config.REACT_APP_API_URL}/interview`, {
          ...interviewData,
          interviewId: id,
          updatingInterviewStatus: true
        });
      } catch (error) {
        console.error("Error updating interview status:", error);
      }
    }
  };

  // Call this function for completion with a reason
  const handleCompleteWithReason = (reason) => {
    updateInterviewStatus("Completed", reason);
    setShowCompletionModal(false);
  };

  // Call this function for cancellation
  const confirmCancel = () => {
    updateInterviewStatus("Cancelled");
    setIsModalOpen(false);
  };

  const canAddRound = () => {
    return interview?.status === 'Draft';
  };

  const canEditRound = (round) => {
    return interview?.status === 'Draft' && round.status !== 'Completed';
  };

  const handleEditRound = (round) => {
    navigate(`/interviews/${id}/rounds/${round._id}`);
  };

  const handleAddRound = () => {
    navigate(`/interviews/${id}/rounds/new`);
  };

  const handleSelectRound = (roundId) => {
    setActiveRound(roundId);
  };

  const toggleViewMode = () => {
    setRoundsViewMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const pendingRounds = rounds?.filter(round =>
    ['Pending', 'Scheduled'].includes(round.status)
  );


  const handleViewEntityDetails = (
    entity,
    type,
    viewType = 'sidebar'
  ) => {
    if (viewType === 'sidebar') {
      setEntityDetailsSidebar({ entity, type });
      setEntityDetailsModal(null);
    } else {
      setEntityDetailsModal({ entity, type });
      setEntityDetailsSidebar(null);
    }
  };

  // Handle opening entity in new modal
  const handleOpenEntityInNew = (entity, type) => {
    setEntityDetailsModal({ entity, type });
    setEntityDetailsSidebar(null);
  };

  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: 'Interviews',
      path: '/interviewList'
    },
    {
      label: candidate?.LastName || 'Interview',
      path: `/interviews/${id}`,
      status: interview?.status
    }
  ];

  // Calculate progress percentage
  const completedRounds = rounds?.filter(round => round.status === 'Completed').length || 0;
  const totalRounds = rounds?.length || 0;
  const progressPercentage = totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  // Check if all rounds are completed
  const allRoundsCompleted = totalRounds > 0 && completedRounds === totalRounds;




  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center mb-4">
              <Link to="/interviewList" className="text-blue-600 hover:text-blue-800 flex items-center mr-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Interviews
              </Link>
            </div>

            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Interview Details <span> <StatusBadge status={interview?.status} size="md" /></span>
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Created on {formatDate(interview?.createdAt)}
                  </p>
                </div>

              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-1">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-5 w-5 mr-1" />
                      Candidate
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center">
                        <div className="mr-0 mb-3 sm:mb-0 sm:mr-3">
                          {candidate?.imageUrl ? (
                            <img
                              src={candidate.imageUrl}
                              alt={candidate?.LastName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{candidate?.LastName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {candidate?.Email} • {candidate?.Phone}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Experience: {candidate?.CurrentExperience} years
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {candidate && (
                              <>
                                <button
                                  // onClick={() => handleViewEntityDetails(candidate, 'candidate', 'sidebar')}
                                  onClick={() => handleView(candidate)}

                                  className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  View Details
                                </button>
                                {/* <button
                                  // onClick={() => handleViewEntityDetails(candidate, 'candidate', 'modal')}
                                  onClick={() => handleView(candidate)}

                                  className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  title="Open in popup"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </button> */}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Briefcase className="h-5 w-5 mr-1" />
                      Position
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="font-medium">{position?.title || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {position?.companyname} • {position?.Location}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {position && (
                          <>
                            <button
                              // onClick={() => handleViewEntityDetails(position, 'position', 'sidebar')}
                              onClick={() => handleViewPosition(position)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </button>
                            {/* <button
                              onClick={() => handleViewEntityDetails(position, 'position', 'modal')}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="Open in popup"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button> */}
                          </>
                        )}
                      </div>
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-5 w-5 mr-1" />
                      Template
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="font-medium">{template?.templateName || 'Not selected any template'}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {template && (
                          <>
                            <button
                              onClick={() => handleViewEntityDetails(template, 'template', 'sidebar')}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleViewEntityDetails(template, 'template', 'modal')}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              title="Open in popup"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Progress
                    </dt>
                    <dd className="mt-1">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">
                          {completedRounds} of {totalRounds} rounds completed
                        </span>
                        <span className="text-sm font-medium text-blue-700">
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </dd>
                  </div>
                </div>

                {/* Interviewers summary */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">Interviewers</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <span className="font-medium">{internalInterviewerIds.size}</span> Internal
                    </div>
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <span className="font-medium">{externalInterviewerIds.size}</span> Outsourced
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      <span className="font-medium">{allInterviewerIds.size}</span> Total
                    </div>
                  </div>
                </div>


                {/* Interview Rounds Table Header */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Interview Rounds
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={toggleViewMode}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {roundsViewMode === 'vertical' ? (
                          <>
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Horizontal View
                          </>
                        ) : (
                          <>
                            <LayoutList className="h-4 w-4 mr-1" />
                            Vertical View
                          </>
                        )}
                      </button>

                      {interview?.status === 'In Progress' && allRoundsCompleted && (
                        <button
                          onClick={() => setShowFinalFeedbackModal(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Add Final Feedback
                        </button>
                      )}

                      {interview?.status === 'Draft' && (
                        <button
                          onClick={() => setShowCompletionModal(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete Interview
                        </button>
                      )}

                      {interview?.status === "Draft" && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel Interview
                        </button>
                      )}




                      {canAddRound() && (
                        <button
                          onClick={handleAddRound}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Round
                        </button>
                      )}

                      <Link
                        to={`/interviews/${id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Interview
                      </Link>
                    </div>
                  </div>
                  <InterviewProgress
                    rounds={rounds}
                    interviewId={id}
                    currentRoundId={activeRound || undefined}
                    viewMode={roundsViewMode}
                    onSelectRound={handleSelectRound}
                  />

                  {rounds.length > 0 && (
                    <div className="mt-6">
                      {roundsViewMode === 'horizontal' ? (
                        activeRound && (
                          <SingleRoundView
                            rounds={rounds}
                            interviewData={interview}
                            currentRoundId={activeRound}
                            canEditRound={canEditRound}
                            onEditRound={handleEditRound}
                            onChangeRound={handleSelectRound}
                          />
                        )
                      ) : (
                        <VerticalRoundsView
                          rounds={rounds}
                          interviewData={interview}
                          canEditRound={canEditRound}
                          onEditRound={handleEditRound}
                        />
                      )}
                    </div>
                  )}

                  {rounds.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No rounds added yet.</p>
                      {canAddRound() && (
                        <button
                          onClick={handleAddRound}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Round
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {showFinalFeedbackModal && (
          <FinalFeedbackModal
            onClose={() => setShowFinalFeedbackModal(false)}
            interviewId={id}
          />
        )}


        {/* Confirmation Modal for cancle interview */}
        {isModalOpen && (
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
        )}

        {showCompletionModal && (
          <CompletionReasonModal
            onClose={() => setShowCompletionModal(false)}
            onComplete={handleCompleteWithReason}
            pendingRoundsCount={pendingRounds.length}
            interviewId={id}
            interview={interview}
          />
        )}

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
        {/* {selectCandidateView === true && (
          <CandidateDetails
            candidate={selectedCandidate}
            onClose={() => setSelectCandidateView(null)}
          />
        )} */}
                  {selectPositionView === true && (
        <PositionSlideDetails 
          position={selectedPosition} 
          onClose={() => setSelectPositionView(null)} 
        />
      )}
      </div>
    </>
  );
};

export default InterviewDetail;
