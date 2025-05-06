import React, { useState } from 'react';
import { format } from 'date-fns';
import Modal from 'react-modal';

import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Building,
  Download,
  Mail,
  Save,
  Plus
} from 'lucide-react';


Modal.setAppElement('#root');

const InterviewDetails = ({ interview, onClose, onEdit }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [editFormData, setEditFormData] = useState({
    round: '',
    interviewer: '',
    date: '',
    feedback: '',
    status: ''
  });

  // console.log("interview InterviewDetails", interview);


  const handleEmailFeedback = (round) => {
    const subject = encodeURIComponent(`Interview Feedback - ${interview.company} - ${round.round}`);
    const body = encodeURIComponent(`
Interview Details:
Company: ${interview.company}
Position: ${interview.position}
Round: ${round.round}
Date: ${format(new Date(round.date), 'MMM dd, yyyy')}
Interviewer: ${round.interviewer}
Feedback: ${round.feedback || 'N/A'}
    `);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleEditRound = (round) => {
    setEditingRound(round);
    setEditFormData({
      round: round.round,
      interviewer: round.interviewer,
      date: round.date,
      feedback: round.feedback || '',
      status: round.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    onEdit({ ...editingRound, ...editFormData });
    setIsEditModalOpen(false);
  };

  const downloadConsolidatedFeedback = () => {
    const feedbackContent = interview.rounds
      .filter(round => round.feedback)
      .map(round => `
Round: ${round.round}
Date: ${format(new Date(round.date), 'MMM dd, yyyy')}
Interviewer: ${round.interviewer}
Feedback: ${round.feedback}
Status: ${round.status}
-------------------
      `).join('\n');

    const element = document.createElement("a");
    const file = new Blob([`Interview Feedback for ${interview?.positionId?.companyname || "N/A"} - ${interview?.positionId?.title || "N/A"}\n\n${feedbackContent}`], {
      type: "text/plain"
    });
    element.href = URL.createObjectURL(file);
    element.download = `consolidated-feedback-${interview.company.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{interview?.positionId?.companyname || "N/A"}</h3>
            </div>
            <p className="text-gray-600">{interview?.positionId?.title || "N/A"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadConsolidatedFeedback}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download Consolidated Feedback"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">Interview Rounds</h4>
          <button
            onClick={() => {
              setEditingRound(null);
              setEditFormData({
                round: '',
                interviewer: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                feedback: '',
                status: 'Scheduled'
              });
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-custom-blue text-white rounded-lg  transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Round</span>
          </button>
        </div>

        <div className="space-y-6">
          {interview?.rounds.map((round, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-custom-bg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {/* {round.roundTitle.includes('Technical') ? (
                        <Code className="w-5 h-5 text-blue-600" />
                      ) : round.roundTitle.includes('System') ? (
                        <Laptop2 className="w-5 h-5 text-purple-600" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      )} */}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{round?.roundTitle}</h4>
                      <p className="text-sm text-gray-600">
                        with{' '}
                        {round.interviewers?.map((interviewer, index) => (
                          <span key={index}>
                            {interviewer?.name}
                            {index < round.interviewers.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>

                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <button
                      onClick={() => handleEditRound(round)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Round"
                    >
                      <Edit className="w-4 h-4" />
                    </button> */}
                    {round.feedback && (
                      <>
                        <button
                          onClick={() => handleEmailFeedback(round)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Email Feedback"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        {/* <button
                          onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([JSON.stringify(round.feedback, null, 2)], {
                              type: "text/plain"
                            });
                            element.href = URL.createObjectURL(file);
                            element.download = `feedback-${round.round.toLowerCase()}.txt`;
                            document.body.appendChild(element);
                            element.click();
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download Feedback"
                        >
                          <Download className="w-4 h-4" />
                        </button> */}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
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
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{round?.duration || 'N/A'}</span>
                  </div>
                </div>

                <h5 className="font-medium text-gray-800">Feedback</h5>

                {/* {round.feedback && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-800">Feedback</h5>
                      <div className="flex items-center gap-1"> 
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      {/* </div> */}
                {/* </div> */}

                {/* <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {round.feedback}
                    </p>  */}

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2  lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Strengths</h6>
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
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h6>
                    <div className="space-y-2">
                      {['System design', 'Performance optimization'].map((area, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-center mt-10">
                  <h6 className="text-sm font-medium text-blue-800 mb-2">Interviewer Notes</h6>
                  <p className="text-sm text-blue-700">
                    Candidate showed strong problem-solving skills and good communication.
                    Could improve on system design patterns and performance optimization techniques.
                  </p>
                </div>


                {/* </div> */}
                {/* )}  */}

                {round.status === 'Scheduled' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h6 className="text-sm font-medium text-yellow-800 mb-2">Preparation Tips</h6>
                      <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        <li>Review system design fundamentals</li>
                        <li>Practice coding problems on similar topics</li>
                        <li>Prepare questions about the role and team</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">
              {editingRound ? 'Edit Interview Round' : 'Add New Round'}
            </h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Round Name
              </label>
              <input
                type="text"
                value={editFormData.round}
                onChange={(e) => setEditFormData({ ...editFormData, round: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interviewer
              </label>
              <input
                type="text"
                value={editFormData.interviewer}
                onChange={(e) => setEditFormData({ ...editFormData, interviewer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <textarea
                value={editFormData.feedback}
                onChange={(e) => setEditFormData({ ...editFormData, feedback: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewDetails;