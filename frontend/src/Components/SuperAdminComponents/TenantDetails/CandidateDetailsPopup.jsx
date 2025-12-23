import { useState } from "react";
import { X, Maximize, Minimize } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import CandidateFeeds from "./CandidateFeeds";

function CandidateDetailsPopup({ candidate, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen bg-white shadow-lg overflow-y-auto transition-all duration-300 z-50 ${
        isExpanded ? "w-full" : "w-1/2"
      }`}
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {candidate.name}
            </h2>
            <p className="text-gray-500">{candidate.position}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              {isExpanded ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "details"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === "activity"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("activity")}
          >
            Feeds
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "details" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Email</span>
                    <p className="mt-1">{candidate.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone</span>
                    <p className="mt-1">{candidate.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Location</span>
                    <p className="mt-1">{candidate.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Current Company
                    </span>
                    <p className="mt-1">{candidate.currentCompany}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Experience</span>
                    <p className="mt-1">{candidate.experience}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Education</span>
                    <p className="mt-1">{candidate.education}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Salary Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">
                      Current Salary
                    </span>
                    <p className="mt-1">
                      {formatCurrency(candidate.salary.current)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Expected Salary
                    </span>
                    <p className="mt-1">
                      {formatCurrency(candidate.salary.expected)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Application Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Current Stage</span>
                    <div className="mt-1">
                      <StatusBadge
                        status={
                          candidate.stage === "offer" ? "success" : "pending"
                        }
                        text={
                          candidate.stage.charAt(0).toUpperCase() +
                          candidate.stage.slice(1)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Applied Date</span>
                    <p className="mt-1">{formatDate(candidate.appliedDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Last Activity</span>
                    <p className="mt-1">{formatDate(candidate.lastActivity)}</p>
                  </div>
                </div>
              </div>

              {candidate.interviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Interviews
                  </h3>
                  <div className="space-y-4">
                    {candidate.interviews.map((interview, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{interview.type}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(interview.date)} with{" "}
                              {interview.interviewer}
                            </p>
                          </div>
                          <StatusBadge status={interview.status} />
                        </div>
                        {interview.feedback && (
                          <p className="mt-2 text-sm text-gray-600">
                            {interview.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {candidate.assessments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Assessments
                  </h3>
                  <div className="space-y-4">
                    {candidate.assessments.map((assessment, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{assessment.name}</p>
                            {assessment.completedDate && (
                              <p className="text-sm text-gray-500">
                                Completed:{" "}
                                {formatDate(assessment.completedDate)}
                              </p>
                            )}
                          </div>
                          {assessment.score !== null ? (
                            <span className="text-lg font-medium text-green-600">
                              {assessment.score}%
                            </span>
                          ) : (
                            <StatusBadge
                              status="pending"
                              text={assessment.status}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {candidate.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notes
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {candidate.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <CandidateFeeds parentId={candidate.id} />
        )}
      </div>
    </div>
  );
}

export default CandidateDetailsPopup;
