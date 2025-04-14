import React, { useState } from 'react';
import InterviewRounds from './InterviewRounds';
import Timeline from './Timeline';
import Documents from './Documents';
import { FaTimes } from 'react-icons/fa';
import classNames from 'classnames';

const tabs = [
  { id: 'interviews', name: 'Interviews', icon: '📅' },
  { id: 'timeline', name: 'Timeline', icon: '⏱️' },
  { id: 'documents', name: 'Documents', icon: '📄' }
];

const ProfileContent = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState('interviews');
  const [selectedInterview, setSelectedInterview] = useState(null);

  if (!candidate) return null;

  return (
    <main className="flex-1 min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab._id)}
                className={classNames(
                  'px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-600 hover:bg-gray-100 bg-white shadow-sm'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {activeTab === 'interviews' && (
            <InterviewRounds 
              interviews={candidate.interviews || []} 
              onViewDetails={setSelectedInterview}
              onEdit={() => {}}
            />
          )}

          {activeTab === 'timeline' && (
            <Timeline 
              events={candidate.timeline || []}
              onViewInterview={setSelectedInterview}
            />
          )}

          {activeTab === 'documents' && (
            <Documents documents={candidate.documents || []} />
          )}
        </div>
      </div>
    </main>
  );
};

export default ProfileContent;