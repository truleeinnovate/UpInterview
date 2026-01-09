// v1.0.0 - Ashok - fixed z-index at popup

import Modal from "react-modal";
import {
  ExternalLink,
  X,
  GraduationCap,
  Building,
  Briefcase,
  Clock,
  CalendarDays,
  FileText,
} from "lucide-react";
// import Loading from '../../../../Components/Loading';
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";

Modal.setAppElement("#root");

const MockCandidateDetails = ({ candidate, onClose, isFullScreen, onEdit }) => {
  // v1.0.0 <-----------------------------------------------------------
  useScrollLock(true);
  // v1.0.0 ----------------------------------------------------------->

  // if (!candidate) return <div className='text-center h-full w-full justify-center items-center'><Loading /></div>;
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedCandidate, setEditedCandidate] = useState(candidate);

  // const handleSave = () => {
  //   onEdit?.(editedCandidate);
  //   setIsEditing(false);
  // };

  // const handleInputChange = (field, value) => {
  //   setEditedCandidate(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  const content = (
    <div className="h-full flex flex-col">
      {/* v1.0.0 <--------------------------------------------------------------------------- */}
      <div className="sticky top-0 bg-white p-4 flex justify-between items-center z-10">
        {/* v1.0.0 ---------------------------------------------------------------------------> */}
        <h2 className="text-xl font-bold text-gray-800">Candidate</h2>
        <div className="flex items-center gap-2">
          {!isFullScreen && (
            <button
              onClick={() => {
                sessionStorage.setItem(
                  "candidateData",
                  JSON.stringify(candidate)
                );
                window.open("/candidate-fullscreen", "_blank");
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in Fullscreen"
            >
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              {candidate?.ImageData ? (
                <img
                  src={candidate?.ImageData?.path}
                  alt={candidate?.FirstName || "Candidate"}
                  onError={(e) => {
                    e.target.src = "/default-profile.png";
                  }}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                  {candidate?.candidateName.charAt(0) || "?"}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {capitalizeFirstLetter(candidate?.candidateName) || ""}
              </h3>

              <p className="text-gray-600 mt-1">
                {capitalizeFirstLetter(candidate?.currentRole) || "position"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <FaEnvelope className="w-5 h-5 text-gray-500" />
                    </div>
                    
                      <span className="text-gray-700">{candidate?.Email || 'N/A'}</span>
                   
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <FaPhone className="w-5 h-5 text-gray-500" />
                    </div>
                 
                      <span className="text-gray-700">{candidate?.Phone || "N/A"}</span>
                
                  </div>
              
                </div>
              </div> */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Professional Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <GraduationCap className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>

                      <p className="text-gray-700">
                        {capitalizeFirstLetter(
                          candidate?.higherQualification
                        ) || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      {candidate ? (
                        <p className="text-gray-700">
                          {candidate?.currentExperience} Years
                        </p>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Interview Details
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-custom-bg rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interview Title</p>
                    {capitalizeFirstLetter(candidate?.rounds?.[0]?.roundTitle)}
                  </div>
                </div>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      {candidate?.rounds?.[0]?.duration}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created On</p>
                      {formatDateTime(candidate?.rounds?.[0]?.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {
                        <StatusBadge
                          status={capitalizeFirstLetter(
                            candidate?.rounds?.[0]?.status
                          )}
                        />
                      }
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate?.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-custom-bg text-custom-blue rounded-full text-sm font-medium border border-blue-100"
                  >
                    {capitalizeFirstLetter(skill)}
                  </span>
                ))}
              </div>
            </div>
            {/* v1.0.0 <--------------------------------------------------------------------------------------- */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Resume
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate?.resume?.path ? (
                  <a
                    href={candidate.resume.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-custom-blue underline hover:text-custom-blue/90 transition"
                  >
                    {candidate?.resume?.filename || "View Resume"}
                  </a>
                ) : (
                  <span className="text-gray-500">No resume available</span>
                )}
              </div>
            </div>

            {/* v1.0.0 ---------------------------------------------------------------------------------------> */}

            {candidate.interviews && candidate.interviews.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Latest Interview
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {candidate.interviews[0].company}
                    </span>
                    <span className="text-gray-500">
                      {candidate.interviews[0].position}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Latest round: {candidate.interviews[0].rounds[0].round}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullScreen) {
    return <div className="min-h-screen bg-white">{content}</div>;
  }

  return (
    // v1.0.0 <------------------------------------------------------------------------------------------------
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50">
      <div className="fixed inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-2xl overflow-hidden">
        {content}
      </div>
    </div>
    // v1.0.0 ------------------------------------------------------------------------------------------------->
  );
};

export default MockCandidateDetails;
