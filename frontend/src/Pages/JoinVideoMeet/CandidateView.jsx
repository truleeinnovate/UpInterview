import React from 'react';
import { Video, LogOut } from 'lucide-react';
import { mockData } from './mockData';

const CandidateView = ({ onBack }) => {
  const candidate = mockData.candidates[0];
  const interview = mockData.interviews[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#217989] to-[#1a616e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
        
        <div className="mb-8">
          <div className="w-20 h-20 bg-[#217989] rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {candidate.name}!</h1>
          <p className="text-gray-600">Ready to join your interview?</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Interview Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Position:</span> {interview.position}</p>
            <p><span className="font-medium">Company:</span> {interview.company}</p>
            <p><span className="font-medium">Time:</span> {interview.scheduledTime}</p>
            <p><span className="font-medium">Duration:</span> {interview.duration}</p>
          </div>
        </div>

        <button
          onClick={() => window.open(interview.meetingUrl, '_blank')}
          className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
        >
          <Video className="w-6 h-6" />
          Join Meeting
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Make sure your camera and microphone are working properly
        </p>
      </div>
    </div>
  );
};

export default CandidateView;