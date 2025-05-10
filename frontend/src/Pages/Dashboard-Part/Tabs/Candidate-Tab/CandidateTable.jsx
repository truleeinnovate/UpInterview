import { useEffect, useRef, useState } from 'react';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { Eye, Mail, UserCircle, Pencil } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const CandidateTable = ({ candidates, onView, onEdit, onResendLink, isAssessmentView, isMenuOpen }) => {
  const navigate = useNavigate();

  const menuRefs = useRef([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuIndex !== null &&
        menuRefs.current[openMenuIndex] &&
        !menuRefs.current[openMenuIndex].contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuIndex]);

  // const toggleMenu = (e, index) => {
  //   e.stopPropagation();
  //   setOpenMenuIndex(openMenuIndex === index ? null : index);
  // };

  const toggleMenu = (index) => {
    setOpenMenuIndex(prev => (prev === index ? null : index));
  };

  const closeMenu = () => {
    setOpenMenuIndex(null);
  };

  return (
    <div className={`w-full ${isAssessmentView ? '' : 'h-[calc(100vh-12rem)]'} flex flex-col`}>
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
        <div className="inline-block min-w-full align-middle">
          <div className={`${isMenuOpen ? 'overflow-x-auto' : ""} rounded-xl`} >
            <table className="min-w-full">
              <thead className="border-b">
                <tr className="py-2">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-xl">
                    Candidate Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Higher Qualification
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Current Experience
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Skills/Technology
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-xl">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 ${candidates.length > 0 ? 'border-b' : ''}`}>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center -mt-5 text-gray-500 h-[calc(100vh-15rem)]">
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate, index) =>
                    candidate ? (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0">
                              {candidate?.ImageData ? (
                                <img
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={`http://localhost:5000/${candidate?.ImageData?.path}`}
                                  alt={candidate?.FirstName || 'Candidate'}
                                  onError={(e) => {
                                    e.target.src = '/default-profile.png';
                                  }}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-custom-blue flex pt-1 justify-center text-white text-sm font-semibold">
                                  {(candidate.FirstName || candidate.LastName || '?').charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-custom-blue"
                                onClick={() => navigate(`view-details/${candidate._id}`)}
                              >
                                {(candidate?.FirstName || '') +
                                  ' ' +
                                  (candidate.LastName || '')}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{candidate.Email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span>{candidate.Phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            {candidate.HigherQualification || 'N/A'}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <span>{candidate.CurrentExperience || 'N/A'}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 2).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs"
                              >
                                {skill.skill || 'N/A'}
                              </span>
                            ))}
                            {candidate.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{candidate.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 relative">
                          <div className="inline-block">
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                              onClick={() => toggleMenu(index)}
                            >
                              <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
                            </button>

                            {openMenuIndex === index && (
                              <div
                                className="absolute right-0 mt-2 mr-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                              // onMouseLeave={closeMenu}
                              >
                                <button
                                  onClick={() => {
                                    navigate(`/candidates/view-details/${candidate._id}`);
                                    closeMenu();
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  View Details
                                </button>

                                {!isAssessmentView ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (candidate?._id) {
                                          navigate(`/candidates/${candidate._id}`);
                                          closeMenu();
                                        }
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <UserCircle className="w-4 h-4 text-purple-600" />
                                      360° View
                                    </button>

                                    <button
                                      onClick={() => {
                                        navigate(`edit/${candidate._id}`);
                                        closeMenu();
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Pencil className="w-4 h-4 text-green-600" />
                                      Edit
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (candidate.status !== 'completed') {
                                        onResendLink(candidate.id);
                                        closeMenu();
                                      }
                                    }}
                                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${candidate.status === 'completed' ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    disabled={candidate.status === 'completed'}
                                  >
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    Resend Link
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateTable;