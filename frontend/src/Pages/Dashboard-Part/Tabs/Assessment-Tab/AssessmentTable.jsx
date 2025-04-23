
import { FaUserCircle, FaEye, FaPencilAlt, FaShareAlt, FaEnvelope, FaEllipsisV } from 'react-icons/fa';

import { Menu } from '@headlessui/react';
import { MdOutlineLocalPhone } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


import React from 'react'

const CandidateTable = ({ assessments, onView, onEdit,onShare }) => {

    const navigate = useNavigate();
    return (
        <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
            <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border border-border rounded-lg">
                            <table className="min-w-full divide-y divide-border">
                                {/* Table header */}
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assessment Name
                                        </th>
                                        {/* <th
                                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Assessment Type
                                        </th> */}
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No.of Questions
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Difficulty Level
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Score
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pass Score (Number / %)
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                {/* Table body */}
                                <tbody className="divide-y divide-gray-200">
                                    {assessments.map((assessment, index) => assessment ?
                                        (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {/* <FaBuilding className="w-3 h-3" /> */}
                                                        <span> {assessment.AssessmentTitle}</span>
                                                    </div>
                                                </td>
                                                {/* <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <span> {Array.isArray(assessment.AssessmentType)
                                                            ? assessment.AssessmentType.join(', ')
                                                            : assessment.AssessmentType}</span>
                                                    </div>
                                                </td> */}
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {/* <FaBuilding className="w-3 h-3" /> */}
                                                        <span> {assessment.NumberOfQuestions}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {/* <FaBuilding className="w-3 h-3" /> */}
                                                        <span> {assessment.DifficultyLevel}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {/* <FaBuilding className="w-3 h-3" /> */}
                                                        <span> {assessment.totalScore}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {/* <FaBuilding className="w-3 h-3" /> */}
                                                        <span> {assessment.passScore} {assessment.passScoreType === "Percentage" ? "%" : "Number"}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        {/* <FaBuilding className="w-3 h-3" /> */}
                                                        <span>{assessment.Duration}</span>
                                                    </div>
                                                </td>
                                                {/* Actions column */}
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                    <Menu as="div" className="relative">
                                                        <Menu.Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                                            <FaEllipsisV className="w-4 h-4 text-gray-500" />
                                                        </Menu.Button>
                                                        <Menu.Items className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10
                  ${index >= assessment.length - 4
                                                            && "-top-44" // Open upward for last four candidates
                                                            // : "top-full"
                                                            }`}
                                                        >
                                                            {/* View details action */}
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => onView(assessment)}
                                                                        // onClick={() => handleView(candidate)}
                                                                        className={`${active ? 'bg-gray-50' : ''
                                                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                    >
                                                                        <FaEye className="w-4 h-4 text-blue-600" />
                                                                        View Details
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            {/* 360° view action */}
                                                            {/* <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => assessment?._id && navigate(`/assessment-details/${assessment._id}`)}
                                                                        className={`${active ? 'bg-gray-50' : ''
                                                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                    >
                                                                        <FaUserCircle className="w-4 h-4 text-purple-600" />
                                                                        360° View
                                                                    </button>
                                                                )}
                                                            </Menu.Item> */}
                                                            {/* Edit action */}
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => onEdit(assessment)}
                                                                        className={`${active ? 'bg-gray-50' : ''
                                                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                    >
                                                                        <FaPencilAlt className="w-4 h-4 text-green-600" />
                                                                        Edit
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                    onClick={() => onShare(assessment)} 
                                                                        className={`${active ? 'bg-gray-50' : ''
                                                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                                                    >
                                                                        <FaShareAlt className="w-4 h-4 text-green-600" />
                                                                    Share
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        </Menu.Items>
                                                    </Menu>
                                                </td>
                                            </tr>
                                        ) : null)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CandidateTable

