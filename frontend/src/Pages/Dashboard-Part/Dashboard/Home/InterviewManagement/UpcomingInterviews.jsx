import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, CheckCircle, XCircle, Calendar, User, Briefcase, Hash } from 'lucide-react';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { parse, isValid, isAfter, isToday, startOfDay } from 'date-fns';

const InterviewerSchedule = () => {
  const navigate = useNavigate();
  const { interviewRounds } = useCustomContext();
  const [upcomingRounds, setUpcomingRounds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (interviewRounds && interviewRounds.length > 0) {
      const now = new Date();
      const today = startOfDay(now);

      const filtered = interviewRounds.filter(round => {
        if (!round.dateTime) return false;
        const startTime = round.dateTime.split(' - ')[0];
        const parsedStart = parse(startTime, 'dd-MM-yyyy hh:mm a', new Date());
        return isValid(parsedStart) && (isAfter(parsedStart, today) || isToday(parsedStart));
      });

      filtered.sort((a, b) => {
        const aStart = parse(a.dateTime.split(' - ')[0], 'dd-MM-yyyy hh:mm a', new Date());
        const bStart = parse(b.dateTime.split(' - ')[0], 'dd-MM-yyyy hh:mm a', new Date());
        return aStart - bStart;
      });

      setUpcomingRounds(filtered.slice(0, 3));
      setCurrentIndex(0);
    }
  }, [interviewRounds]);

  useEffect(() => {
    if (upcomingRounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % upcomingRounds.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [upcomingRounds.length]);

  const displayDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "No date available";
    try {
      const [startTime, endTime] = dateTimeStr.split(' - ');
      const parsedStart = parse(startTime, 'dd-MM-yyyy hh:mm a', new Date());
      if (!isValid(parsedStart)) return "Invalid date";

      const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

      return (
        <div className="flex flex-col">
          <span>{parsedStart.toLocaleString('en-US', dateOptions)}</span>
          <span className="text-sm text-gray-600">
            {parsedStart.toLocaleString('en-US', timeOptions)}
            {endTime && ` - ${endTime}`}
          </span>
        </div>
      );
    } catch {
      return "Invalid date";
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Scheduled':
      case 'Completed':
        return { bg: 'bg-green-100', text: 'text-green-600', icon: <CheckCircle size={16} /> };
      case 'Pending':
      case 'Reschedule':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: <Clock size={16} /> };
      default:
        return { bg: 'bg-red-100', text: 'text-red-600', icon: <XCircle size={16} /> };
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

      <div className="relative h-[220px] overflow-hidden">
        {upcomingRounds.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No upcoming interview rounds found.</p>
          </div>
        ) : (
          upcomingRounds.map((round, index) => {
            const statusToShow = round.status || 'Pending';
            const statusDetails = getStatusDetails(statusToShow);
            const interviewCode = round.interviewId?.interviewCode || 'no interview';
            const candidateName = round.interviewId?.candidateId?.FirstName
              ? `${round.interviewId.candidateId.FirstName} ${round.interviewId.candidateId.LastName || ''}`
              : 'Unknown Candidate';
            const positionTitle = round.interviewId?.positionId?.title || 'Unknown Position';
            const companyName = round.interviewId?.positionId?.companyname || '';

            return (
              <div
                key={round._id}
                className={`absolute top-0 left-0 w-full p-5 border border-gray-100 rounded-xl bg-white hover:border-purple-100 hover:shadow-md transition-all duration-500
                  ${index === currentIndex
                    ? 'opacity-100 translate-x-0'
                    : index < currentIndex
                      ? '-translate-x-full opacity-0'
                      : 'translate-x-full opacity-0'
                  }`}
              >
                <div className='space-y-4'>
                  <div className='flex items-center'>
                    {/* date and time */}
                    <div className="flex items-center gap-2 w-56">
                      <Calendar size={18} className="text-gray-400" />
                      <p className="font-medium text-gray-800">
                        {displayDateTime(round.dateTime)}
                      </p>
                    </div>
                    {/* interview code */}
                    <div className="flex items-center gap-2">
                      <Hash size={18} className="text-gray-400" />
                      <span className="font-medium text-custom-blue">{interviewCode}</span>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    {/* candidate name and email */}
                    <div className="flex items-center gap-2 w-56">
                      <User size={18} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{candidateName}</p>
                        <p className="text-sm text-gray-600">{round.interviewId?.candidateId?.Email || 'no email provided'}</p>
                      </div>
                    </div>
                    {/* position title, company name */}
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{positionTitle}</p>
                        {companyName && <p className="text-sm text-gray-600">{companyName}</p>}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    {/* roundTitle, interviewMode */}
                    <div className="flex flex-wrap gap-2 w-56">
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.roundTitle}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        {round.interviewMode}
                      </span>
                    </div>
                    {/* status */}
                    <div className="flex items-center gap-2">
                      {statusDetails.icon}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusDetails.bg} ${statusDetails.text}`}>
                        {statusToShow}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation dots */}
      {upcomingRounds.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {upcomingRounds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-custom-blue w-4' : 'bg-gray-300'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewerSchedule;