
// import { FaTimes, FaExternalLinkAlt,  FaEnvelope, FaPhone, FaUniversity } from 'react-icons/fa';
import Modal from 'react-modal';
// import { RiGraduationCapFill } from "react-icons/ri";
import { useEffect, useState } from 'react';

Modal.setAppElement('#root');

const CandidateFullscreen = () => {

  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const storedCandidate = sessionStorage.getItem('candidateData');
    if (storedCandidate) {
      setCandidate(JSON.parse(storedCandidate));
    }
  }, []);

  console.log("Full screen page", candidate);
  


  if (!candidate) return <div className='text-center h-full w-full justify-center items-center'>Loading...</div>;
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedCandidate, setEditedCandidate] = useState(candidate);

  if (!candidate) return null;

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
          {/* {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <FaEdit className="w-5 h-5" />
            </button>
          )} */}
          {/* {isEditing && (
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Save"
            >
              <FaSave className="w-5 h-5" />
            </button>
          )} */}
          {/* {!isFullScreen && (
            <button
              onClick={() => {
                const newWindow = window.open(
                  '/candidate-fullscreen', 
                  '_blank', 
                  'noopener,noreferrer'
                );
                if (newWindow) {
                  newWindow.moveTo(0, 0);
                  newWindow.resizeTo(window.screen.width, window.screen.height);
                  newWindow.document.title = "Candidate Fullscreen";
                }
                }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in Fullscreen"
            >
              <FaExternalLinkAlt className="w-5 h-5 text-gray-500" />
            </button>
          )} */}
          {/* <button
            // onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button> */}
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
                  {candidate?.LastName.charAt(0) || '?'}
                </div>
              )}
              {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                candidate?.Status === 'active' ? 'bg-green-100 text-green-800' :
                candidate?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {candidate?.Status ? candidate?.Status.charAt(0).toUpperCase() + candidate?.Status.slice(1) : "?"}

              </span> */}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-center mb-6">
              {/* {isEditing ? (
                <input
                  type="text"
                  value={editedCandidate.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-2xl font-bold text-center w-full border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1"
                />
              ) : ( */}
                <h3 className="text-2xl font-bold text-gray-900">{candidate?.FirstName || ''} {candidate?.LastName || ''}</h3>
              {/* )} */}
              {/* {isEditing ? (
                <input
                  type="text"
                  value={editedCandidate.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  className="text-gray-600 text-center w-full border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1 mt-2"
                />
              ) : ( */}
                <p className="text-gray-600 mt-1">{candidate.CurrentRole || 'position'}</p>
              {/* )} */}
            </div>

            <div className="grid grid-cols-2  gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      {/* <FaEnvelope className="w-5 h-5 text-gray-500" /> */}
                    </div>
                    {/* {isEditing ? (
                      <input
                        type="email"
                        value={editedCandidate?.Email}
                        onChange={(e) => handleInputChange('Email', e.target.value)}
                        className="flex-1 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1"
                      />
                    ) : ( */}
                      <span className="text-gray-700">{candidate?.Email || 'N/A'}</span>
                    {/* )} */}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      {/* <FaPhone className="w-5 h-5 text-gray-500" /> */}
                    </div>
                    {/* {isEditing ? (
                      <input
                        type="tel"
                        value={editedCandidate?.Phone}
                        onChange={(e) => handleInputChange('Phone', e.target.value)}
                        className="flex-1 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1"
                      />
                    ) : ( */}
                      <span className="text-gray-700">{candidate?.Phone}</span>
                    {/* )} */}
                  </div>
                  {/* <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCandidate.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="flex-1 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-700">{candidate.location}</span>
                    )}
                  </div> */}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-custom-bg rounded-lg">
                      {/* <RiGraduationCapFill className="w-5 h-5" /> */}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                      {/* {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="w-full border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1"
                        />
                      ) : ( */}
                        <p className="text-gray-700">{candidate?.HigherQualification || 'N/A'}</p>
                      {/* )} */}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-bg rounded-lg">
                        {/* <FaUniversity  className="w-5 h-5" /> */}
                        </div>
                        <div>
                      <p className="text-sm text-gray-500">University</p>
                        <p className="text-gray-700">{candidate?.UniversityCollege || 'N/A'} </p>
                        </div>
            
                    </div>
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



  return (
    <div className="fixed min-h-screen inset-y-0 right-0 w-full  bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden">
      {content}
    </div>
  );
};

export default CandidateFullscreen;