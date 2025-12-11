import { useState, useEffect, useRef } from 'react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { supabase } from '../lib/supabase';
import VideoSDKSetup from './VideoSDKSetup';
import { getProctoringService } from '../lib/proctoring';
import { AlertCircle } from 'lucide-react';
import { getTranscriptionService } from '../lib/transcription';
import { ProctoringAlerts, ProctoringPanel } from './ProctoringAlerts';
import { TranscriptViewer } from './TranscriptViewer';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  ScreenShare,
  ScreenShareOff,
  FileText,
  UserCircle,
  ClipboardList,
  Circle,
  StickyNote,
  Briefcase,
  Shield,
} from 'lucide-react';
import { config } from '../../config';

function ParticipantView({ participantId, isScreenShare = false, onVideoReady }) {
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName, screenShareStream, screenShareOn } = useParticipant(participantId);
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const screenTrackRef = useRef(null);
  const webcamTrackRef = useRef(null);

  // Debug: Log participant info
  useEffect(() => {
    console.log('ParticipantView rendered:', {
      participantId,
      isLocal,
      displayName,
      hasWebcamStream: !!webcamStream,
      hasMicStream: !!micStream,
      webcamOn,
      micOn,
      hasOnVideoReady: !!onVideoReady
    });
  }, [participantId, isLocal, displayName, webcamStream, micStream, webcamOn, micOn, onVideoReady]);

  useEffect(() => {
    if (isScreenShare && screenShareStream && screenRef.current) {
      const track = screenShareStream.track;
      if (track && track !== screenTrackRef.current) {
        screenTrackRef.current = track;
        const mediaStream = new MediaStream([track]);
        screenRef.current.srcObject = mediaStream;
      }
    } else if (isScreenShare && screenRef.current && screenTrackRef.current) {
      screenRef.current.srcObject = null;
      screenTrackRef.current = null;
    }
  }, [screenShareStream, isScreenShare]);

  useEffect(() => {
    if (!isScreenShare && webcamStream && videoRef.current) {
      const videoTrack = webcamStream.track;
      if (videoTrack && videoTrack !== webcamTrackRef.current) {
        webcamTrackRef.current = videoTrack;
        
        // Create media stream with both video and audio tracks
        const tracks = [videoTrack];
        if (micStream && micStream.track) {
          tracks.push(micStream.track);
          console.log('Audio track added to stream for:', displayName);
        } else {
          console.log('No audio track available for:', displayName);
        }
        
        const mediaStream = new MediaStream(tracks);
        console.log('MediaStream created with', tracks.length, 'tracks for:', displayName);
        videoRef.current.srcObject = mediaStream;

        // Notify parent when video is ready (for proctoring)
        if (isLocal && onVideoReady) {
          console.log('Setting up video ready callback for local participant');

          // Check if video is already loaded
          if (videoRef.current.readyState >= 2) {
            console.log('Video already loaded, calling onVideoReady immediately');
            onVideoReady(videoRef.current);
          } else {
            // Wait for video to load
            console.log('Waiting for video to load...');
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded, calling onVideoReady');
              onVideoReady(videoRef.current);
            };
          }
        }
      }
    } else if (!isScreenShare && videoRef.current && webcamTrackRef.current) {
      videoRef.current.srcObject = null;
      webcamTrackRef.current = null;
    }
  }, [webcamStream, micStream, isScreenShare, isLocal, onVideoReady]);

  const hasScreenShare = screenShareOn;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden group w-full h-full">
      {isScreenShare ? (
        screenShareStream ? (
          <video
            ref={screenRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-white text-sm">Screen share ended</span>
          </div>
        )
      ) : webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white" style={{ backgroundColor: 'rgb(33, 121, 137)' }}>
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {hasScreenShare && !isScreenShare && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
          <ScreenShare className="w-4 h-4" />
          <span>Screen Sharing</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 bg-black bg-opacity-70 px-3 py-2 rounded-lg max-w-xs">
          <span className="text-white text-sm font-medium truncate">{displayName || 'Participant'}</span>
          {!micOn && <MicOff className="w-4 h-4 text-red-400 flex-shrink-0" />}
          {!isLocal && micOn && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Audio Active" />
          )}
        </div>
        {isLocal && (
          <span className="bg-black bg-opacity-70 px-3 py-2 rounded-lg text-white text-xs">
            You
          </span>
        )}
      </div>
    </div>
  );
}

function MeetingControls() {
  const { leave, toggleMic, toggleWebcam, toggleScreenShare, localMicOn, localWebcamOn, localScreenShareOn } = useMeeting();
  const [showParticipants, setShowParticipants] = useState(false);
  const { participants } = useMeeting();

  return (
    <div className="bg-white border-t shadow-lg px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            <Users className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              {participants ? new Map(participants).size : 0}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleMic()}
            className={`p-3 rounded-full transition ${
              localMicOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {localMicOn ? (
              <Mic className="w-5 h-5 text-gray-700" />
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={() => toggleWebcam()}
            className={`p-3 rounded-full transition ${
              localWebcamOn ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {localWebcamOn ? (
              <Video className="w-5 h-5 text-gray-700" />
            ) : (
              <VideoOff className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            onClick={() => toggleScreenShare()}
            className={`p-3 rounded-full transition ${
              localScreenShareOn
                ? 'text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            style={localScreenShareOn ? { backgroundColor: 'rgb(33, 121, 137)' } : {}}
          >
            {localScreenShareOn ? (
              <ScreenShareOff className="w-5 h-5" />
            ) : (
              <ScreenShare className="w-5 h-5 text-gray-700" />
            )}
          </button>

          <button
            onClick={leave}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="w-24"></div>
      </div>
    </div>
  );
}

function CandidateProfile({ interview }) {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            JD
          </div>
          <div>
            <h3 className="font-semibold text-lg">John Doe</h3>
            <p className="text-sm text-gray-600">Senior Software Engineer</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">john.doe@example.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">+1 234 567 8900</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Experience:</span>
            <span className="font-medium">5 years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">San Francisco, CA</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Resume</h4>
        <a href="#" className="text-blue-600 hover:underline text-sm">View Resume (PDF)</a>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Identity Verification</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span>ID Document Verified</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span>Face Match Confirmed</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function QuestionBank({ interview }) {
  const questions = [
    { id: 1, category: 'Technical', text: 'Explain the difference between REST and GraphQL', difficulty: 'Medium' },
    { id: 2, category: 'Technical', text: 'How do you optimize React performance?', difficulty: 'Hard' },
    { id: 3, category: 'Behavioral', text: 'Describe a challenging project you worked on', difficulty: 'Easy' },
    { id: 4, category: 'Problem Solving', text: 'Design a URL shortener system', difficulty: 'Hard' },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {questions.map((q) => (
        <div key={q.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">{q.category}</span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
              q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{q.difficulty}</span>
          </div>
          <p className="text-sm text-gray-800">{q.text}</p>
        </div>
      ))}
    </div>
  );
}

function FeedbackForm({ interview }) {
  const [feedback, setFeedback] = useState({
    technical: '',
    communication: '',
    problemSolving: '',
    overall: '',
    recommendation: 'pending'
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Technical Skills</label>
        <textarea
          value={feedback.technical}
          onChange={(e) => setFeedback({...feedback, technical: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Evaluate candidate's technical knowledge..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Communication Skills</label>
        <textarea
          value={feedback.communication}
          onChange={(e) => setFeedback({...feedback, communication: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Assess communication and clarity..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Problem Solving</label>
        <textarea
          value={feedback.problemSolving}
          onChange={(e) => setFeedback({...feedback, problemSolving: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Evaluate problem-solving approach..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Overall Feedback</label>
        <textarea
          value={feedback.overall}
          onChange={(e) => setFeedback({...feedback, overall: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Provide overall assessment..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Recommendation</label>
        <select
          value={feedback.recommendation}
          onChange={(e) => setFeedback({...feedback, recommendation: e.target.value})}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="strong_yes">Strong Yes</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="strong_no">Strong No</option>
        </select>
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Save Feedback
      </button>
    </div>
  );
}

function NotesPanel({ interview }) {
  const [notes, setNotes] = useState('');

  return (
    <div className="p-4 h-full flex flex-col">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Take notes during the interview..."
      />
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
        Save Notes
      </button>
    </div>
  );
}

function ChatPanel() {
  const { localParticipant } = useMeeting();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() && localParticipant) {
      const message = {
        id: Date.now(),
        senderId: localParticipant.id,
        senderName: localParticipant.displayName,
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isLocal: true
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Here you would also send the message through VideoSDK pub/sub
      // For now, we'll just add it locally
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.isLocal ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              msg.isLocal 
                ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg'
            } p-3 shadow-sm`}>
              <div className="flex flex-col">
                <span className={`text-xs font-medium mb-1 ${
                  msg.isLocal ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {msg.isLocal ? 'You' : msg.senderName}
                </span>
                <p className="text-sm break-words">{msg.text}</p>
                <span className={`text-xs mt-1 ${
                  msg.isLocal ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {msg.time}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantListItem({ participantId }) {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
        {displayName?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex-1">
        <div className="font-medium">{displayName || 'Unknown'}</div>
        <div className="text-xs text-gray-500">
          {isLocal ? 'You' : 'Remote'}
        </div>
      </div>
      <div className="flex gap-2">
        {micOn ? (
          <Mic className="w-4 h-4 text-green-600" />
        ) : (
          <MicOff className="w-4 h-4 text-red-600" />
        )}
        {webcamOn ? (
          <Video className="w-4 h-4 text-green-600" />
        ) : (
          <VideoOff className="w-4 h-4 text-red-600" />
        )}
      </div>
    </div>
  );
}

function PeoplePanel({ participants, interview }) {
  const participantList = participants ? Array.from(participants.keys()) : [];
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/video-sdk/join?interview=${interview.id}`;
    setInviteLink(link);
    setShowInviteModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {participantList.length} participant{participantList.length !== 1 ? 's' : ''} in the interview
        </div>
        <button
          onClick={generateInviteLink}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Invite
        </button>
      </div>
      
      {participantList.map((participantId) => (
        <ParticipantListItem key={participantId} participantId={participantId} />
      ))}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invite Participant</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with others to join the interview:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingView({ interview, onLeave, participantRole, participantName }) {
  const [presenterId, setPresenterId] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [showSidebar, setShowSidebar] = useState(false);
  const [proctoringIncidents, setProctoringIncidents] = useState([]);
  const [proctoringStats, setProctoringStats] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
  const videoElementRef = useRef(null);

  // Only enable proctoring for candidates
  const proctoringEnabled = participantRole === 'candidate';

  const { join, participants, localParticipant, presenterId: meetingPresenterId } = useMeeting({
    onMeetingJoined: () => {
      console.log('Meeting joined successfully');
    },
    onParticipantJoined: (participant) => {
      console.log('Participant joined:', participant.displayName, 'Total participants:', participants.size + 1);
    },
    onParticipantLeft: (participant) => {
      console.log('Participant left:', participant.displayName);
    },
    onMeetingLeft: async () => {
      if (proctoringEnabled) {
        await cleanupProctoring();
      }
      onLeave();
    },
    onPresenterChanged: (newPresenterId) => {
      const presenter = newPresenterId ? participants.get(newPresenterId) : null;
      console.log('Presenter changed:', {
        presenterId: newPresenterId,
        presenterName: presenter?.displayName,
        isLocal: presenter?.isLocal
      });
      setPresenterId(newPresenterId);
    },
  });

  // Initialize proctoring with video element
  const handleVideoReady = async (videoElement) => {
    console.log('handleVideoReady called:', {
      proctoringEnabled,
      participantRole,
      hasVideoElement: !!videoElement,
      alreadyInitialized: !!videoElementRef.current,
      participantCount: participants.size
    });

    if (!proctoringEnabled) {
      console.log('Proctoring not enabled for this participant');
      return;
    }

    // Check if we have at least 2 participants (interviewer + candidate)
    // Since proctoring is only enabled for candidates, if we're here and have 2+ participants,
    // that means at least one other person (interviewer) has joined
    if (participants.size < 2) {
      console.log('Waiting for interviewer to join before starting proctoring. Current participants:', participants.size);
      return;
    }

    console.log('Both participants present, proceeding with proctoring initialization');

    if (videoElementRef.current) {
      console.log('Proctoring already initialized');
      return;
    }

    try {
      console.log('Initializing proctoring with video element:', videoElement);
      videoElementRef.current = videoElement;

      const proctoringService = getProctoringService();
      await proctoringService.initialize(videoElement);

      // Create proctoring session first
      const newSessionId = await initializeProctoring();
      if (newSessionId) {
        proctoringService.currentSessionId = newSessionId;
        console.log('Session created and assigned to proctoring service:', newSessionId);
      }

      // Subscribe to incidents
      proctoringService.subscribe((incident) => {
        console.log('Proctoring incident detected:', incident);
        setProctoringIncidents(prev => [...prev, incident]);

        // Save to database with session ID from proctoring service
        const currentSessionId = proctoringService.currentSessionId;

        // Merge incident metadata with session_id
        const metadata = {
          session_id: currentSessionId,
          ...(incident.metadata || {})
        };

        supabase.from('proctoring_incidents').insert([{
          interview_id: interview.id,
          incident_type: incident.type,
          severity: incident.severity,
          message: incident.message,
          timestamp: incident.timestamp,
          metadata: metadata,
        }]).then(({ error }) => {
          if (error) console.error('Failed to save incident:', error);
          else console.log('Incident saved to database with session:', currentSessionId, 'metadata:', metadata);
        });
      });

      // Start monitoring immediately since we have 2+ participants
      proctoringService.startMonitoring();
      console.log('Proctoring initialized and monitoring started');
    } catch (error) {
      console.error('Failed to initialize proctoring:', error);
    }
  };

  // Initialize proctoring session
  const initializeProctoring = async () => {
    try {
      // First, end any active sessions for this interview
      const { data: activeSessions } = await supabase
        .from('proctoring_sessions')
        .select('id')
        .eq('interview_id', interview.id)
        .is('ended_at', null);

      if (activeSessions && activeSessions.length > 0) {
        console.log(`Ending ${activeSessions.length} active session(s) before creating new one`);
        await supabase
          .from('proctoring_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('interview_id', interview.id)
          .is('ended_at', null);
      }

      // Create new proctoring session in database
      const { data, error } = await supabase
        .from('proctoring_sessions')
        .insert([{
          interview_id: interview.id,
          started_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
      console.log('Proctoring session created:', data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to create proctoring session:', error);
      return null;
    }
  };

  // Cleanup proctoring
  const cleanupProctoring = async () => {
    try {
      const proctoringService = getProctoringService();
      const stats = proctoringService.getStatistics();
      proctoringService.stopMonitoring();

      // Update session end time
      if (sessionId) {
        await supabase
          .from('proctoring_sessions')
          .update({
            ended_at: new Date().toISOString(),
            tab_switches: stats.tabSwitches,
          })
          .eq('id', sessionId);
      }

      proctoringService.dispose();
    } catch (error) {
      console.error('Failed to cleanup proctoring:', error);
    }
  };

  useEffect(() => {
    join();
  }, []);

  useEffect(() => {
    if (meetingPresenterId) {
      setPresenterId(meetingPresenterId);
    } else {
      setPresenterId(null);
    }
  }, [meetingPresenterId]);

  // Monitor participant changes and attempt to start proctoring when both are present
  useEffect(() => {
    if (!proctoringEnabled) {
      return;
    }

    // If already initialized, skip
    if (videoElementRef.current) {
      const proctoringService = getProctoringService();
      if (proctoringService.isInitialized) {
        return;
      }
    }

    console.log('Participant change detected:', {
      participantCount: participants.size,
      role: participantRole,
      proctoringEnabled
    });

    if (participants.size >= 2) {
      console.log('Both participants present - checking if video is ready');

      // Find the local participant's video element
      const localVideo = document.querySelector('video[autoplay]');
      if (localVideo && localVideo.readyState >= 2) {
        console.log('Video element is ready, initializing proctoring now');
        handleVideoReady(localVideo);
      } else {
        console.log('Waiting for video element to be ready');
      }
    } else {
      console.log('Waiting for second participant to join');
    }
  }, [participants.size, proctoringEnabled, participantRole]);

  // Initialize and manage transcription
  useEffect(() => {
    if (!transcriptionEnabled) {
      return;
    }

    const transcriptionService = getTranscriptionService();

    if (!transcriptionService.isSupported()) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (participants.size >= 2 && !isTranscribing) {
      try {
        transcriptionService.initialize(
          interview.id,
          participantName,
          participantRole
        );

        const unsubscribe = transcriptionService.subscribe(async (transcriptData, isFinal) => {
          if (isFinal) {
            console.log('Final transcript:', transcriptData);

            const { data, error } = await supabase
              .from('interview_transcripts')
              .insert([transcriptData])
              .select()
              .single();

            if (error) {
              console.error('Failed to save transcript:', error);
            } else {
              setTranscripts(prev => [...prev, data]);
            }

            setInterimTranscript(null);
          } else {
            setInterimTranscript(transcriptData);
          }
        });

        transcriptionService.startRecording();
        setIsTranscribing(true);
        console.log('Transcription started for', participantName, participantRole);

        return () => {
          unsubscribe();
          transcriptionService.stopRecording();
          setIsTranscribing(false);
        };
      } catch (error) {
        console.error('Failed to initialize transcription:', error);
      }
    }
  }, [participants.size, interview.id, participantName, participantRole, transcriptionEnabled]);

  // Load existing transcripts when joining
  useEffect(() => {
    const loadTranscripts = async () => {
      const { data, error } = await supabase
        .from('interview_transcripts')
        .select('*')
        .eq('interview_id', interview.id)
        .order('spoken_at', { ascending: true });

      if (error) {
        console.error('Failed to load transcripts:', error);
      } else {
        setTranscripts(data || []);
      }
    };

    loadTranscripts();

    const channel = supabase
      .channel(`transcripts:${interview.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interview_transcripts',
          filter: `interview_id=eq.${interview.id}`,
        },
        (payload) => {
          console.log('New transcript received:', payload.new);
          setTranscripts(prev => {
            const exists = prev.some(t => t.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [interview.id]);

  // Update proctoring stats periodically (for candidates)
  useEffect(() => {
    if (proctoringEnabled) {
      const interval = setInterval(() => {
        const proctoringService = getProctoringService();
        setProctoringStats(proctoringService.getStatistics());
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [proctoringEnabled]);

  // For interviewers: Subscribe to real-time incidents from database
  useEffect(() => {
    if (participantRole === 'interviewer') {
      let currentSessionIdRef = null;
      let pollInterval = null;

      // Poll for active session and load incidents
      const loadCurrentSession = async () => {
        const { data: sessionData } = await supabase
          .from('proctoring_sessions')
          .select('id')
          .eq('interview_id', interview.id)
          .is('ended_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionData && sessionData.id !== currentSessionIdRef) {
          currentSessionIdRef = sessionData.id;
          setSessionId(currentSessionIdRef);
          console.log('Loading incidents for session:', currentSessionIdRef);

          // Load all incidents for this interview
          const { data } = await supabase
            .from('proctoring_incidents')
            .select('*')
            .eq('interview_id', interview.id)
            .order('timestamp', { ascending: true });

          if (data) {
            // Filter incidents that match current session ID
            const sessionIncidents = data.filter(incident => {
              const incidentSessionId = incident.metadata?.session_id;
              const matches = incidentSessionId === currentSessionIdRef;

              // Debug log each incident
              console.log('Incident session check:', {
                incidentId: incident.id,
                incidentSessionId,
                currentSessionId: currentSessionIdRef,
                matches,
                timestamp: incident.timestamp
              });

              return matches;
            });

            console.log(`Found ${sessionIncidents.length} incidents for current session (${currentSessionIdRef}) out of ${data.length} total`);
            setProctoringIncidents(sessionIncidents);
            // Update tab switch count from database
            const tabSwitches = sessionIncidents.filter(i => i.incident_type === 'TAB_SWITCH' || i.incident_type === 'WINDOW_BLUR').length;
            setProctoringStats(prev => ({ ...prev, tabSwitches }));

            // Stop polling once we have a session
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
        } else if (!sessionData) {
          console.log('No active proctoring session found yet');
        }
      };

      // Initial load
      loadCurrentSession();

      // Poll every 2 seconds for session creation
      pollInterval = setInterval(loadCurrentSession, 2000);

      // Subscribe to new incidents
      const channel = supabase
        .channel(`proctoring_${interview.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'proctoring_incidents',
            filter: `interview_id=eq.${interview.id}`
          },
          (payload) => {
            console.log('New incident received:', payload.new);

            // Only add if it matches current session
            const incidentSessionId = payload.new.metadata?.session_id;
            if (incidentSessionId && incidentSessionId === currentSessionIdRef) {
              console.log('Incident matches current session, adding to list');
              setProctoringIncidents(prev => [...prev, payload.new]);
              // Update tab switch count
              if (payload.new.incident_type === 'TAB_SWITCH' || payload.new.incident_type === 'WINDOW_BLUR') {
                setProctoringStats(prev => ({ ...prev, tabSwitches: (prev.tabSwitches || 0) + 1 }));
              }
            } else {
              console.log('Incident does not match current session, ignoring', {
                incidentSessionId,
                currentSessionId: currentSessionIdRef
              });
            }
          }
        )
        .subscribe();

      return () => {
        if (pollInterval) clearInterval(pollInterval);
        supabase.removeChannel(channel);
      };
    }
  }, [participantRole, interview.id]);

  const participantIds = participants ? [...participants.keys()] : [];

  // Filter out the presenter from grid when screen sharing is active
  const gridParticipantIds = presenterId 
    ? participantIds.filter(id => id !== presenterId)
    : participantIds;

  const getGridLayout = () => {
    const count = gridParticipantIds.length;
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3 || count === 4) return 'grid-cols-2';
    if (count === 5 || count === 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Only show proctoring tab to interviewers
  const baseTabs = [
    { id: 'candidate', label: 'Candidate Profile', icon: UserCircle },
    { id: 'questions', label: 'Question Bank', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: ClipboardList },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'people', label: 'People', icon: Users },
  ];

  const tabs = participantRole === 'interviewer'
    ? [
        baseTabs[0],
        baseTabs[1],
        { id: 'proctoring', label: 'Proctoring', icon: Shield },
        { id: 'transcript', label: 'Transcript', icon: MessageSquare },
        ...baseTabs.slice(2, 4),
        baseTabs[5]
      ]
    : baseTabs;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Only show proctoring alerts to interviewers */}
      {participantRole === 'interviewer' && <ProctoringAlerts incidents={proctoringIncidents} />}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(33, 121, 137)' }}>
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">UpInterview</h1>
              <p className="text-xs text-gray-500">{interview.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && showSidebar;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowSidebar(true);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition rounded-lg ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={isActive ? { backgroundColor: 'rgb(33, 121, 137)' } : {}}
                >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}

            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg ml-2">
              <Circle className="w-3 h-3 text-red-600 fill-red-600 animate-pulse" />
              <span className="text-sm font-medium text-red-600">Recording</span>
            </div>

            {/* Show proctoring status to both, but different messages */}
            {participantRole === 'interviewer' && proctoringEnabled && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg ml-2" style={{ backgroundColor: 'rgba(33, 121, 137, 0.1)' }}>
                <Shield className="w-4 h-4" style={{ color: 'rgb(33, 121, 137)' }} />
                <span className="text-sm font-medium" style={{ color: 'rgb(33, 121, 137)' }}>
                  Monitoring Candidates
                </span>
              </div>
            )}
            {participantRole === 'candidate' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg ml-2 bg-green-50">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Proctored Session
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex gap-4 p-4">
          {presenterId ? (
            <>
              <div className="flex-1 flex flex-col">
                <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <ScreenShare className="w-4 h-4 text-green-400" />
                  <span>Screen Share - {participants.get(presenterId)?.displayName || 'Presenter'}</span>
                </div>
                <div className="flex-1">
                  <ParticipantView participantId={presenterId} isScreenShare={true} />
                </div>
              </div>
              <div className="w-80 flex flex-col gap-3 overflow-y-auto">
                {gridParticipantIds.length > 0 && (
                  <div className="space-y-3">
                    {gridParticipantIds.map((participantId) => (
                      <div key={participantId} className="h-48">
                        <ParticipantView
                          participantId={participantId}
                          isScreenShare={false}
                          onVideoReady={handleVideoReady}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full">
              {participantIds.length === 1 ? (
                // Single participant - full screen video
                <div className="w-full h-full">
                  <ParticipantView
                    participantId={participantIds[0]}
                    isScreenShare={false}
                    onVideoReady={handleVideoReady}
                  />
                </div>
              ) : (
                // Multiple participants - grid layout
                <div className={`grid gap-4 h-full ${
                  participantIds.length === 2 ? 'grid-cols-2' :
                  participantIds.length <= 4 ? 'grid-cols-2' :
                  participantIds.length <= 6 ? 'grid-cols-3' :
                  'grid-cols-4'
                }`}>
                  {participantIds.map((participantId) => (
                    <ParticipantView
                      key={participantId}
                      participantId={participantId}
                      isScreenShare={false}
                      onVideoReady={handleVideoReady}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showSidebar && (
          <div className="w-96 bg-white border-l flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'candidate' && <CandidateProfile interview={interview} />}
              {activeTab === 'questions' && <QuestionBank interview={interview} />}
              {activeTab === 'proctoring' && (
                <ProctoringPanel
                  statistics={proctoringStats}
                  incidents={proctoringIncidents}
                  sessionId={sessionId}
                  participants={participants}
                  localParticipant={localParticipant}
                  interview={interview}
                />
              )}
              {activeTab === 'transcript' && (
                <TranscriptViewer
                  transcripts={transcripts}
                  interimTranscript={interimTranscript}
                  isTranscribing={isTranscribing}
                  onToggleTranscription={() => setTranscriptionEnabled(!transcriptionEnabled)}
                />
              )}
              {activeTab === 'feedback' && <FeedbackForm interview={interview} />}
              {activeTab === 'notes' && <NotesPanel interview={interview} />}
              {activeTab === 'chat' && <ChatPanel />}
              {activeTab === 'people' && <PeoplePanel participants={participants} interview={interview} />}
            </div>
          </div>
        )}
      </div>

      <MeetingControls />
    </div>
  );
}

export default function InterviewRoom({ interview, participantName, onLeave }) {
  const [meetingId, setMeetingId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract name and role from participantName (could be string or object)
  const participantData = typeof participantName === 'string'
    ? { name: participantName, role: 'candidate' }
    : participantName;

  useEffect(() => {
    initializeMeeting();
  }, []);

  const initializeMeeting = async () => {
    try {
      console.log('Initializing meeting for interview:', interview.id);
      
      // Always check database first for existing meeting_id
      const { data: interviewData, error: fetchError } = await supabase
        .from('interviews')
        .select('meeting_id')
        .eq('id', interview.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Database query error:', fetchError);
        throw fetchError;
      }
      
      let meetingId = interviewData?.meeting_id || interview.meeting_id;
      console.log('MeetingId from database/interview:', meetingId);

      // If no meetingId exists, create a new one atomically
      if (!meetingId) {
        console.log('No meetingId found, creating new meeting...');
        
        // Use a database transaction to ensure only one meeting is created
        const { createMeeting } = await import('../lib/videosdk.js');
        const newMeetingId = await createMeeting();
        console.log('Created new meetingId:', newMeetingId);
        
        // Try to update the interview with the new meetingId
        // If another participant already created one, this will fail or we'll get the existing one
        const { data: updatedData, error: updateError } = await supabase
          .from('interviews')
          .update({
            meeting_id: newMeetingId,
            status: 'in_progress'
          })
          .eq('id', interview.id)
          .is('meeting_id', null) // Only update if meeting_id is still null
          .select('meeting_id')
          .single();
        
        if (updateError) {
          console.log('Update failed, likely another participant created meeting. Fetching existing...');
          // Fetch the meeting_id that was set by another participant
          const { data: refetchData } = await supabase
            .from('interviews')
            .select('meeting_id')
            .eq('id', interview.id)
            .single();
          
          meetingId = refetchData?.meeting_id;
          console.log('Using meetingId created by another participant:', meetingId);
        } else {
          meetingId = updatedData.meeting_id;
          console.log('Successfully set new meetingId:', meetingId);
        }
      } else {
        console.log('Found existing meetingId:', meetingId);
      }

      console.log('Final meetingId to use:', meetingId);
      
      // Use frontend VideoSDK functions directly (no backend needed)
      const { createMeeting, validateMeeting, getAuthToken } = await import('../lib/videosdk.js');
      
      let finalMeetingId = meetingId;
      
      if (!meetingId) {
        // Create new meeting
        finalMeetingId = await createMeeting();
        console.log('Created new meeting:', finalMeetingId);
        
        // Update database with new meeting ID
        await supabase
          .from('interviews')
          .update({
            meeting_id: finalMeetingId,
            status: 'in_progress'
          })
          .eq('id', interview.id);
      } else {
        // Validate existing meeting
        try {
          const validatedId = await validateMeeting(meetingId);
          finalMeetingId = validatedId;
          console.log('Validated existing meeting:', finalMeetingId);
        } catch (error) {
          console.log('Meeting validation failed, creating new one:', error);
          finalMeetingId = await createMeeting();
          
          // Update database with new meeting ID
          await supabase
            .from('interviews')
            .update({
              meeting_id: finalMeetingId,
              status: 'in_progress'
            })
            .eq('id', interview.id);
        }
      }
      
      setMeetingId(finalMeetingId);
      setToken(getAuthToken());
    } catch (err) {
      console.error('Error initializing meeting:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'rgb(33, 121, 137)' }}></div>
          <p className="text-gray-600">Initializing meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Meeting Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onLeave}
            className="px-6 py-3 rounded-lg text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: 'rgb(33, 121, 137)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Only render MeetingProvider when we have both meetingId and token
  if (!meetingId || !token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'rgb(33, 121, 137)' }}></div>
          <p className="text-gray-600">Setting up meeting room...</p>
        </div>
      </div>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: participantData?.name || 'Participant',
      }}
      token={token}
    >
      <MeetingView
        interview={interview}
        onLeave={onLeave}
        participantRole={participantData?.role || 'candidate'}
        participantName={participantData?.name || 'Participant'}
      />
    </MeetingProvider>
  );
}
