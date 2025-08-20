import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  X,
} from "lucide-react";

const InterviewActions = ({ interviewData,isAddMode,decodedData, onActionComplete }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({ reason: "", comments: "" });

  console.log("interviewData InterviewActions ",interviewData);

  // Mock interview times for demonstration
 // Replace the mock start/end time with real ones
 const parseInterviewTimes = (interviewData) => {
  if (!interviewData?.interviewRound?.dateTime) return {};

  // Example: "17-08-2025 1:32 PM - 07:25 PM"
  const dateTimeString = interviewData.interviewRound.dateTime;
  
  // Split on space to get all parts
  const parts = dateTimeString.split(" ");
  
  // Extract date (first part)
  const date = parts[0];
  
  // Extract start time (second and third parts)
  const startTime = `${parts[1]} ${parts[2]}`;
  
  // Extract end time (fourth and fifth parts)
  const endTime = `${parts[4]} ${parts[5]}`;
  
  const [day, month, year] = date.split("-");

  // Build Date strings
  const startDateTime = new Date(`${year}-${month}-${day} ${startTime}`);
  const endDateTime = new Date(`${year}-${month}-${day} ${endTime}`);

  return { startDateTime, endDateTime };
};

const { startDateTime, endDateTime } = parseInterviewTimes(interviewData);

// Fallback if parsing fails
const startTime = startDateTime || new Date();
const endTime =
  endDateTime ||
  new Date(startTime.getTime() + (interviewData?.interviewRound?.duration || 30) * 60000);

// Status calculation
const getStatus = () => {
  if (!startTime || !endTime) return "Unknown";
  if (currentTime < startTime) return "Upcoming";
  if (currentTime >= startTime && currentTime <= endTime) return "In Progress";
  return "Completed";
};

  // Timer updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Time-based conditions
  const candidateActionEnabled = currentTime >= new Date(startTime.getTime() + 15 * 60000);
  const completionActionEnabled = currentTime >= new Date(endTime.getTime() - 15 * 60000);
  const canCancel = currentTime <= endTime;
  const canRaiseIssue = currentTime >= startTime && currentTime <= endTime;

  // Handlers
  const handleConfirm = (type, extra = {}) => {
    onActionComplete({ type, timestamp: new Date(), ...extra });
    setModal(null);
    setFormData({ reason: "", comments: "" });
  };

  const openModal = (type, status = null) => {
    setModal({ type, status });
    setFormData({ reason: "", comments: "" });
  };

  const closeModal = () => {
    setModal(null);
    setFormData({ reason: "", comments: "" });
  };

  const getTimeUntilEnabled = (targetTime) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return null;
    const minutes = Math.ceil(diff / (1000 * 60));
    return `${minutes} min`;
  };

  const ActionCard = ({ 
    icon: Icon, 
    title, 
    description, 
    onClick, 
    disabled, 
    variant = "default",
    timeUntil = null,
    ready = false
  }) => {
    const variants = {
      success: "border-green-200 bg-green-50 hover:bg-green-100",
      warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
      danger: "border-red-200 bg-red-50 hover:bg-red-100",
      default: "border-gray-200 bg-white hover:bg-gray-50"
    };

    const iconColors = {
      success: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100", 
      danger: "text-red-600 bg-red-100",
      default: "text-gray-600 bg-gray-100"
    };

    return (
      <div
        className={`relative border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer ${
          disabled 
            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" 
            : variants[variant]
        }`}
        onClick={disabled ? undefined : onClick}
      >
        {ready && !disabled && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Ready
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${disabled ? "bg-gray-200 text-gray-400" : iconColors[variant]}`}>
            <Icon size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold mb-2 ${disabled ? "text-gray-400" : "text-gray-800"}`}>
              {title}
            </h3>
            <p className={`text-sm mb-3 ${disabled ? "text-gray-400" : "text-gray-600"}`}>
              {description}
            </p>
            
            {timeUntil && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={12} />
                <span>Available in {timeUntil}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-r from-[#217989] to-[#1a616e] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Interview Status</h2>
          <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white text-opacity-80">Start Time</p>
            <p className="font-semibold">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <p className="text-white text-opacity-80">End Time</p>
            <p className="font-semibold">{endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div>
            <p className="text-white text-opacity-80">Status</p>
            <p className="font-semibold">{getStatus()}</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Available Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
          {/* Candidate Participation */}
          <ActionCard
            icon={CheckCircle}
            title="Candidate Joined"
            description="Confirm that the candidate has successfully joined the interview"
            onClick={() => handleConfirm("candidateJoined")}
            disabled={!candidateActionEnabled}
            variant="success"
            timeUntil={!candidateActionEnabled ? getTimeUntilEnabled(new Date(startTime.getTime() + 15 * 60000)) : null}
            ready={candidateActionEnabled}
          />

          <ActionCard
            icon={XCircle}
            title="Candidate No-Show"
            description="Mark candidate as no-show if they haven't joined after 15 minutes"
            onClick={() => openModal("noShow")}
            disabled={!candidateActionEnabled}
            variant="danger"
            timeUntil={!candidateActionEnabled ? getTimeUntilEnabled(new Date(startTime.getTime() + 15 * 60000)) : null}
          />

          {/* Interview Completion */}
          <ActionCard
            icon={CheckCircle}
            title="Mark Completed"
            description="Mark the interview as successfully completed"
            onClick={() => openModal("completion", "completed")}
            disabled={!completionActionEnabled}
            variant="success"
            timeUntil={!completionActionEnabled ? getTimeUntilEnabled(new Date(endTime.getTime() - 15 * 60000)) : null}
            ready={completionActionEnabled}
          />

          <ActionCard
            icon={AlertTriangle}
            title="Mark Incomplete"
            description="Mark the interview as incomplete due to issues"
            onClick={() => openModal("completion", "incomplete")}
            disabled={!completionActionEnabled}
            variant="warning"
            timeUntil={!completionActionEnabled ? getTimeUntilEnabled(new Date(endTime.getTime() - 15 * 60000)) : null}
          />

          {/* Technical Issues */}
          <ActionCard
            icon={AlertCircle}
            title="Report Technical Issue"
            description="Report any technical problems during the interview"
            onClick={() => openModal("techIssue")}
            disabled={!canRaiseIssue}
            variant="warning"
            ready={canRaiseIssue}
          />

          {/* Cancel Interview */}
          <ActionCard
            icon={Ban}
            title="Cancel Interview"
            description="Cancel the interview and notify all parties"
            onClick={() => openModal("cancel")}
            disabled={!canCancel}
            variant="danger"
            ready={canCancel}
          />
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal?.type === "noShow"}
        onClose={closeModal}
        title="Confirm Candidate No-Show"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={16} />
              <span className="font-medium">No-Show Confirmation</span>
            </div>
            <p className="text-red-700 text-sm mt-2">
              This will mark the candidate as a no-show and end the interview session.
            </p>
          </div>
          
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            placeholder="Add any additional comments about the no-show..."
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            rows={3}
          />
          
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm("noShow", formData)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Confirm No-Show
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modal?.type === "completion"}
        onClose={closeModal}
        title={modal?.status === "completed" ? "Confirm Interview Completion" : "Mark Interview Incomplete"}
      >
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${
            modal?.status === "completed" 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className={`flex items-center gap-2 ${
              modal?.status === "completed" ? "text-green-800" : "text-yellow-800"
            }`}>
              {modal?.status === "completed" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span className="font-medium">
                {modal?.status === "completed" ? "Interview Completed" : "Interview Incomplete"}
              </span>
            </div>
            <p className={`text-sm mt-2 ${
              modal?.status === "completed" ? "text-green-700" : "text-yellow-700"
            }`}>
              {modal?.status === "completed" 
                ? "This will mark the interview as successfully completed."
                : "This will mark the interview as incomplete due to issues."
              }
            </p>
          </div>
          
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            placeholder="Add any comments about the interview completion..."
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            rows={3}
          />
          
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm("completion", { status: modal.status, ...formData })}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                modal?.status === "completed" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              Confirm {modal?.status === "completed" ? "Completion" : "Incomplete"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modal?.type === "techIssue"}
        onClose={closeModal}
        title="Report Technical Issue"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle size={16} />
              <span className="font-medium">Technical Issue Report</span>
            </div>
            <p className="text-orange-700 text-sm mt-2">
              This will log the technical issue for support team review.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            >
              <option value="">Select issue type</option>
              <option value="connectivity-candidate">Internet Connectivity (Candidate)</option>
              <option value="connectivity-interviewer">Internet Connectivity (Interviewer)</option>
              <option value="audio-video">Audio/Video Problem</option>
              <option value="platform-issue">Platform Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              placeholder="Describe the technical issue in detail..."
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConfirm("techIssue", formData)}
              disabled={!formData.reason}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Report Issue
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modal?.type === "cancel"}
        onClose={closeModal}
        title="Cancel Interview"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Ban size={16} />
              <span className="font-medium">Cancel Interview</span>
            </div>
            <p className="text-red-700 text-sm mt-2">
              This will cancel the interview and notify all parties. This action cannot be undone.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            >
              <option value="">Select reason</option>
              <option value="candidate-unavailable">Candidate Not Available</option>
              <option value="interviewer-unavailable">Interviewer Not Available</option>
              <option value="reschedule-request">Reschedule Request</option>
              <option value="technical-issue">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              placeholder="Provide additional details about the cancellation..."
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Keep Interview
            </button>
            <button
              onClick={() => handleConfirm("cancel", formData)}
              disabled={!formData.reason}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel Interview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewActions;