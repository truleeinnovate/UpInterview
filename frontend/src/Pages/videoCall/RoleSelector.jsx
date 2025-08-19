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
  
      // NEW: Enable button ONLY if current time is within 15 minutes before start time OR after start time
      const shouldEnable = (currentTime >= startTime - fifteenMinutes);
      setIsButtonEnabled(shouldEnable);
  
      // Calculate time remaining display
      if (currentTime < startTime) {
        const diff = startTime - currentTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diff <= fifteenMinutes) {
          setTimeLeft(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`Scheduled for ${formatTime(interviewStart)}`);
        }
      } 
      else {
        setTimeLeft('Interview has started - Join now');
      }
    };
  
    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute
  
    return () => clearInterval(interval);
  }, [feedbackData?.interviewRound?.dateTime]);

  // useEffect(() => {
  //   if (!feedbackData?.interviewRound?.dateTime) return;

  //   // Parse start and end times from the interview data
  //   const { start: interviewStart, end: interviewEnd } = parseCustomDateTime(
  //     feedbackData.interviewRound.dateTime
  //   );
  //   if (!interviewStart || !interviewEnd) return;

  //   // Format times for display in user's local timezone
  //   const formatTime = (date) => {
  //     return date.toLocaleTimeString(undefined, {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true
  //     });
  //   };

  //   setLocalInterviewTime(formatTime(interviewStart));
  //   setLocalEndTime(formatTime(interviewEnd));

  //   // Update button state and countdown timer
  //   const updateTimes = () => {
  //     const now = new Date();
  //     const startTime = interviewStart.getTime();
  //     const currentTime = now.getTime();
  //     const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

  //     // CHANGED: Enable button ONLY if current time is within 15 minutes before start time
  //     // (Removed the end time check to only enable before interview starts)
  //     const shouldEnable = (currentTime >= startTime - fifteenMinutes) && 
  //                        (currentTime < startTime); // Only enable before start time
  //     setIsButtonEnabled(shouldEnable);

  //     // Calculate time remaining display
  //     if (currentTime < startTime) {
  //       const diff = startTime - currentTime;
  //       const hours = Math.floor(diff / (1000 * 60 * 60));
  //       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
  //       // CHANGED: Only show countdown when within the 15 minute window
  //       if (diff <= fifteenMinutes) {
  //         setTimeLeft(`Starts in ${hours}h ${minutes}m`);
  //       } else {
  //         setTimeLeft(`Scheduled for ${formatTime(interviewStart)}`);
  //       }
  //     } 
  //     else {
  //       setTimeLeft('Interview in progress');
  //     }
  //     // else if (currentTime < interviewEnd.getTime()) {
  //     //   setTimeLeft('Interview in progress');
  //     // } 
  //     // else {
  //     //   setTimeLeft('Interview completed');
  //     // }
  //   };

  //   updateTimes();
  //   const interval = setInterval(updateTimes, 60000); // Update every minute

  //   return () => clearInterval(interval);
  // }, [feedbackData?.interviewRound?.dateTime]);

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
          {feedbackData?.interviewRound?.dateTime && (
  <div className="mt-4 flex flex-col items-center">
    <div className="flex items-center justify-center gap-4 mb-2">
      {/* Calendar Icon */}
      <div className="bg-[#217989] bg-opacity-10 p-2 rounded-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-[#217989]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
      
      {/* Clock Icon */}
      <div className="bg-[#217989] bg-opacity-10 p-2 rounded-full">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-[#217989]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
    </div>

    {/* Main Time Display */}
    <div className="text-center">
     
      
      {/* Date */}
      <div className="text-gray-600 font-medium mt-1">
        {new Date(feedbackData.interviewRound.dateTime.split(' ')[0].split('-').reverse().join('-')).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>

      <div className="text-xl font-bold text-[#217989]">
        {localInterviewTime} 
        {/* - {localEndTime} */}
      </div>
      
      {/* Countdown Timer */}
      {/* {timeLeft && (
        <div className={`mt-3 px-4 py-2 rounded-full inline-flex items-center ${
          timeLeft.includes('Starts in') 
            ? 'bg-blue-100 text-blue-800' 
            : timeLeft.includes('Interview in progress') 
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {timeLeft.includes('Starts in') && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1 animate-pulse" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
              />
            </svg>
          )}
          <span className="text-sm font-semibold">{timeLeft}</span>
        </div>
      )} */}
    </div>
  </div>
)}

          {/* {feedbackData?.interviewRound?.dateTime && (
            <div className="mt-2 text-lg font-semibold text-[#217989]">
              {feedbackData?.interviewRound?.dateTime}
            </div>
          )} */}
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