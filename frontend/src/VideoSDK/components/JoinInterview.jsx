import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Video, Users, ArrowLeft } from 'lucide-react';
import InterviewRoom from './InterviewRoom';

export default function JoinInterview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantName, setParticipantName] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(true);

  const interviewId = searchParams.get('interview');

  const loadInterview = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

      if (error) throw error;
      if (!data) {
        setError('Interview not found');
        return;
      }

      setInterview(data);
    } catch (error) {
      console.error('Error loading interview:', error);
      setError('Failed to load interview');
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    if (!interviewId) {
      setError('Invalid interview link');
      setLoading(false);
      return;
    }

    loadInterview();
  }, [interviewId, loadInterview]);

  const handleJoin = (participantData) => {
    setParticipantName(participantData);
    setShowJoinModal(false);
  };

  const handleLeave = () => {
    navigate('/video-sdk');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'rgb(33, 121, 137)' }}></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Interview Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/video-sdk')}
            className="px-6 py-3 rounded-lg text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'rgb(33, 121, 137)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (participantName) {
    return (
      <InterviewRoom
        interview={interview}
        participantName={participantName}
        onLeave={handleLeave}
      />
    );
  }

  function JoinAsModal({ interview, onClose, onJoin }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('candidate');
    const [error, setError] = useState('');

    const handleJoin = () => {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      onJoin({ name, role });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Join Interview</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
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
              value={name}
              onChange={(e) => {
                setName(e.target.value);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="border-b bg-white shadow-sm" style={{ borderColor: 'rgb(33, 121, 137, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                alt="UpInterview Logo"
                className="w-24"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You're Invited!</h2>
            <p className="text-gray-600 mb-6">
              You've been invited to join: <span className="font-semibold">{interview.title}</span>
            </p>
            <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">Scheduled:</span>
                <span>{new Date(interview.scheduled_time).toLocaleString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium mr-2">Duration:</span>
                <span>{interview.duration_minutes} minutes</span>
              </div>
              {interview.description && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span>
                  <p className="mt-1">{interview.description}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-8 py-3 rounded-lg text-white font-semibold transition duration-200 hover:opacity-90 shadow-lg"
              style={{ backgroundColor: 'rgb(33, 121, 137)' }}
            >
              Join Interview Now
            </button>
          </div>
        </div>
      </div>

      {showJoinModal && (
        <JoinAsModal
          interview={interview}
          onClose={() => navigate('/video-sdk')}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
}
