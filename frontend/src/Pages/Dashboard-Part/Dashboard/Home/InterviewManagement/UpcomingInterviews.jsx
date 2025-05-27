import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, CheckCircle, XCircle } from 'lucide-react';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { parse, isValid } from 'date-fns';

const InterviewerSchedule = () => {
  const navigate = useNavigate();
  const { interviewData, fetchInterviewData } = useCustomContext();
  const [roundsData, setRoundsData] = useState({});

  // Process interviewData to extract rounds (from old code)
  useEffect(() => {
    if (interviewData && interviewData.length > 0) {
      console.log("Processing interview data for rounds");
      const rounds = {};

      interviewData.forEach((interview, index) => {
        console.log(`Processing interview ${index}:`, interview._id);

        if (interview.rounds && Array.isArray(interview.rounds)) {
          console.log(`Interview ${index} has ${interview.rounds.length} rounds`);

          interview.rounds.forEach((round, roundIndex) => {
            console.log(`Round ${roundIndex} in interview ${index}:`, round);

            const roundKey = `${interview._id}_${roundIndex}`;

            rounds[roundKey] = {
              id: roundKey,
              roundObject: round,
              dateTime: round.dateTime || interview.DateTime || "No date available",
              interviewTitle: interview.Title || "Interview",
              roundTitle: round.roundTitle || "",
              interviewId: interview._id,
              candidateName: interview.Candidate,
              position: interview.positionId && typeof interview.positionId === 'object'
                ? interview.positionId.title
                : interview.Position,
              roundIndex: roundIndex,
              interviewers: round.interviewers,
              status: round.status || interview.Status || "Pending"
            };

            if (!interview.roundKeys) {
              interview.roundKeys = [];
            }
            interview.roundKeys.push(roundKey);
          });
        } else {
          console.log(`Interview ${index} has no rounds or rounds is not an array`);
        }
      });

      console.log("Final rounds data:", rounds);
      setRoundsData(rounds);
    }
  }, [interviewData]);

  // Date and time extraction functions (from old code)
  const extractDate = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "No date available") {
      return null;
    }

    try {
      const [date] = dateTimeStr.split(' ');
      const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
      if (!isValid(parsedDate)) {
        return null;
      }
      return parsedDate;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const extractTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "No date available") {
      return null;
    }

    try {
      const parts = dateTimeStr.split(' ');
      if (parts.length < 3) {
        return null;
      }
      const time = parts[1] + ' ' + parts[2];
      const parsedTime = parse(time, 'h:mm a', new Date());
      if (!isValid(parsedTime)) {
        return null;
      }
      return parsedTime;
    } catch (error) {
      console.error("Error parsing time:", error);
      return null;
    }
  };

  const displayDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "No date available") {
      return "No date available";
    }
    const dashIndex = dateTimeStr.indexOf(' - ');
    if (dashIndex > 0) {
      return dateTimeStr.substring(0, dashIndex);
    }
    return dateTimeStr;
  };

  // Filter and sort interviews (adapted from old code)
  const sortedInterviews = interviewData
    .filter(interview => {
      if (!interview.roundKeys || interview.roundKeys.length === 0) {
        console.log("Interview has no round keys, skipping:", interview._id);
        return false;
      }

      let validRound = null;
      let validRoundKey = null;

      for (const roundKey of interview.roundKeys) {
        const round = roundsData[roundKey];
        if (!round || !round.dateTime || round.dateTime === "No date available") continue;

        const interviewDate = extractDate(round.dateTime);
        if (!interviewDate) continue;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const isCurrentOrFuture = interviewDate >= today;

        if (isCurrentOrFuture) {
          validRound = round;
          validRoundKey = roundKey;
          break;
        }
      }

      if (validRound) {
        if (interview.roundKeys[0] !== validRoundKey) {
          const index = interview.roundKeys.indexOf(validRoundKey);
          if (index > 0) {
            interview.roundKeys.splice(index, 1);
            interview.roundKeys.unshift(validRoundKey);
          }
        }
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      const roundA = a.roundKeys && a.roundKeys.length > 0 ? roundsData[a.roundKeys[0]] : null;
      const roundB = b.roundKeys && b.roundKeys.length > 0 ? roundsData[b.roundKeys[0]] : null;

      if (!roundA || !roundB) return 0;

      const dateA = extractDate(roundA.dateTime);
      const dateB = extractDate(roundB.dateTime);

      if (!dateA || !dateB) {
        return 0;
      }

      const dateComparison = dateA - dateB;
      if (dateComparison !== 0) {
        return dateComparison;
      }

      const timeA = extractTime(roundA.dateTime);
      const timeB = extractTime(roundB.dateTime);

      if (!timeA || !timeB) {
        return 0;
      }

      return timeA - timeB;
    });

  // Limit to 3 interviews for display (similar to the static schedule in the new UI)
  const displayedInterviews = sortedInterviews.slice(0, 3);

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Interviews</h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/interviewList')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300"
        >
          <span className="text-sm font-medium">View More</span>
          <Calendar size={18} />
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 -mr-2">
        {displayedInterviews.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming interviews found.</p>
        ) : (
          displayedInterviews.map((interview) => {
            const round = interview.roundKeys && interview.roundKeys.length > 0 ? roundsData[interview.roundKeys[0]] : null;
            if (!round) return null;

            const statusToShow = round.status || interview.Status || 'Pending';
            const platform = round.platform || 'Zoom'; // Assuming a default platform; adjust as needed

            return (
              <div
                key={round.id}
                className="p-4 border border-gray-100 rounded-xl hover:border-purple-100 hover:bg-purple-50/5 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{displayDateTime(round.dateTime)}</span>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          statusToShow === 'Confirmed' || statusToShow === 'Scheduled' || statusToShow === 'Completed'
                            ? 'bg-green-100 text-green-600'
                            : statusToShow === 'Pending' || statusToShow === 'Reschedule'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {statusToShow}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{round.candidateName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{round.position || 'No Position'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Video size={16} className="flex-shrink-0" />
                        <span>{platform}</span>
                      </div>
                      <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.roundTitle || 'Interview Round'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {(statusToShow === 'Confirmed' || statusToShow === 'Scheduled' || statusToShow === 'Completed') ? (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-300">
                        <CheckCircle size={20} />
                      </button>
                    ) : (
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300">
                        <XCircle size={20} />
                      </button>
                    )}
                    <button className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-300 whitespace-nowrap">
                      Join Call
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InterviewerSchedule;