import { DndContext, closestCenter } from '@dnd-kit/core';
import { Eye, Mail, UserCircle, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateList = ({ candidates, onView, onEdit, onResendLink, isAssessmentView, navigate }) => (
  <div className={`w-full bg-gray-50 rounded-xl p-4 ${isAssessmentView ? '' : 'min-h-screen'}`}>

    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">All Candidates</h3>
      <span className="px-2 py-1 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
        {candidates.length} candidates
      </span>
    </div>

    {candidates.length === 0 ? (
      <div className="flex justify-center items-center h-full py-20 text-gray-500 text-lg">
        No candidates found.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {candidates.map((candidate) => (
          <div
            key={candidate._id || candidate.id} // Use _id or id based on context
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="relative">
                  {candidate?.ImageData ? (
                    <img
                      src={`http://localhost:5000/${candidate?.ImageData?.path}`}
                      alt={candidate?.FirstName || 'Candidate'}
                      onError={(e) => {
                        e.target.src = '/default-profile.png';
                      }}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                      {candidate?.FirstName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-custom-blue"
                    onClick={() => navigate(`view-details/${candidate._id}`)}
                  >
                    {candidate?.FirstName || ''}{' '}
                    {candidate?.LastName || ''}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    {candidate.CurrentRole || candidate.CurrentExperience || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`view-details/${candidate._id}`)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {!isAssessmentView ? (
                  <>
                    <button
                      onClick={() => candidate?._id && navigate(`/candidate/${candidate._id}`)}
                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="360° View"
                    >
                      <UserCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`edit/${candidate._id}`)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onResendLink(candidate.id)}
                    disabled={candidate.status === 'completed'}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Resend Link"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span className=" truncate">{candidate?.Email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span>{candidate?.Phone || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span>{candidate?.HigherQualification || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span>{candidate?.UniversityCollege || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-custom-bg text-custom-blue rounded-lg text-xs font-medium"
                  >
                    {skill.skill || 'N/A'}
                  </span>
                ))}
                {candidate.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                    +{candidate.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {!isAssessmentView && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Latest Interview:</span>
                  <span className="font-medium text-gray-800">
                    {'interviews'} - {'round'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const CandidateKanban = ({ candidates, onView, onEdit, onResendLink, isAssessmentView }) => {
  const navigate = useNavigate();
  return (
    <DndContext collisionDetection={closestCenter}>
      <div className="w-full">
        <CandidateList
          candidates={candidates}
          onView={onView}
          onEdit={onEdit}
          onResendLink={onResendLink}
          isAssessmentView={isAssessmentView}
          navigate={navigate}
        />
      </div>
    </DndContext>
  );
};

export default CandidateKanban;