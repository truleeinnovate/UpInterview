import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, Clock, Users, Video, X } from 'lucide-react';
import CreateInterviewModal from './CreateInterviewModal';
import InterviewRoom from './InterviewRoom';

function JoinAsModal({ interview, onClose, onJoin }) {
  const [participantName, setParticipantName] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!participantName.trim()) {
      setError('Please enter your name');
      return;
    }
    onJoin({ name: participantName, role });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Join as Participant</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-4">
            Interview: <span className="font-semibold">{interview.title}</span>
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={participantName}
            onChange={(e) => {
              setParticipantName(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition mb-4"
            style={{ focusRingColor: 'rgb(33, 121, 137)' }}
            autoFocus
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Join As
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('interviewer')}
              className={`p-4 rounded-lg border-2 transition ${
                role === 'interviewer'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <Users className={`w-6 h-6 mb-2 ${role === 'interviewer' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`font-semibold ${role === 'interviewer' ? 'text-blue-900' : 'text-gray-700'}`}>
                  Interviewer
                </span>
                <span className="text-xs text-gray-500 mt-1">No monitoring</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`p-4 rounded-lg border-2 transition ${
                role === 'candidate'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <Video className={`w-6 h-6 mb-2 ${role === 'candidate' ? 'text-green-600' : 'text-gray-600'}`} />
                <span className={`font-semibold ${role === 'candidate' ? 'text-green-900' : 'text-gray-700'}`}>
                  Candidate
                </span>
                <span className="text-xs text-gray-500 mt-1">With proctoring</span>
              </div>
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 py-2 px-4 rounded-lg text-white font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: 'rgb(33, 121, 137)' }}
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [joinAsModal, setJoinAsModal] = useState(null);
  const [participantName, setParticipantName] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*, interview_participants(count)')
        .order('scheduled_time', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedInterview && participantName) {
    return (
      <InterviewRoom
        interview={selectedInterview}
        participantName={participantName}
        onLeave={() => {
          setSelectedInterview(null);
          setParticipantName(null);
          loadInterviews();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b bg-white shadow-sm" style={{ borderColor: 'rgb(33, 121, 137, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(33, 121, 137)' }}>
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Interview Platform</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Test Mode</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Interviews</h2>
            <p className="text-gray-600 mt-1">Manage and schedule your interviews</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-semibold transition duration-200 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: 'rgb(33, 121, 137)' }}
          >
            <Plus className="w-5 h-5" />
            <span>Schedule Interview</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(33, 121, 137)' }}></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No interviews scheduled</h3>
            <p className="text-gray-500 mb-6">Get started by scheduling your first interview</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-lg text-white font-semibold transition duration-200 hover:opacity-90"
              style={{ backgroundColor: 'rgb(33, 121, 137)' }}
            >
              Schedule Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 p-6 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {interview.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>

                {interview.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {interview.description}
                  </p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
                    <span>{formatDate(interview.scheduled_time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
                    <span>{interview.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
                    <span>{interview.interview_participants?.[0]?.count || 0} participants</span>
                  </div>
                </div>

                <button
                  onClick={() => setJoinAsModal(interview)}
                  className="w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                >
                  Join Interview
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateInterviewModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadInterviews();
          }}
        />
      )}

      {joinAsModal && (
        <JoinAsModal
          interview={joinAsModal}
          onClose={() => setJoinAsModal(null)}
          onJoin={(participantData) => {
            setParticipantName(participantData);
            setSelectedInterview(joinAsModal);
            setJoinAsModal(null);
          }}
        />
      )}
    </div>
  );
}
