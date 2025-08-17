import React, { useEffect, useState } from 'react';
import { Video, LogOut, MessageSquare, Clock, MapPin } from 'lucide-react';

import { formatToLocalTime, formatDuration, getTimeUntilInterview, getDateStatus } from '../../utils/timezoneUtils';

const CandidateView = ({ onBack, feedbackData, decodedData }) => {
  console.log("CandidateView feedbackData", feedbackData);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);
  const [localInterviewTime, setLocalInterviewTime] = useState('');
  const [localEndTime, setLocalEndTime] = useState('');


  // Parse custom datetime format "DD-MM-YYYY HH:MM AM/PM - HH:MM AM/PM"
  const parseCustomDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { start: null, end: null };

    const [startPart, endPart] = dateTimeStr.split(' - ');
    const [startDate, startTime, startPeriod] = startPart.split(/\s+/);
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
      start: parseTime(startDate, startTime, startPeriod),
      end: parseTime(startDate, endTime, endPeriod)
    };
  };

  useEffect(() => {
    if (!feedbackData?.round?.dateTime) return;

    // Parse start and end times
    const { start: interviewStart, end: interviewEnd } = parseCustomDateTime(feedbackData.round.dateTime);
    if (!interviewStart || !interviewEnd) return;

    // Format local times for display
    const formatTime = (date) => {
      return date.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    setLocalInterviewTime(formatTime(interviewStart));
    setLocalEndTime(formatTime(interviewEnd));

    // Update button state and countdown
    const updateTimes = () => {
      const now = new Date();
      const startTime = interviewStart.getTime();
      const endTime = interviewEnd.getTime();
      const currentTime = now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;

      // Enable button only if current time is within ±15 minutes of interview time
      const shouldEnable = (currentTime >= startTime - fifteenMinutes) &&
        (currentTime <= endTime + fifteenMinutes);
      setIsButtonEnabled(shouldEnable);

      // Calculate time remaining
      if (currentTime < startTime) {
        // Before interview starts
        const diff = startTime - currentTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Starts in ${hours}h ${minutes}m`);
      } else if (currentTime <= endTime) {
        // During interview
        const diff = endTime - currentTime;
        const minutes = Math.floor(diff / (1000 * 60));
        setTimeLeft(`Ends in ${minutes}m`);
      } else {
        // After interview
        setTimeLeft('Interview completed');
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [feedbackData?.round?.dateTime]);

  console.log("  {feedbackData?.round?.duration}", feedbackData?.round?.duration);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#217989] to-[#1a616e] p-4">
      <div className="max-w-6xl mx-auto">
        {/* <button
          onClick={onBack}
          className="mb-6 text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Back to Role Selection</span>
        </button> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-3  xl:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 2xl:col-span-2 xl:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-[#217989] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {feedbackData?.FirstName || feedbackData?.LastName ? feedbackData?.FirstName + " " + feedbackData?.LastName : "Not Available"}!</h1>
                <p className="text-gray-600 text-base">Ready to join your interview?</p>


                {feedbackData?.round?.dateTime && (
                  <div className="mt-3">
                    {(() => {
                      const { start, end } = parseCustomDateTime(feedbackData?.round?.dateTime);
                      const now = new Date();
                      const diffMs = start - now;
                      const diffHours = diffMs / (1000 * 60 * 60);
                      const diffMinutes = Math.floor(diffMs / (1000 * 60));
                      const fifteenMinutes = 15 * 60 * 1000;

                      let text = '';
                      let color = '';

                      if (diffMs > 12 * 60 * 60 * 1000) {
                        // More than 12 hours left
                        // (in ${Math.floor(diffHours)}h ${Math.floor((diffMinutes % 60))}m)
                        text = `Interview not yet started `;
                        color = 'text-red-600 bg-red-100';
                      } else if (diffMs > fifteenMinutes) {
                        // Within 12 hours but not yet in 15 min window
                        text = `Interview is scheduled (starts in ${Math.floor(diffHours)}h ${Math.floor((diffMinutes % 60))}m)`;
                        color = 'text-blue-600 bg-blue-100';
                      } else if (diffMs > 0 && diffMs <= fifteenMinutes) {
                        // 15 minutes before start
                        text = 'Interview started, please join';
                        color = 'text-green-600 bg-green-100';
                      } else if (now >= start && now <= end) {
                        // During interview
                        const minsLeft = Math.floor((end - now) / (1000 * 60));
                        text = `Interview in progress (ends in ${minsLeft}m)`;
                        color = 'text-green-600 bg-green-100';
                      } else if (now > end) {
                        // Interview finished
                        text = 'Interview time has passed';
                        color = 'text-red-600 bg-red-100';
                      } else {
                        text = 'Interview status unknown';
                        color = 'text-gray-600 bg-gray-100';
                      }

                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                          {text}
                        </span>
                      );
                    })()}
                  </div>
                )}




                {/* {feedbackData?.round?.dateTime && (
                  <div className="mt-3">
                    {(() => {
                      const status = getDateStatus(feedbackData?.round?.dateTime);
                      const statusConfig = {
                        future: { text: `Interview is scheduled ${timeLeft}`, color: 'text-blue-600 bg-blue-100' },
                        present: { text: 'Interview is starting soon', color: 'text-green-600 bg-green-100' },
                        past: { text: 'Interview time has passed', color: 'text-red-600 bg-red-100' }
                      };
                      const config = statusConfig[status] || { text: 'Interview status unknown', color: 'text-gray-600 bg-gray-100' };
                      
                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                          {config.text}
                        </span>
                      );
                    })()}
                  </div>
                )} */}
              </div>

              {/* Interview Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Interview Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Position</p>
                      <p className="text-base font-semibold text-gray-900">{feedbackData?.position?.title || "Not Available"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</p>
                      <p className="text-base font-semibold text-gray-900">{feedbackData?.position?.companyname || "Not Available"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {/* {localInterviewTime || 'Calculating...'} */}
                        <p className="text-base font-semibold text-gray-900">
                          {formatToLocalTime(feedbackData?.round?.dateTime, 'start-only')}
                          {/* {getTimeUntilInterview(feedbackData?.round?.dateTime)} */}
                        </p>
                      </div>
                      {/* {feedbackData?.interviewRound?.dateTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          {getTimeUntilInterview(feedbackData?.round?.dateTime)}
                        </p>
                      )} */}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                      <p className="text-base font-semibold text-gray-900">
                        {feedbackData?.round?.duration ? `${feedbackData?.round?.duration} Min` : "Not Available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Meeting Button */}
              {/* <button
                onClick={() => window.open(decodedData?.meetLink, '_blank')}
                className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg mb-4"
              >
                <Video className="w-6 h-6" />
                Join Meeting
              </button> */}

              {/* Join Meeting Button */}
              <button
                onClick={() => window.open(decodedData?.meetingId, '_blank')}
                disabled={!isButtonEnabled}
                className={`w-full ${isButtonEnabled
                    ? 'bg-[#217989] hover:bg-[#1a616e] hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                  } text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg mb-4`}
              >
                <Video className="w-6 h-6" />
                {isButtonEnabled ? 'Join Meeting' : 'Join Meeting (Available 15 mins before start)'}
              </button>

              <p className="text-sm text-gray-500">
                Make sure your camera and microphone are working properly
              </p>
            </div>

            {/* Pre-Interview Checklist */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Pre-Interview Checklist</h2>
                <p className="text-sm text-gray-600">Complete these steps before joining your interview</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Test Your Equipment</h4>
                    <p className="text-sm text-gray-600">Ensure your camera and microphone are working properly. Test your audio and video quality.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Prepare Your Environment</h4>
                    <p className="text-sm text-gray-600">Find a quiet, well-lit space with a professional background. Minimize distractions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Gather Your Materials</h4>
                    <p className="text-sm text-gray-600">Have your resume, portfolio, and any relevant documents ready to discuss or share.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Join Early</h4>
                    <p className="text-sm text-gray-600">Join the meeting 5 minutes before the scheduled time to resolve any technical issues.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className="w-8 h-8 bg-[#217989] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">5</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Screen Sharing Ready</h4>
                    <p className="text-sm text-gray-600">Be prepared to share your screen if needed. Close unnecessary applications beforehand.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Technical Requirements */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Technical Requirements</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Stable internet connection (minimum 5 Mbps)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Chrome, Firefox, or Safari browser (latest version)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Enable camera and microphone permissions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Close unnecessary applications to free up bandwidth</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#217989] rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Have a backup device ready (phone/tablet)</p>
                </div>
              </div>
            </div>

            {/* Interview Etiquette */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Interview Etiquette</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Maintain professional appearance and posture</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Speak clearly and at a moderate pace</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Make eye contact by looking at the camera</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Ask questions if something is unclear</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">Be respectful and courteous throughout</p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Quick Tips</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Have a glass of water nearby</p>
                <p>• Keep your phone on silent</p>
                <p>• Prepare questions about the role</p>
                <p>• Practice your elevator pitch</p>
                <p>• Research the company beforehand</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 rounded-2xl shadow-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-4">🆘 Need Help?</h3>
              <div className="space-y-2 text-sm text-red-700">
                <p>Technical issues during the interview?</p>
                <p className="font-semibold">Call: +1 (555) 123-HELP</p>
                <p className="font-semibold">Email: support@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateView;