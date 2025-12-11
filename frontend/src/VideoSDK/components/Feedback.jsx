import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Star, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';

function FeedbackModal({ interview, onClose, onSave }) {
  const [formData, setFormData] = useState({
    technical_score: 5,
    communication_score: 5,
    problem_solving_score: 5,
    overall_rating: 5,
    strengths: '',
    weaknesses: '',
    recommendation: 'Hire',
    detailed_notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: interviewer } = await supabase
      .from('interviewers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!interviewer) {
      alert('You need to set up an interviewer profile first');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('feedback')
      .insert([{
        interview_id: interview.id,
        interviewer_id: interviewer.id,
        candidate_id: null,
        ...formData,
      }]);

    setLoading(false);
    if (!error) {
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Submit Interview Feedback</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-1">{interview.title}</h3>
            <p className="text-sm text-gray-600">{interview.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Skills ({formData.technical_score}/10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.technical_score}
                  onChange={(e) => setFormData({ ...formData, technical_score: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication ({formData.communication_score}/10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.communication_score}
                  onChange={(e) => setFormData({ ...formData, communication_score: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Solving ({formData.problem_solving_score}/10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.problem_solving_score}
                  onChange={(e) => setFormData({ ...formData, problem_solving_score: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating ({formData.overall_rating}/10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.overall_rating}
                  onChange={(e) => setFormData({ ...formData, overall_rating: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strengths
            </label>
            <textarea
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              rows={3}
              placeholder="What did the candidate do well?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Areas for Improvement
            </label>
            <textarea
              value={formData.weaknesses}
              onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              rows={3}
              placeholder="What could the candidate improve?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <select
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            >
              <option value="Strong Hire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="Maybe">Maybe</option>
              <option value="No Hire">No Hire</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Notes
            </label>
            <textarea
              value={formData.detailed_notes}
              onChange={(e) => setFormData({ ...formData, detailed_notes: e.target.value })}
              rows={6}
              placeholder="Additional observations and notes about the interview..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: 'rgb(33, 121, 137)' }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
    fetchInterviews();
  }, []);

  const fetchFeedbacks = async () => {
    const { data } = await supabase
      .from('feedback')
      .select(`
        *,
        interviews (title, description),
        interviewers (full_name)
      `)
      .order('created_at', { ascending: false });

    if (data) setFeedbacks(data);
  };

  const fetchInterviews = async () => {
    const { data } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setInterviews(data);
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Strong Hire': return 'bg-green-100 text-green-800';
      case 'Hire': return 'bg-green-50 text-green-700';
      case 'Maybe': return 'bg-yellow-100 text-yellow-800';
      case 'No Hire': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Interview Feedback</h1>
          <p className="text-gray-600 mt-1">Review and submit interview evaluations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition font-medium"
          style={{ backgroundColor: 'rgb(33, 121, 137)' }}
        >
          <Plus className="w-5 h-5" />
          Submit Feedback
        </button>
      </div>

      <div className="grid gap-6">
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No feedback submitted yet</h3>
            <p className="text-gray-600">Start by submitting feedback for a completed interview</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {feedback.interviews?.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feedback.interviews?.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Interviewer: {feedback.interviewers?.full_name || 'Unknown'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(feedback.recommendation)}`}>
                  {feedback.recommendation}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">Technical</p>
                  <p className="text-2xl font-bold text-blue-700">{feedback.technical_score}/10</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium mb-1">Communication</p>
                  <p className="text-2xl font-bold text-purple-700">{feedback.communication_score}/10</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium mb-1">Problem Solving</p>
                  <p className="text-2xl font-bold text-orange-700">{feedback.problem_solving_score}/10</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(33, 121, 137, 0.1)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgb(33, 121, 137)' }}>Overall</p>
                  <p className="text-2xl font-bold" style={{ color: 'rgb(33, 121, 137)' }}>{feedback.overall_rating}/10</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-green-800">Strengths</h4>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.strengths}</p>
                </div>
                <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">Areas for Improvement</h4>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.weaknesses}</p>
                </div>
              </div>

              {feedback.detailed_notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Detailed Notes</h4>
                  <p className="text-sm text-gray-700">{feedback.detailed_notes}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                Submitted on {new Date(feedback.created_at).toLocaleDateString()} at {new Date(feedback.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Interview</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
              {interviews.map((interview) => (
                <button
                  key={interview.id}
                  onClick={() => {
                    setSelectedInterview(interview);
                    setShowModal(false);
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <h3 className="font-semibold text-gray-800">{interview.title}</h3>
                  <p className="text-sm text-gray-600">{interview.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedInterview && (
        <FeedbackModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onSave={() => {
            setSelectedInterview(null);
            fetchFeedbacks();
          }}
        />
      )}
    </div>
  );
}

export default Feedback;
