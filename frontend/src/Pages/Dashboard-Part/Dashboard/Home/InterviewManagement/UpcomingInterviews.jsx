import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Video, CheckCircle, XCircle } from 'lucide-react';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { parse, isValid, isAfter, startOfDay } from 'date-fns';

const InterviewerSchedule = () => {
  const navigate = useNavigate();
  const { interviewData } = useCustomContext();
  const [roundsData, setRoundsData] = useState([]);

  // Process interviewData to extract rounds
  useEffect(() => {
    if (interviewData && interviewData.length > 0) {
      console.log("Processing interview data for rounds");
      const allRounds = [];

      interviewData.forEach((interview, index) => {
        console.log(`Processing interview ${index}:`, interview._id);

        if (interview.rounds && Array.isArray(interview.rounds)) {
          console.log(`Interview ${index} has ${interview.rounds.length} rounds`);

          interview.rounds.forEach((round, roundIndex) => {
            console.log(`Round ${roundIndex} in interview ${index}:`, round);

            if (!round.dateTime || round.dateTime === "No date available") {
              console.log(`Round ${roundIndex} in interview ${index} has no valid dateTime, skipping`);
              return;
            }

            allRounds.push({
              id: `${interview._id}_${roundIndex}`,
              roundObject: round,
              dateTime: round.dateTime,
              interviewTitle: interview.Title || "Interview",
              roundTitle: round.roundTitle || `Round ${roundIndex + 1}`,
              interviewId: interview._id,
              candidateName: interview.Candidate || "Unknown Candidate",
              position:
                interview.positionId && typeof interview.positionId === 'object'
                  ? interview.positionId.title
                  : interview.Position || "Unknown Position",
              roundIndex,
              interviewers: round.interviewers || [],
              status: round.status || "Pending",
              platform: round.meetLink?.[0]?.link ? new URL(round.meetLink[0].link).hostname : "Zoom",
            });
          });
        } else {
          console.log(`Interview ${index} has no rounds or rounds is not an array`);
        }
      });

      // Sort rounds by dateTime and filter for today or future
      const now = new Date();
      const today = startOfDay(now);
      const filteredAndSortedRounds = allRounds
        .filter((round) => {
          const roundDate = parse(round.dateTime, 'dd-MM-yyyy h:mm a', new Date());
          return isValid(roundDate) && isAfter(roundDate, today);
        })
        .sort((a, b) => {
          const dateA = parse(a.dateTime, 'dd-MM-yyyy h:mm a', new Date());
          const dateB = parse(b.dateTime, 'dd-MM-yyyy h:mm a', new Date());
          return dateA - dateB;
        })
        .slice(0, 3); // Limit to 3 rounds

      console.log("Final rounds data:", filteredAndSortedRounds);
      setRoundsData(filteredAndSortedRounds);
    }
  }, [interviewData]);

  // Date and time formatting
  const displayDateTime = (dateTimeStr) => {
    if (!dateTimeStr || dateTimeStr === "No date available") {
      return "No date available";
    }
    try {
      const parsedDate = parse(dateTimeStr, 'dd-MM-yyyy h:mm a', new Date());
      if (!isValid(parsedDate)) {
        return "Invalid date";
      }
      return parsedDate.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

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
          className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="text-sm font-medium">View All</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 -mr-2">
        {roundsData.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming interview rounds found.</p>
        ) : (
          roundsData.map((round) => {
            const statusToShow = round.status || 'Pending';
            const platform = round.platform || 'Zoom';

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
                      <p className="text-sm text-gray-600">{round.position}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Video size={16} className="flex-shrink-0" />
                        <span>{platform}</span>
                      </div>
                      <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.roundTitle}
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