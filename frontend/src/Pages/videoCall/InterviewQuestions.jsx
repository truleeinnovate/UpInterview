import React from 'react';
import { mockData } from './mockData';

const InterviewQuestions = () => {
  return (
    <div className="space-y-4">
      {mockData.questions.map((question) => (
        <div key={question.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-3">
            <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
              {question.category}
            </span>
            <span className="text-sm text-gray-500">{question.difficulty}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">{question.question}</h3>
          {question.expectedAnswer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Expected Answer:</p>
              <p className="text-sm text-gray-700">{question.expectedAnswer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InterviewQuestions;