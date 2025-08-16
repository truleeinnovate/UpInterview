import React, { useEffect, useState } from 'react';
import { Users, User, MessageSquare } from 'lucide-react';

const RoleSelector = ({ onRoleSelect, roleInfo,feedbackData }) => {
  // Determine which sections to show based on roleInfo
  // const showCandidateSection = !roleInfo?.hasRolePreference || roleInfo?.isCandidate;
  // const showInterviewerSection = !roleInfo?.hasRolePreference || roleInfo?.isInterviewer;
  // const isSingleRole = roleInfo?.hasRolePreference && (roleInfo?.isCandidate || roleInfo?.isInterviewer);

  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [localInterviewTime, setLocalInterviewTime] = useState('');
  const [localEndTime, setLocalEndTime] = useState('');

  // Parse custom datetime format "DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM"
  const parseCustomDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { start: null, end: null };
    
    const [startPart, endPart] = dateTimeStr.split(' - ');
    const [datePart, startTime, startPeriod] = startPart.split(/\s+/);
    const [endTime, endPeriod] = endPart.split(/\s+/);
    
    const parseTime = (dateStr, timeStr, period) => {
      const [day, month, year] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      let hours24 = hours;
      if (period === 'PM' && hours < 12) hours24 += 12;
      if (period === 'AM' && hours === 12) hours24 = 0;
      
      return new Date(year, month - 1, day, hours24, minutes);
    };
    
    return {
      start: parseTime(datePart, startTime, startPeriod),
      end: parseTime(datePart, endTime, endPeriod)
    };
  };

  useEffect(() => {
    if (!feedbackData?.interviewRound?.dateTime) return;

    // Parse start and end times from the interview data
    const { start: interviewStart, end: interviewEnd } = parseCustomDateTime(
      feedbackData.interviewRound.dateTime
    );
    if (!interviewStart || !interviewEnd) return;

    // Format times for display in user's local timezone
    const formatTime = (date) => {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    setLocalInterviewTime(formatTime(interviewStart));
    setLocalEndTime(formatTime(interviewEnd));

    // Update button state and countdown timer
    const updateTimes = () => {
      const now = new Date();
      const startTime = interviewStart.getTime();
      const currentTime = now.getTime();
      const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

      // CHANGED: Enable button ONLY if current time is within 15 minutes before start time
      // (Removed the end time check to only enable before interview starts)
      const shouldEnable = (currentTime >= startTime - fifteenMinutes) && 
                         (currentTime < startTime); // Only enable before start time
      setIsButtonEnabled(shouldEnable);

      // Calculate time remaining display
      if (currentTime < startTime) {
        const diff = startTime - currentTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        // CHANGED: Only show countdown when within the 15 minute window
        if (diff <= fifteenMinutes) {
          setTimeLeft(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`Scheduled for ${formatTime(interviewStart)}`);
        }
      } else if (currentTime < interviewEnd.getTime()) {
        setTimeLeft('Interview in progress');
      } else {
        setTimeLeft('Interview completed');
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [feedbackData?.interviewRound?.dateTime]);

  // Determine which sections to show based on roleInfo
  const showCandidateSection = !roleInfo?.hasRolePreference || roleInfo?.isCandidate;
  const showInterviewerSection = !roleInfo?.hasRolePreference || roleInfo?.isInterviewer;
  const isSingleRole = roleInfo?.hasRolePreference && (roleInfo?.isCandidate || roleInfo?.isInterviewer);


  console.log("feedbackData",feedbackData);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#217989] to-[#1a616e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#217989] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Interview Portal</h1>
          {timeLeft && (
            <div className="mt-2 text-lg font-semibold text-[#217989]">
              {timeLeft}
            </div>
          )}
          <p className="text-gray-600 mt-2">
            {isSingleRole 
              ? (roleInfo?.isCandidate ? 'Welcome Candidate!' : 'Welcome Interviewer!')
              : 'Select your role to continue'
            }
          </p>
        </div>
        
        <div className={`grid gap-8 mb-8 ${isSingleRole ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
         

          {/* Interviewer Instructions */}
          {showInterviewerSection && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[#217989]" />
                <h3 className="text-lg font-semibold text-gray-800">For Interviewers</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <p>Review candidate details and resume before starting</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <p>Prepare interview questions based on the role</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <p>Use the feedback form to document your assessment</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <p>Rate candidate skills and provide detailed comments</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                  <p>Submit feedback immediately after the interview</p>
                </div>
              </div>
             
              <button
                onClick={() => onRoleSelect('interviewer')}
                disabled={!isButtonEnabled}
                className={`w-full ${
                  isButtonEnabled 
                    ? 'bg-[#217989] hover:bg-[#1a616e] hover:scale-105' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3`}
              >
                <Users className="w-5 h-5" />
                {isButtonEnabled 
                  ? (roleInfo?.isInterviewer ? 'Start Interview' : 'Join as Interviewer')
                  : 'Join (Available 15 mins before)'}
              </button>

              {/* <button
                onClick={() => onRoleSelect('interviewer')}
                // className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
                disabled={!isButtonEnabled}
                className={`w-full ${
                  isButtonEnabled 
                    ? 'bg-[#217989] hover:bg-[#1a616e] hover:scale-105' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3`}
              >
                <Users className="w-5 h-5" />
                {isButtonEnabled 
                  ? (roleInfo?.isInterviewer ? 'Start Interview' : 'Join as Interviewer')
                  : 'Join (Available 15 mins before)'}
              
              </button> */}
            </div>
          )}
        </div>
          {/* {roleInfo?.isInterviewer ? 'Start Interview' : 'Join as Interviewer'} */}

        {/* General Interview Guidelines */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#217989]" />
            General Interview Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Technical Requirements</h4>
              <ul className="space-y-1">
                <li>• Stable internet connection required</li>
                <li>• Chrome or Firefox browser recommended</li>
                <li>• Enable camera and microphone permissions</li>
                <li>• Close unnecessary applications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Interview Etiquette</h4>
              <ul className="space-y-1">
                <li>• Maintain professional appearance</li>
                <li>• Speak clearly and at moderate pace</li>
                <li>• Ask questions if something is unclear</li>
                <li>• Be respectful and courteous</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;