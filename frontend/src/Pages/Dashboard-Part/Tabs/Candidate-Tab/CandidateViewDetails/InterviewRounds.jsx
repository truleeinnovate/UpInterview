import React, { useState } from 'react';

import { format, parseISO, isValid } from 'date-fns';

import {
  ChevronDown,
  ChevronUp,
  Building,
  Star,
  Eye,
  Download,
  Mail,
  Expand,
  Minimize,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Code,
  Laptop2,
  MessageCircle
} from 'lucide-react';

import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');
const RoundDetailsModal = ({ round, interview, isOpen, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  if (round.length === 0) {
    return <p className='justify-center items-center'>No Rounds selected</p>
  }





  // const getIcon = (roundTitle) => {
  //   if (roundTitle.toLowerCase().includes('Technical')) {
  //     return <Code className="w-5 h-5 text-blue-600" />;
  //   } else if (roundTitle.toLowerCase().includes('system')) {
  //     return <Laptop2 className="w-5 h-5 text-purple-600" />;
  //   }
  //   return <MessageCircle className="w-5 h-5 text-green-600" />;
  // };

  const modalClass = isFullScreen
    ? "fixed inset-0 bg-white z-50 overflow-y-auto"
    : "fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40 "
    >
      <div className="h-full pt-14 md:pt-20 sm:pt-20">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                {/* {getIcon(round.roundTitle) || "N/A"} */}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{round?.roundTitle || "N/A"}</h3>
                <p className="text-gray-600">{interview?.positionId?.companyname || "N/A"} - {interview?.positionId?.title || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4">Interview Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interviewer</p>
                    <p className="text-gray-800">{round?.interviewers?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-gray-800">  {round?.dateTime
                      ? (() => {
                        try {
                          // Extract date part from datetime string
                          const datePart = round.dateTime.split(' ')[0];

                          // Convert DD-MM-YYYY → YYYY-MM-DD
                          const formattedDate = datePart.split('-').reverse().join('-');

                          // Format date to "MMM dd, yyyy"
                          return format(new Date(formattedDate), 'MMM dd, yyyy');
                        } catch (error) {
                          console.error("Invalid date format:", round?.dateTime, error);
                          return 'Invalid Date';
                        }
                      })()
                      : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-gray-800">{round?.duration || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-800 mb-4">Status</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${round.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    round.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {round.status}
                  </span>
                </div>
                {/* {round.status === 'Scheduled' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-yellow-800 mb-2">Preparation Tips</h5>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      <li>Review core concepts related to the role</li>
                      <li>Prepare examples of relevant past experiences</li>
                      <li>Research the company and team structure</li>
                      <li>Prepare questions for the interviewer</li>
                    </ul>
                  </div>
                )} */}
              </div>
            </div>
          </div>

          {round.feedback && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">Feedback</h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg mb-6">
                {round.feedback}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Strengths</h5>
                  <div className="space-y-2">
                    {['Problem-solving', 'Technical knowledge', 'Communication'].map((strength, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Areas for Improvement</h5>
                  <div className="space-y-2">
                    {['System design patterns', 'Performance optimization'].map((area, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const InterviewRounds = ({ interviews, onViewDetails, onEdit, candidateId }) => {
  const navigate = useNavigate();
  const [expandedInterview, setExpandedInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const toggleInterview = (id) => {
    setExpandedInterview(expandedInterview === id ? null : id);
  };

  const handleViewRound = (interview, round) => {
    setSelectedInterview(interview);
    setSelectedRound(round);
  };

  //   const handleEmailFeedback = (interview) => {
  //     const subject = encodeURIComponent(`Interview Feedback - ${interview?.companyname} - ${interview.rounds}`);
  //     const body = encodeURIComponent(`
  // Interview Details:
  // Company: ${interview?.positionId?.companyname}
  // Position: ${interview?.positionId?.title}
  // Round: ${interview?.rounds}
  // Date: ${format(new Date(interview?.rounds?.dateTime), 'MMM dd, yyyy')}
  // Interviewer: ${interview?.rounds?.interviewers?.name}
  // Feedback: ${interview?.rounds?.feedback || 'N/A'}
  //     `);
  //     window.location.href = `mailto:?subject=${subject}&body=${body}`;
  //   };

  //   const downloadFeedback = (interview, round) => {
  //     const feedbackContent = `
  // Interview Feedback
  // ----------------
  // Company: ${interview?.companyname}
  // Position: ${interview?.title}
  // Round: ${interview?.rounds}
  // Date: ${format(new Date(round.date), 'MMM dd, yyyy')}
  // Interviewer: ${interview?.rounds.interviewers?.name}
  // Status: ${interview?.rounds?.status}

  // Feedback:
  // ${round.feedback || 'No feedback provided yet.'}
  //     `;

  //     const element = document.createElement("a");
  //     const file = new Blob([feedbackContent], { type: 'text/plain' });
  //     element.href = URL.createObjectURL(file);
  //     element.download = `feedback-${interview?.positionId?.companyname}-${interview?.positionId?.companyname.rounds?.roundTitle}.txt`.toLowerCase().replace(/\s+/g, '-');
  //     document.body.appendChild(element);
  //     element.click();
  //   };

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-custom-blue">
          Interview Process
        </h3>
        <button
          className="px-4 py-2 bg-custom-blue text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
          onClick={() => navigate('/interviews/new', { state: { candidateId, from360: true } })}
        >
          Add Interview
        </button>
      </div>

      {interviews.length === 0 ? <p className='text-center text-lg font-semibold'>No Interviews Scheduled</p> :

        <div className="space-y-4">
          {/* {
         interviews?.map((interview) => ( */}
          <div
            // key={interview?._id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Building className="w-5 h-5 text-custom-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{interviews?.positionId?.companyname || "N/A"}</h4>
                  <p className="text-sm text-gray-600">{interviews?.positionId?.title || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetails(interviews)}
                  className="p-2 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleInterview(interviews?._id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {expandedInterview === interviews?._id ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {expandedInterview === interviews?._id && (
              <div className="p-4">
                <div className="flex gap-4 mb-4 border-b border-gray-200">
                  <button
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'details'
                      ? 'text-custom-blue border-b-2 border-custom-blue'
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </button>
                  <button
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'feedback'
                      ? 'text-custom-blue border-b-2 '
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                    onClick={() => setActiveTab('feedback')}
                  >
                    Feedback
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <div className="space-y-4">
                    {interviews?.rounds.map((round, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-custom-blue pl-4 py-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-gray-800">{round?.roundTitle || "N/A"}</h5>
                            <p className="text-sm text-gray-600">Interviewer: {round.interviewers[0]?.name || "N/A"}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">
                              {round?.dateTime
                                ? (() => {
                                  try {
                                    // Extract date part from datetime string
                                    const datePart = round.dateTime.split(' ')[0];

                                    // Convert DD-MM-YYYY → YYYY-MM-DD
                                    const formattedDate = datePart.split('-').reverse().join('-');

                                    // Format date to "MMM dd, yyyy"
                                    return format(new Date(formattedDate), 'MMM dd, yyyy');
                                  } catch (error) {
                                    console.error("Invalid date format:", round?.dateTime, error);
                                    return 'Invalid Date';
                                  }
                                })()
                                : 'N/A'}

                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${round.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  round.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'}
                              `}>
                                {round?.status || "N/A"}
                              </span>
                              <button
                                onClick={() => handleViewRound(interviews, round)}
                                className="p-1 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Round Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {interviews?.rounds?.length > 0 &&
                      interviews?.rounds?.map((round, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-medium text-gray-800">{round?.roundTitle}</h6>
                            <div className="flex items-center gap-2">
                              {round.feedback && (
                                <>
                                  <button
                                    // onClick={() => handleEmailFeedback(interview, round)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Email Feedback"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button
                                    // onClick={() => downloadFeedback(interview, round)}
                                    className="p-2 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Download Feedback"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* {round.feedback && (
                          <>
                            <p className="text-sm text-gray-600 mb-3">{round.feedback}</p>
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                              <div>
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Strengths</h6>
                                <ul className="space-y-1">
                                  <li className="text-sm text-gray-600">• Strong problem-solving</li>
                                  <li className="text-sm text-gray-600">• Technical expertise</li>
                                  <li className="text-sm text-gray-600">• Clear communication</li>
                                </ul>
                              </div>
                              <div>
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h6>
                                <ul className="space-y-1">
                                  <li className="text-sm text-gray-600">• System design patterns</li>
                                  <li className="text-sm text-gray-600">• Performance optimization</li>
                                </ul>
                              </div>
                            </div>
                          </>
                        )} */}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* // ))} */}
        </div>

      }

      {selectedRound && selectedInterview && (
        <RoundDetailsModal
          round={selectedRound}
          interview={selectedInterview}
          isOpen={true}
          onClose={() => {
            setSelectedRound(null);
            setSelectedInterview(null);
          }}
        />
      )}

    </div>
  );
};

export default InterviewRounds;