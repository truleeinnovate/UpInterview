import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
// import { FaEye, FaPencilAlt, FaEllipsisV } from 'react-icons/fa';
import { Menu } from '@headlessui/react';

import StatusBadge from '../../CommonCode-AllTabs/StatusBadge';
import InterviewerAvatar from '../../CommonCode-AllTabs/InterviewerAvatar';
import EntityDetailsModal from './EntityDetailsModal';
import EntityDetailsSidebar from './EntityDetailsSidebar';
import { formatDate } from '../lib/utils';
import { motion } from 'framer-motion';

function InterviewTable({ interviews, onView,onViewPosition }) {
  console.log('interviews:', interviews);

  const [entityDetailsSidebar, setEntityDetailsSidebar] = useState(null);
  const [entityDetailsModal, setEntityDetailsModal] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const handleViewEntityDetails = (entity, type, viewType = 'sidebar') => {
    if (viewType === 'sidebar') {
      setEntityDetailsSidebar({ entity, type });
      setEntityDetailsModal(null);
    } else {
      setEntityDetailsModal({ entity, type });
      setEntityDetailsSidebar(null);
    }
  };

  const handleOpenEntityInNew = () => {
    if (entityDetailsSidebar) {
      setEntityDetailsModal(entityDetailsSidebar);
      setEntityDetailsSidebar(null);
    }
  };

  const toggleRowExpansion = (interviewId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [interviewId]: !prev[interviewId],
    }));
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col">
      {/* Desktop Table View */}
      <div className="hidden lg:flex xl:flex 2xl:flex flex-col flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-border rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Candidate Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interviewers
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Round
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created On
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {interviews.map((interview) => {
                    const candidate = interview.candidateId;
                    const position = interview.positionId;

                    // Access the nested rounds array
                    const rounds = interview.rounds || [];
                    console.log('rounds:', rounds);

                    const completedRounds = rounds.filter((round) => round.status === 'Completed').length;
                    const totalRounds = rounds.length;

                    // Find the next round
                    const nextRound = rounds
                      .filter((round) => ['Pending', 'Scheduled', 'Request Sent'].includes(round.status))
                      .sort((a, b) => a.sequence - b.sequence)[0] || null;


                    console.log('Next Round:', nextRound);
                    // Map interviewers and add isExternal based on interviewerType
                    const nextRoundInterviewers = nextRound?.interviewers?.map((interviewer) => ({
                      ...interviewer,
                      isExternal: nextRound?.interviewerType === 'external',
                    })) || [];


                    console.log('nextRoundInterviewers:', nextRoundInterviewers);

                    return (
                      <tr key={interview._id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {candidate?.imageUrl ? (
                                <img
                                  src={candidate.imageUrl}
                                  alt={candidate.LastName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">
                                    {candidate?.LastName?.charAt(0) || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-foreground">
                                  {candidate?.LastName || 'Unknown'}
                                </div>
                                {candidate && (
                                  <button
                                    // onClick={() => handleViewEntityDetails(candidate, 'candidate', 'sidebar')}
                                    onClick={() => onView(candidate)}

                                    className="ml-2 text-primary hover:text-primary/80"
                                    title="View details"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {candidate?.Email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-foreground">
                              {position?.title || 'Unknown'}
                            </div>
                            {position && (
                              <button
                                // onClick={() => handleViewEntityDetails(position, 'position', 'sidebar')}
                                onClick={() => onViewPosition(position)}

                                
                                className="ml-2 text-primary hover:text-primary/80"
                                title="View details"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {position?.companyname || 'No Company'} • {position?.Location || 'No location'}
                          </div>
                        </td>
                        {/* Interviewers */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {nextRoundInterviewers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {nextRoundInterviewers.map((interviewer) => (
                                <InterviewerAvatar
                                  key={interviewer?._id}
                                  interviewer={interviewer}
                                  size="sm"
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No interviewers assigned</span>
                          )}
                        </td>
                        {/* Progress */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {completedRounds} of {totalRounds} rounds
                          </div>
                          <div className="w-24 bg-secondary rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        {/* Next Round */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {nextRound ? (
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {nextRound.roundTitle}
                              </div>
                              <div className="flex items-center mt-1">
                                <StatusBadge status={nextRound.status} size="sm" />
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {nextRound.interviewType}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No upcoming rounds
                            </span>
                          )}
                        </td>
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(interview.createdAt)}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={interview.status} />
                        </td>
                        {/* Action */}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button
                              className="p-1 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                              onClick={(e) => e.stopPropagation()} // Fix click event issue
                            >
                              {/* <FaEllipsisV className="w-4 h-4 text-gray-500" /> */}
                            </Menu.Button>

                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to={`/interviews/${interview._id}`}
                                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-50' : ''}`}
                                  >
                                    {/* <FaEye className="w-4 h-4 text-blue-600" /> */}
                                    View Details
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to={`/interviews/${interview._id}/edit`}
                                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-50' : ''}`}
                                  >
                                    {/* <FaPencilAlt className="w-4 h-4 text-green-600" /> */}
                                    Edit
                                  </Link>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden xl:hidden 2xl:hidden h-full overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
        {interviews.map((interview) => {
          const candidate = interview.candidateId;
          const position = interview.positionId;

          // Ensure interview.rounds exists and is an array
          const roundsArray = Array.isArray(interview.rounds) ? interview.rounds : [];

          // Ensure interview.rounds[0]?.rounds exists and is an array
          const rounds = Array.isArray(roundsArray[0]?.rounds) ? roundsArray[0].rounds : [];

          const completedRounds = rounds.filter((round) => round.status === 'Completed').length;
          const totalRounds = rounds.length;


          // Find the next round
          const nextRound = rounds
            .filter((round) => ['Pending', 'Scheduled,'].includes(round.status))
            .sort((a, b) => a.sequence - b.sequence)[0];

          const nextRoundInterviewers = nextRound
            ? nextRound.interviewers.map((id) => id).filter(Boolean)
            : [];

          const isExpanded = expandedRows[interview._id];

          return (
            <motion.div
              key={interview._id}
              className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
              initial={false}
              animate={{ height: isExpanded ? 'auto' : '200px' }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14">
                      {candidate?.imageUrl ? (
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.LastName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-lg font-medium">
                            {candidate?.LastName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <div className="text-base sm:text-lg font-medium text-foreground">
                          {candidate?.LastName || 'Unknown'}
                        </div>
                        {candidate && (
                          <button
                            // onClick={() => handleViewEntityDetails(candidate, 'candidate', 'modal')}
                            onClick={() => onView(candidate)}
                            className="ml-2 text-primary hover:text-primary/80"
                            title="View details"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {candidate?.Email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={interview.status} size="lg" />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-foreground">
                          {position?.title || 'Unknown Position'}
                        </div>
                        {position && (
                          <button
                            // onClick={() => handleViewEntityDetails(position, 'position', 'modal')}
                            onClick={() => onViewPosition(position)}

                            className="ml-2 text-primary hover:text-primary/80"
                            title="View details"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(interview.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {position?.department || 'No department'} • {position?.location || 'No location'}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-foreground">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {completedRounds} of {totalRounds} rounds
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleRowExpansion(interview._id)}
                  className="mt-4 w-full flex items-center justify-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {nextRound ? (
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-foreground mb-2">
                            Next Round: {nextRound.roundTitle}
                          </div>
                          <div className="flex items-center">
                            <StatusBadge status={nextRound.status} size="sm" />
                            <span className="ml-2 text-xs text-muted-foreground">
                              {nextRound.interviewType}
                            </span>
                          </div>
                        </div>

                        {nextRoundInterviewers.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-foreground mb-2">
                              Interviewers
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {nextRoundInterviewers.map((interviewer) => (
                                <InterviewerAvatar
                                  key={interviewer?._id}
                                  interviewer={interviewer}
                                  size="md"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No upcoming rounds
                      </div>
                    )}

                    <Link
                      to={`/interviews/${interview._id}`}
                      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-secondary transition-colors"
                    >
                      View Full Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Entity Details Modals */}
      {/* {entityDetailsSidebar && (
        <EntityDetailsSidebar
          onClose={() => setEntityDetailsSidebar(null)}
          entity={entityDetailsSidebar.entity}
          entityType={entityDetailsSidebar.type}
          onOpenInNew={handleOpenEntityInNew}
        />
      )}

      {entityDetailsModal && (
        <EntityDetailsModal
          onClose={() => setEntityDetailsModal(null)}
          entity={entityDetailsModal.entity}
          entityType={entityDetailsModal.type}
        />
      )} */}
    </div>
  );
}

InterviewTable.propTypes = {
  interviews: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      candidateId: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        LastName: PropTypes.string.isRequired,
        Email: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
      }).isRequired,
      positionId: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        department: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
      }).isRequired,
      status: PropTypes.string.isRequired,
      rounds: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          status: PropTypes.string.isRequired,
          sequence: PropTypes.number.isRequired,
          interviewers: PropTypes.arrayOf(PropTypes.string).isRequired,
        })
      ).isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default InterviewTable;