import React, { useRef, useState } from 'react';
import { FaEye, FaPencilAlt, FaShareAlt } from 'react-icons/fa';
import { ReactComponent as FiMoreHorizontal } from '../../../../icons/FiMoreHorizontal.svg';
import { Menu } from '@headlessui/react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';

const AssessmentTable = ({ assessments, onView, onEdit, onShare, assessmentSections }) => {
  const scrollContainerRef = useRef(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const menuButtonRefs = useRef([]);

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
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="border border-t border-b">
              <div
                className="h-[calc(100vh-12rem)] overflow-y-auto pb-6"
                ref={scrollContainerRef}
              >
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[18%]">Assessment Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[10%]">No.of Sections</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[12%]">No.of Questions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[12%]">Difficulty Level</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[12%]">Total Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[18%]">Pass Score (Number / %)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[10%]">Duration</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[8%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {assessments.map((assessment, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 ${index === assessments.length - 1 ? 'mb-6' : ''}`}
                      >
                        <td className="px-6 py-1 text-sm text-custom-blue cursor-pointer" onClick={() => onView(assessment)}>
                          {assessment.AssessmentTitle}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{assessmentSections[assessment._id] ?? 0}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{assessment.NumberOfQuestions}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{assessment.DifficultyLevel}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{assessment.totalScore}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {assessment.passScore} {assessment.passScoreType === 'Percentage' ? '%' : 'Number'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{assessment.Duration}</td>
                        <td className="px-6 py-2 text-sm text-gray-600">
                          <Menu as="div" className="relative">
                            <Menu.Button
                              ref={(el) => (menuButtonRefs.current[index] = el)}
                              onClick={() => handleMenuOpen(index)}
                              className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                              <FiMoreHorizontal className="w-5 h-5 text-gray-600" />
                            </Menu.Button>
                            {openMenuIndex === index && (
                              <Menu.Items
                                className={`absolute w-48 bg-white rounded-lg shadow-lg border py-1 z-50 ${
                                  openUpwards ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'
                                }`}
                              >
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onView(assessment)}
                                      className={`${
                                        active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <FaEye className="w-4 h-4 text-blue-600" />
                                      View Details
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onEdit(assessment)}
                                      className={`${
                                        active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                    >
                                      <FaPencilAlt className="w-4 h-4 text-green-600" />
                                      Edit
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <Tooltip
                                      title={
                                        (assessmentSections[assessment._id] ?? 0) === 0
                                          ? 'No questions added'
                                          : 'Share'
                                      }
                                      enterDelay={300}
                                      leaveDelay={100}
                                      arrow
                                    >
                                      <span>
                                        <button
                                          onClick={() => onShare(assessment)}
                                          className={`${
                                            active ? 'bg-gray-50' : ''
                                          } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 ${
                                            (assessmentSections[assessment._id] ?? 0) === 0
                                              ? 'cursor-not-allowed opacity-50'
                                              : ''
                                          }`}
                                          disabled={(assessmentSections[assessment._id] ?? 0) === 0}
                                        >
                                          <FaShareAlt
                                            className={`w-4 h-4 ${
                                              (assessmentSections[assessment._id] ?? 0) === 0
                                                ? 'text-gray-400'
                                                : 'text-green-600'
                                            }`}
                                          />
                                          Share
                                        </button>
                                      </span>
                                    </Tooltip>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            )}
                          </Menu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AssessmentTable.propTypes = {
  assessments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      AssessmentTitle: PropTypes.string.isRequired,
      NumberOfQuestions: PropTypes.number,
      DifficultyLevel: PropTypes.string,
      totalScore: PropTypes.number,
      passScore: PropTypes.number,
      passScoreType: PropTypes.string,
      Duration: PropTypes.string,
    })
  ).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  assessmentSections: PropTypes.object.isRequired,
};

export default AssessmentTable;