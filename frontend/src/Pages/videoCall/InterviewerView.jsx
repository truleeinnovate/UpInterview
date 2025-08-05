import React, { useState } from 'react';
import { Users, Video, LogOut, User, MessageSquare, FileText } from 'lucide-react';
import { mockData } from '../mockData';
import CandidateDetails from './CandidateDetails';
import InterviewQuestions from './InterviewQuestions';
import FeedbackForm from './FeedbackForm';
import FeedbackManagement from './FeedbackManagement';

const InterviewerView = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('candidate');
  const [selectedCandidate] = useState(mockData.candidates[0]);

  const tabs = [
    { id: 'candidate', label: 'Candidate Details', icon: User },
    { id: 'questions', label: 'Interview Questions', icon: MessageSquare },
    { id: 'feedback', label: 'Feedback Form', icon: FileText },
    { id: 'management', label: 'Feedback Management', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#217989] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Interview Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open(mockData.interviews[0].meetingUrl, '_blank')}
                className="bg-[#217989] hover:bg-[#1a616e] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Start Meeting
              </button>
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-16 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#217989] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'candidate' && <CandidateDetails candidate={selectedCandidate} />}
            {activeTab === 'questions' && <InterviewQuestions />}
            {activeTab === 'feedback' && <FeedbackForm />}
            {activeTab === 'management' && <FeedbackManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerView;