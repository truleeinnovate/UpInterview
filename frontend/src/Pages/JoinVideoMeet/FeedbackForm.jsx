import React, { useState } from 'react';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Interview Feedback</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`w-10 h-10 rounded-full transition-colors ${
                  star <= rating 
                    ? 'bg-[#217989] text-white' 
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">{rating}/5</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`w-10 h-10 rounded-full transition-colors ${
                  star <= 3 
                    ? 'bg-[#217989] text-white' 
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">3/5</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Ratings *
          </label>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Technical Knowledge</span>
                <button className="text-[#217989] hover:text-[#1a616e] text-sm font-medium">
                  Remove
                </button>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`w-8 h-8 rounded-full transition-colors ${
                      star <= 3 
                        ? 'bg-[#217989] text-white text-sm' 
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300 text-sm'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">3/5</p>
            </div>
            <button className="text-[#217989] hover:text-[#1a616e] font-medium text-sm flex items-center gap-1">
              + Add Skill
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#217989] focus:border-transparent resize-none"
            placeholder="Additional comments about the candidate..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Questions Asked *
          </label>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Question asked during interview</span>
                <button className="text-[#217989] hover:text-[#1a616e] text-sm font-medium">
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#217989] focus:border-transparent resize-none text-sm"
                placeholder="Enter the question that was asked..."
              />
            </div>
            <button className="text-[#217989] hover:text-[#1a616e] font-medium text-sm flex items-center gap-1">
              + Add Question
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Comments *
          </label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#217989] focus:border-transparent resize-none"
            placeholder="Provide overall feedback about the candidate's performance..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommendation *
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#217989] focus:border-transparent">
            <option value="hire">Hire</option>
            <option value="maybe" defaultValue>Maybe</option>
            <option value="no-hire">No Hire</option>
          </select>
        </div>

        <button className="w-full bg-[#217989] hover:bg-[#1a616e] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;