import Modal from 'react-modal';
import { ExternalLink, X, GraduationCap } from 'lucide-react';
import Loading from '../../../../Components/Loading';
Modal.setAppElement('#root');

const MockCandidateDetails = ({ candidate, onClose, isFullScreen, onEdit }) => {


    console.log("candidate ", candidate );
    

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
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-gray-800">Candidate</h2>
        <div className="flex items-center gap-2">
         
          {!isFullScreen && (
            <button
              onClick={() => 
                {
                  sessionStorage.setItem('candidateData', JSON.stringify(candidate));
                window.open('/candidate-fullscreen', '_blank',);
                
                }
                }
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
                src={`http://localhost:5000/${candidate?.ImageData?.path}`}
                alt={candidate?.FirstName || "Candidate"} 
                onError={(e) => { e.target.src = "/default-profile.png"; }}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                  {candidate?.candidateName.charAt(0) || '?'}
                </div>
              )}
         
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-center mb-6">
             
                <h3 className="text-2xl font-bold text-gray-900">{candidate?.candidateName || ''}</h3>
              
                <p className="text-gray-600 mt-1">{candidate.Role || 'position'}</p>
         
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
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      <GraduationCap className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                 
                        <p className="text-gray-700">{candidate?.higherQualification || 'N/A'}</p>
                      
                    </div>

                    {/* <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                        <FaUniversity  className="w-5 h-5" />
                        </div>
                        <div>
                      <p className="text-sm text-gray-500">University</p>
                        <p className="text-gray-700">{candidate?.UniversityCollege || 'N/A'} </p>
                        </div>
            
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Skills</h4>
              <div className="flex flex-wrap gap-2">

                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-custom-bg text-custom-blue rounded-full text-sm font-medium border border-blue-100"
                  >
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>

            {candidate.interviews && candidate.interviews.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Latest Interview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{candidate.interviews[0].company}</span>
                    <span className="text-gray-500">{candidate.interviews[0].position}</span>
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
    return (
      <div className="min-h-screen bg-white">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden">
      {content}
    </div>
  );
};

export default MockCandidateDetails;