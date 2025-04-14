// Import necessary dependencies and components

import { DndContext, closestCenter } from '@dnd-kit/core';
import { FaUserCircle, FaEye, FaPencilAlt, FaExternalLinkAlt, FaUniversity , FaBriefcase, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { RiGraduationCapFill } from "react-icons/ri";
// Status badge component for displaying   candidate status
// const StatusBadge = ({ status }) => {
//   const styles = {
//     active: 'bg-green-100 text-green-800',
//     onhold: 'bg-yellow-100 text-yellow-800',
//     rejected: 'bg-red-100 text-red-800'
//   };

//   return (
//     <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// };

// Candidate list component for displaying candidates in a grid layout
const CandidateList = ({ candidates, onView, onEdit,navigate }) => (
  
  <div className="w-full bg-gray-50 rounded-xl p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">All Candidates</h3>
      <span className="px-2 py-1 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
        {candidates.length} candidates
      </span>
    </div>
    {/* Grid layout for candidate cards */}
    <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <div
          key={candidate._id}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Candidate card header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="relative">
                {candidate?.ImageData ? (
                  <img
                  src={`http://localhost:5000/${candidate?.ImageData?.path}`}
                  alt={candidate?.FirstName || "Candidate"} 
                  onError={(e) => { e.target.src = "/default-profile.png"; }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                    {candidate?.FirstName .charAt(0)}
                  </div>
                )}
                {/* <StatusBadge status={candidate?.Status || "?"} /> */}
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">{candidate?.FirstName || '?'} { candidate?.LastName || '?'}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaBriefcase className="w-3 h-3" />
                  {candidate.CurrentRole || 'position'}
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onView(candidate)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <FaEye className="w-4 h-4" />
              </button>
              <button
               onClick={() => candidate?._id && navigate(`/candidate/${candidate._id}`)} 
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="360° View"
              >
                <FaUserCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(candidate)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit"
              >
                <FaPencilAlt className="w-4 h-4" />
              </button>
              {/* <button
                onClick={() => window.open('/candidate', '_blank')}
                className="p-1.5 text-custom-blue hover:bg-gray-50 rounded-lg transition-colors"
                title="Open in New Tab"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
              </button> */}
            </div>
          </div>

          {/* Contact information */}
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 text-gray-600">
                <FaEnvelope className="w-4 h-4" />
                <span className="truncate">{candidate?.Email || "?"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <FaPhone className="w-4 h-4" />
                <span>{candidate?.Phone || "N/A"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-gray-600">
            <RiGraduationCapFill className="w-4 h-4" />
              <span>{candidate?.HigherQualification || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
            <FaUniversity  className="w-4 h-4" />
              <span>{candidate?.UniversityCollege || 'N/A'}</span>
            </div>
          </div>
          </div>

          {/* Skills section */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium"
                >
                  {skill.skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                  +{candidate.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Latest interview information */}
          {/* {candidate.interviews && candidate.interviews.length > 0 && ( */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Latest Interview:</span>
                <span className="font-medium text-gray-800">
                {/* candidate.interviews[0].company || candidate.interviews[0].rounds[0].round || */}
                  { "interviews"} - { "round"}
                </span>
              </div>
            </div>
          {/* // )} */}
        </div>
      ))}
    </div>
  </div>
);

// Main Kanban component with drag-and-drop functionality
const CandidateKanban = ({ candidates, onView, onEdit }) => {
  const navigate = useNavigate();
  return (
    <DndContext collisionDetection={closestCenter}>
      <div className="w-full">
        <CandidateList
          candidates={candidates}
          onView={onView}
          onEdit={onEdit}
          navigate={navigate}
    
        />
      </div>
    </DndContext>
  );
};

export default CandidateKanban;