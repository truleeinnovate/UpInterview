import React from 'react';
import { Users, User, MessageSquare } from 'lucide-react';

const RoleSelector = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#217989] to-[#1a616e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#217989] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Interview Portal</h1>
          <p className="text-gray-600 mt-2">Select your role to continue</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Candidate Instructions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-[#217989]" />
              <h3 className="text-lg font-semibold text-gray-800">For Candidates</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <p>Ensure your camera and microphone are working properly</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <p>Find a quiet, well-lit space for the interview</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <p>Have your resume and portfolio ready to discuss</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                <p>Join the meeting 5 minutes before the scheduled time</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#217989] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                <p>Be prepared to share your screen if needed</p>
              </div>
            </div>
            <button
              onClick={() => onRoleSelect('candidate')}
              className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <User className="w-5 h-5" />
              Join as Candidate
            </button>
          </div>

          {/* Interviewer Instructions */}
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
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Users className="w-5 h-5" />
              Join as Interviewer
            </button>
          </div>
        </div>

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