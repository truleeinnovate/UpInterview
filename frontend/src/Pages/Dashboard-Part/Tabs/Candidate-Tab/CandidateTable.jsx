import { useEffect, useRef, useState } from 'react';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { Eye, Mail, UserCircle, Pencil } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const CandidateTable = ({ candidates, onView, onEdit, onResendLink, isAssessmentView, isMenuOpen }) => {
  const navigate = useNavigate();

  const menuRefs = useRef([]);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuButtonRefs = useRef([]);
  const scrollContainerRef = useRef(null);

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

  const toggleMenu = (e, index) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleMenuOpen = (index) => {
    setOpenMenuIndex(index);
    const container = scrollContainerRef.current;
    const button = menuButtonRefs.current[index];

    if (container && button) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = 120;
      const spaceBelow = containerRect.bottom - buttonRect.bottom;
      setOpenUpwards(spaceBelow < dropdownHeight);
    }
  };

  return (
    <div className={`w-full ${isAssessmentView ? '' : 'h-[calc(100vh-12rem)]'} flex flex-col`}>

      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div
              className="h-[calc(100vh-12rem)] overflow-y-auto pb-6"
              ref={scrollContainerRef}
            >
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Candidate Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Contact
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Higher Qualification
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Current Experience
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Skills/Technology
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((candidate, index) =>
                      candidate ? (
                        <tr key={index}
                          className={`hover:bg-gray-50 ${index === candidates.length - 1 ? 'mb-6' : ''}`}
                        >
                          <td className="px-6 py-1 text-sm text-custom-blue cursor-pointer" >
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
                                  <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                                    {candidate.FirstName
                                      ? candidate.FirstName.charAt(0)
                                      : '?'}
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

                          <td className="px-4 py-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{candidate.Email || 'N/A'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-600">

                            {candidate.Phone || 'N/A'}

                          </td>

                          <td className="px-4 py-2 text-sm text-gray-600">

                            {candidate.HigherQualification || 'N/A'}

                          </td>

                          <td className="px-4 py-2 text-sm text-gray-600">

                            {candidate.CurrentExperience || 'N/A'}

                          </td>

                          <td className="px-4 py-2">
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

                          <td className="px-6 py-2 text-sm text-gray-600">
                            <Menu as="div" className="relative">
                              {/* <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"> */}
                              <Menu.Button
                                ref={(el) => (menuButtonRefs.current[index] = el)}
                                onClick={() => handleMenuOpen(index)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                              >
                                <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                              </Menu.Button>
                              {/* </Menu.Button> */}
                              {openMenuIndex === index && (
                                <Menu.Items
                                  className={`absolute w-48 bg-white rounded-lg shadow-lg border py-1 z-50 ${openUpwards ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'
                                    }`}
                                >

                                  <Menu.Item>
                                  {({ active }) => (
                                  <button
                                    onClick={() => navigate(`view-details/${candidate._id}`)}
                                    className={`${active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}       >
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    View Details
                                  </button>
                                  )}
                                  </Menu.Item>



                                  {!isAssessmentView ? (
                                    <>
                                      <Menu.Item>
                                      {({ active }) => (
                                      <button
                                        onClick={() =>
                                          candidate?._id &&
                                          navigate(`/candidate/${candidate._id}`)
                                        }
                                       className={`${active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <UserCircle className="w-4 h-4 text-purple-600" />
                                        360° View
                                      </button>
                                       )}
                                    </Menu.Item>
                                     <Menu.Item>
                                     {({ active }) => ( 
                                      <button
                                        onClick={() => navigate(`edit/${candidate._id}`)}
                                        className={`${active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <Pencil className="w-4 h-4 text-green-600" />
                                        Edit
                                      </button>
                                       )}
                                    </Menu.Item> 
                                    </>
                                  ) : (
                                    <Menu.Item>
                                     {({ active }) => (
                                    <button
                                      onClick={() => onResendLink(candidate.id)}
                                      className={`${active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                     
                                      disabled={candidate.status === 'completed'}
                                    >
                                      <Mail className="w-4 h-4 text-blue-600" />
                                      Resend Link
                                    </button>
                                      )}
                                    </Menu.Item>
                                  )}
                                </Menu.Items>
                              )}
                            </Menu>
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
    </div>
  );
};

export default CandidateTable;