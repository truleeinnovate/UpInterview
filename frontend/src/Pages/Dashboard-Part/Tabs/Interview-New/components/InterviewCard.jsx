//<-----v1.0.0-------Venkatesh---------add current round column
// v1.0.1 - Ashok - made first letter capital
// v1.0.2 - Ashok - fixed style issues
// v1.0.3 - Ashok - style issues fixed

import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Briefcase,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
// import StatusBadge from "../../CommonCode-AllTabs/StatusBadge";
import InterviewerAvatar from "../../CommonCode-AllTabs/InterviewerAvatar";
import {
  Card,
  CardContent,
  CardFooter,
} from "../../CommonCode-AllTabs/ui/card";
import { Button } from "../../CommonCode-AllTabs/ui/button";
import { motion } from "framer-motion";
import { formatDate } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import StatusBadge from "../../../../../Components/SuperAdminComponents/common/StatusBadge";

function InterviewCard({
  interview,
  onView,
  onViewPosition,
  onViewInterview,
  onEditInterview,
  effectivePermissions,
}) {
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [position, setPosition] = useState(null);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (interview) {
      setCandidate(interview?.candidateId || null);
      setPosition(interview?.positionId || null);
      // setInterview(interviewData?.interviewRounds || []);
      setTemplate(interview?.templateId || null);
    }
  }, [interview]);
  // const { getCandidateById, getPositionById, getInterviewerById } = useInterviewContext();

  const [entityDetailsSidebar, setEntityDetailsSidebar] = useState(null);
  const [entityDetailsModal, setEntityDetailsModal] = useState(null);

  // const candidate = getCandidateById(interview.candidateId);
  // const position = getPositionById(interview.positionId);

  // const completedRounds = interview?.rounds?.filter(round => round.status === 'Completed').length;
  // const totalRounds = interview?.rounds?.length;

  // const nextRound = interview?.rounds?.filter(round => ['Pending', 'Scheduled'].includes(round.status))
  //   .sort((a, b) => a.sequence - b.sequence)[0];

  // const nextRoundInterviewers = nextRound
  // ? nextRound.interviewers.map(id => getInterviewerById(id)).filter(Boolean)
  // : [];

  // const handleViewEntityDetails = (entity, type, viewType = 'sidebar') => {
  //   if (viewType === 'sidebar') {
  //     setEntityDetailsSidebar({ entity, type });
  //     setEntityDetailsModal(null);
  //   } else {
  //     setEntityDetailsModal({ entity, type });
  //     setEntityDetailsSidebar(null);
  //   }
  // };

  // const handleOpenEntityInNew = () => {
  //   if (entityDetailsSidebar) {
  //     setEntityDetailsModal(entityDetailsSidebar);
  //     setEntityDetailsSidebar(null);
  //   }
  // };
  //<-----v1.0.0-------
  const rounds = interview.rounds || [];
  const currentRound =
    rounds
      .filter((round) => ["Scheduled", "RequestSent"].includes(round.status))
      .sort((a, b) => a.sequence - b.sequence)[0] || null;
  const currentRoundInterviewers = currentRound?.interviewers || [];
  const nextRound =
    rounds
      .filter((round) => ["Scheduled", "RequestSent"].includes(round.status))
      .sort((a, b) => a.sequence - b.sequence)[1] || null;
  const nextRoundInterviewers = nextRound?.interviewers || [];
  const totalRounds = rounds.length;
  const completedRounds = rounds.filter(
    (round) => round.status === "Completed"
  ).length;
  //-----v1.0.0------->

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 gradient-card shadow-card">
          <CardContent className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
              <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                <div className="flex-shrink-0">
                  {candidate?.imageUrl ? (
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.LastName}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-custom-blue/10 flex items-center justify-center">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-custom-blue" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center truncate">
                      <p
                        className="text-sm font-medium text-custom-blue cursor-pointer"
                        onClick={() => navigate(`/interviews/${interview._id}`)}
                      >
                        {interview?.interviewCode || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                      {candidate?.LastName
                        ? candidate?.LastName.charAt(0).toUpperCase() +
                          candidate?.LastName.slice(1)
                        : "Unknown Candidate"}
                    </h3>
                    {candidate && (
                      <button
                        onClick={() => onView(candidate)}
                        className="text-primary hover:text-primary/80"
                        title="View details"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                    <div className="flex items-center truncate">
                      <span className="truncate">
                        {position?.title.charAt(0).toUpperCase() +
                          position?.title.slice(1) || "Unknown Position"}
                      </span>
                      {position && (
                        <button
                          // onClick={() => handleViewEntityDetails(position, 'position', 'sidebar')}
                          onClick={() => onViewPosition(position)}
                          className="text-primary hover:text-primary/80 ml-2 flex-shrink-0"
                          title="View details"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <StatusBadge status={capitalizeFirstLetter(interview?.status)} />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Created At: {formatDateTime(interview.createdAt)}</span>
              </div>

              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>
                  Progress: {completedRounds} of {totalRounds} Rounds Completed
                </span>
              </div>
            </div>
            {/*<-----v1.0.0------- */}
            {currentRound && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
                      Current: {currentRound.roundName}
                    </h4>
                    {/* v1.0.1 <-------------------------------------------------------- */}
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {capitalizeFirstLetter(currentRound.roundTitle)} •{" "}
                      {capitalizeFirstLetter(currentRound.interviewType)}
                    </p>
                    {/* v1.0.1 --------------------------------------------------------> */}
                  </div>
                  <StatusBadge
                    status={capitalizeFirstLetter(currentRound?.status)}
                  />
                </div>

                {currentRoundInterviewers.length > 0 && (
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-green-600 dark:text-green-400 mr-2">
                      Interviewers:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {currentRoundInterviewers.map((interviewer, index) => (
                        <div
                          key={interviewer?.id || index}
                          className="flex items-center bg-white/50 dark:bg-black/10 rounded-full px-2 py-1"
                        >
                          <InterviewerAvatar
                            interviewer={interviewer}
                            size="sm"
                          />
                          <span className="ml-1 text-xs text-green-600 dark:text-green-400 truncate max-w-[120px]">
                            {interviewer?.name}
                            {interviewer?.isExternal && (
                              <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                                (Outsourced)
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/*-----v1.0.0-------> */}

            {nextRound && (
              <div className="mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-custom-blue dark:text-blue-300">
                      Next: {nextRound.roundName}
                    </h4>
                    {/* v1.0.1 <--------------------------------------------------------- */}
                    <p className="text-xs text-custom-blue dark:text-blue-400 mt-1">
                      {capitalizeFirstLetter(nextRound.roundTitle)} •{" "}
                      {capitalizeFirstLetter(nextRound.interviewType)}
                    </p>
                    {/* v1.0.1 ---------------------------------------------------------> */}
                  </div>
                  <StatusBadge
                    status={capitalizeFirstLetter(nextRound?.status)}
                  />
                </div>

                {nextRoundInterviewers.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-custom-blue dark:text-blue-400">
                        Interviewers:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {nextRoundInterviewers.map((interviewer, index) => (
                          <div
                            key={interviewer?.id || index}
                            className="flex items-center bg-white/50 dark:bg-black/10 rounded-full px-2 py-1"
                          >
                            <InterviewerAvatar
                              interviewer={interviewer}
                              size="sm"
                            />
                            <span className="ml-1 text-xs text-custom-blue dark:text-blue-400 truncate max-w-[120px]">
                              {interviewer?.name}
                              {interviewer?.isExternal && (
                                <span className="text-xs text-orange-600 dark:text-orange-400 ml-1">
                                  (Outsourced)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 sm:p-4 pt-0 flex justify-end">
            <Link
              to={`/interviews/${interview._id}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto bg-custom-blue hover:bg-custom-blue/90"
              >
                View Details
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>

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
    </>
  );
}

export default InterviewCard;
