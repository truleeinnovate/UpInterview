
// import { FaUserCircle, FaEye, FaPencilAlt, FaExternalLinkAlt, FaEnvelope, FaEllipsisV } from 'react-icons/fa';
import { useState, useRef, useEffect, useCallback } from "react";

import { Menu } from '@headlessui/react';
// import { MdOutlineLocalPhone } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


import React from 'react'

const CandidateTable = ({ candidates, onView, onEdit, isAssessmentContext, onSelectCandidates }) => {

  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates((prevSelected) => {
      const isSelected = prevSelected.includes(candidateId);
      const updatedSelection = isSelected
        ? prevSelected.filter((id) => id !== candidateId)
        : [...prevSelected, candidateId];

      return updatedSelection;
    });
  };

  useEffect(() => {
    if (onSelectCandidates) {
      onSelectCandidates(selectedCandidates);
    }
  }, [selectedCandidates, onSelectCandidates]);

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      const allCandidateIds = candidates.map((candidate) => candidate._id);
      setSelectedCandidates(allCandidateIds);
    }
  };

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
                    {isAssessmentContext && (
                      <th scope="col" className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.length === candidates.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    <th className={`${isAssessmentContext ? 'py-2' : 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'}`}>Candidate Name</th>
                    <th
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    //   onClick={() => handleSort('Email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Higher Qualification
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Experience
                    </th>
                    {/* <th 
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('Status')}
            >
              <div className="flex items-center gap-2">
                Status
                <FaSort className="w-4 h-4" />
              </div>
            </th> */}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills/Technology
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate, index) => candidate ?
                    (
                      <tr key={index} className="hover:bg-gray-50">
                        {/* Candidate profile column */}
                        {isAssessmentContext && (
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(candidate._id)}
                              onChange={() => handleSelectCandidate(candidate._id)}
                            />
                          </td>
                        )}
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0">
                              {candidate?.ImageData ? (
                                <img
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={`http://localhost:5000/${candidate?.ImageData?.path}`}
                                  alt={candidate?.FirstName || "Candidate"}
                                  onError={(e) => { e.target.src = "/default-profile.png"; }}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                                  {candidate.FirstName ? candidate.FirstName.charAt(0) : '?'}
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-custom-blue">{(candidate?.FirstName + " " || '') + (candidate.LastName || '')}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {/* <FaEnvelope className="w-3 h-3" /> */}
                              <span>{candidate.Email || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              {/* <MdOutlineLocalPhone className="w-4 h-4" /> */}
                              <span>{candidate.Phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        {/* Location column */}
                        <td className="px-4 py-2 whitespace-nowrap">

                          <span className="flex items-center gap-1 text-sm text-gray-600">{candidate.HigherQualification || 'N/A'}</span>

                        </td>
                        {/* Department column */}
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {/* <FaBuilding className="w-3 h-3" /> */}
                            <span>{candidate.CurrentExperience || 'N/A'}</span>
                          </div>
                        </td>
                        {/* Status column */}
                        {/* <td className="px-4 py-2 whitespace-nowrap">
                <span className={classNames(
                  "px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full",
                  {
                    "bg-green-100 text-green-800": candidate?.Status === "active",
                    "bg-yellow-100 text-yellow-800": candidate?.Status === "onhold",
                    "bg-red-100 text-red-800": candidate?.Status === "rejected"
                  }
                )}>
                  {candidate?.Status ? candidate?.Status.charAt(0).toUpperCase() + candidate?.Status.slice(1) : "?"}
                </span>
              </td> */}
                        {/* Skills column */}
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs">
                                {skill.skill || 'N/A'}
                              </span>
                            ))}
                            {candidate.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                                +{candidate.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Actions column */}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                              {/* <FaEllipsisV className="w-4 h-4 text-gray-500" /> */}
                            </Menu.Button>
                            <Menu.Items className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10
                  ${index >= candidates.length - 4
                              && "-top-44" // Open upward for last four candidates
                              // : "top-full"
                              }`}
                            >
                              {/* View details action */}
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onView(candidate)}
                                    // onClick={() => handleView(candidate)}
                                    className={`${active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    {/* <FaEye className="w-4 h-4 text-blue-600" /> */}
                                    View Details
                                  </button>
                                )}
                              </Menu.Item>
                              {/* 360° view action */}
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => candidate?._id && navigate(`/candidate/${candidate._id}`)}
                                    className={`${active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    {/* <FaUserCircle className="w-4 h-4 text-purple-600" /> */}
                                    360° View
                                  </button>
                                )}
                              </Menu.Item>
                              {/* Edit action */}
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onEdit(candidate)}
                                    className={`${active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    {/* <FaPencilAlt className="w-4 h-4 text-green-600" /> */}
                                    Edit
                                  </button>
                                )}
                              </Menu.Item>
                              {/* Open in new tab action */}
                              {/* <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => window.open('/candidate', '_blank')}
                                    className={`${active ? 'bg-gray-50' : ''
                                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    <FaExternalLinkAlt className="w-4 h-4 text-custom-blue" />
                                    Open in New Tab
                                  </button>
                                )}
                              </Menu.Item> */}
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

