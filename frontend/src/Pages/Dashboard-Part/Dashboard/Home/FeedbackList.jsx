import React from 'react';
import { MessageSquare, ChevronRight, ThumbsUp, ThumbsDown, User } from 'lucide-react';

const FeedbackList = () => {
  const feedbacks = [
    {
      id: 1,
      candidate: "Alex Martinez",
      position: "Senior Backend Developer",
      interviewer: "Dr. Sarah Johnson",
      date: "March 15, 2024",
      rating: "Excellent",
      status: "Hired",
      feedback: "Demonstrated strong system design knowledge and excellent problem-solving skills. Great cultural fit.",
      strengths: ["System Design", "Problem Solving", "Communication"],
      improvements: ["Could improve on frontend concepts"]
    },
    {
      id: 2,
      candidate: "Rachel Kim",
      position: "Product Designer",
      interviewer: "Michael Chang",
      date: "March 14, 2024",
      rating: "Good",
      status: "Under Review",
      feedback: "Strong portfolio and design thinking. Needs more experience with enterprise projects.",
      strengths: ["UI Design", "User Research"],
      improvements: ["Enterprise Experience", "Design Systems"]
    },
    {
      id: 3,
      candidate: "David Wilson",
      position: "DevOps Engineer",
      interviewer: "Emily Roberts",
      date: "March 13, 2024",
      rating: "Average",
      status: "Rejected",
      feedback: "Limited experience with cloud infrastructure and CI/CD pipelines.",
      strengths: ["Basic DevOps", "Team Collaboration"],
      improvements: ["Cloud Infrastructure", "CI/CD Experience"]
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-sm border border-gray-200 col-span-2 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Recent Feedback</h3>
          <p className="text-gray-500 text-sm mt-1">Latest interview feedback and evaluations</p>
        </div>
        <button className="flex items-center space-x-2 text-sm text-custom-blue hover:text-custom-blue/80 font-medium bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105">
          <span>View All Feedback</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-6">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="border border-gray-100 rounded-xl p-6 hover:border-indigo-100 hover:bg-indigo-50/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{feedback.candidate}</h4>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    feedback.status === 'Hired' ? 'bg-green-100 text-green-600' :
                    feedback.status === 'Under Review' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{feedback.position}</p>
              </div>
              <span className={`text-sm font-medium ${
                feedback.rating === 'Excellent' ? 'text-green-600' :
                feedback.rating === 'Good' ? 'text-custom-blue' :
                'text-orange-600'
              }`}>
                {feedback.rating}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MessageSquare size={18} className="text-gray-400 mt-1" />
                <p className="text-sm text-gray-700">{feedback.feedback}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <ThumbsUp size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Strengths</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feedback.strengths.map((strength, index) => (
                      <span key={index} className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-lg">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <ThumbsDown size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Areas for Improvement</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feedback.improvements.map((improvement, index) => (
                      <span key={index} className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg">
                        {improvement}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User size={16} />
                  <span>Interviewed by {feedback.interviewer}</span>
                </div>
                <span className="text-sm text-gray-500">{feedback.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;