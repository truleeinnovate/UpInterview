import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import * as ZegoExpressEngine from 'zego-express-engine-webrtc';
import {
    Mic, MicOff, Video, VideoOff, Phone,
    MessageSquare, HelpCircle, Settings,
    Users, Monitor, MonitorOff, Send, X,
    Share2, UserPlus, Copy, Link, Maximize, Minimize
} from 'lucide-react';
import Feedback from './Components/Feedback.jsx';
import QuestionBank from './Components/QuestionBank.jsx';
import Chat from './Components/Chat.jsx';
import { generateZegoToken, generateSimpleZegoToken, generateTestToken, generateJWTToken, generateAppSpecificToken, generateHMACToken, generateZegoCloudToken, isDevelopmentMode } from './utils/zegoTokenGenerator.jsx';
import { setupConsoleFilter } from './utils/consoleFilter.jsx';
import { mockVideoCall } from './utils/mockVideoCall.jsx';
import { multiUserVideoCall } from './utils/multiUserVideoCall.jsx';
import './Room.css';

const Room = () => {
    const { roomID, userName } = useParams();
    const navigate = useNavigate();

    // Clean user ID for comparison
    const cleanUserID = userName ? userName.replace(/[^a-zA-Z0-9_-]/g, '') : '';

    // Function to save user state to localStorage
    const saveUserState = (newState) => {
        try {
            const currentState = {
                isMicOn: newState.isMicOn !== undefined ? newState.isMicOn : isMicOn,
                isVideoOn: newState.isVideoOn !== undefined ? newState.isVideoOn : isVideoOn,
                isScreenSharing: newState.isScreenSharing !== undefined ? newState.isScreenSharing : isScreenSharing,
                lastUpdated: Date.now()
            };
            localStorage.setItem(`userState_${userName}_${roomID}`, JSON.stringify(currentState));
        } catch (error) {
            console.error('Failed to save user state:', error);
        }
    };

    // Setup console filter to reduce ZegoCloud verbose logging
    useEffect(() => {
        setupConsoleFilter();
    }, []);

    // Initialize with saved state on component mount
    useEffect(() => {

        // Update participants list with current user's saved state
        setParticipants(prev => {
            const currentUser = prev.find(p => p.userID === userName || p.userID === cleanUserID);
            if (currentUser) {
                return prev.map(p =>
                    p.userID === userName || p.userID === cleanUserID
                        ? { ...p, isMicOn, isVideoOn }
                        : p
                );
            }
            return prev;
        });
    }, []); // Run only once on mount

    // ZegoCloud configuration
    // Use a valid test App ID for development
    const appID = 1921148917; // Current App ID
    const testAppID = 1234567890; // Test App ID (this won't work but let's try)

    // Use a working App ID for testing
    const workingAppID = 1921148917; // Try the current one first

    // Alternative App IDs to try if the main one fails
    const alternativeAppIDs = [
        1921148917, // Current App ID
        1234567890, // Test App ID
        9876543210  // Another test App ID
    ];

    // Try different server configurations
    const server = 'wss://webliveroom1921148917-api.coolzcloud.com/ws';
    // Alternative servers to try if the main one fails
    const alternativeServers = [
        'wss://webliveroom1921148917-api.coolzcloud.com/ws',
        'wss://webliveroom1921148917-api.coolgcloud.com/ws',
        'wss://webliveroom1921148917-api.coolbcloud.com/ws',
        'wss://webliveroom1921148917-api.coolfcloud.com/ws',
        'wss://webliveroom1921148917-api.coolzcloud.com/ws'
    ];

    // State management
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});

    // Load saved mic/video state from localStorage
    const getSavedState = () => {
        try {
            const savedState = localStorage.getItem(`userState_${userName}_${roomID}`);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                return {
                    isMicOn: parsed.isMicOn !== undefined ? parsed.isMicOn : true,
                    isVideoOn: parsed.isVideoOn !== undefined ? parsed.isVideoOn : true,
                    isScreenSharing: parsed.isScreenSharing || false
                };
            }
        } catch (error) {
        }
        return { isMicOn: true, isVideoOn: true, isScreenSharing: false };
    };

    const savedState = getSavedState();
    const [isMicOn, setIsMicOn] = useState(savedState.isMicOn);
    const [isVideoOn, setIsVideoOn] = useState(savedState.isVideoOn);
    const [isScreenSharing, setIsScreenSharing] = useState(savedState.isScreenSharing);

    const [showFeedback, setShowFeedback] = useState(false);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    // Flag to track if changes are manual (to prevent auto-override)
    const [isManualChange, setIsManualChange] = useState(false);

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef({});
    const screenShareRef = useRef(null);

    // Initialize Multi-User Video Call System
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 2;

        // Validate and clean room and user parameters
        const cleanRoomID = roomID ? roomID.replace(/[^a-zA-Z0-9_-]/g, '') : 'room_' + Date.now();
        const cleanUserName = userName ? userName.replace(/[^a-zA-Z0-9_-]/g, '') : 'user_' + Date.now();
        const cleanUserID = cleanUserName; // Use userName as userID for simplicity



        const initMultiUserCall = async () => {
            // Add timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                if (isInitializing) {
                    console.error('Multi-user video call initialization timeout');
                    setError('Connection timeout. Please try again.');
                    setIsInitializing(false);
                }
            }, 30000); // 30 second timeout

            try {
                setIsInitializing(true);
                setError(null);


                // Initialize the multi-user video call system
                const initResult = await multiUserVideoCall.initialize();
                if (!initResult.success) {
                    throw new Error('Failed to initialize video call system');
                }

                // Define the event listener setup function
                const setupMultiUserEventListeners = () => {
                    // Room connection events
                    multiUserVideoCall.on('roomConnected', (data) => {
                        setIsConnected(true);
                        setIsInitializing(false);
                    });

                    multiUserVideoCall.on('roomDisconnected', (data) => {
                        setIsConnected(false);
                    });

                    // Participant events
                    multiUserVideoCall.on('participantsUpdate', (data) => {
                        setParticipants(data.allParticipants);

                        // Show notification for new participants
                        if (data.type === 'ADD') {
                            data.participants.forEach(participant => {
                                if (participant.userID !== cleanUserID) {
                                    // The stream will be handled by the roomStreamUpdate event
                                }
                            });
                        } else if (data.type === 'DELETE') {
                            data.participants.forEach(participant => {
                            });
                        }
                    });

                    // Stream events
                    multiUserVideoCall.on('remoteStreamStarted', (data) => {
                        setRemoteStreams(prev => ({
                            ...prev,
                            [data.streamID]: {
                                streamID: data.streamID,
                                userID: data.userID,
                                videoElement: data.videoElement,
                                container: data.container
                            }
                        }));
                    });

                    multiUserVideoCall.on('remoteStreamStopped', (data) => {
                        setRemoteStreams(prev => {
                            const newStreams = { ...prev };
                            delete newStreams[data.streamID];
                            return newStreams;
                        });
                    });

                    // Streams update event (for when streams are added/removed)
                    multiUserVideoCall.on('streamsUpdate', (data) => {
                        if (data.type === 'ADD') {
                            data.streams.forEach(stream => {
                                if (stream.userID !== cleanUserID) {
                                } else {
                                }
                            });
                        } else if (data.type === 'DELETE') {
                            data.streams.forEach(stream => {
                            });
                        }
                    });

                    // Local stream events
                    multiUserVideoCall.on('localStreamPublished', (data) => {
                        setLocalStream(data.stream);

                        if (localVideoRef.current && data.stream) {
                            localVideoRef.current.srcObject = data.stream;
                        }

                        // Update current user's stream ID in participants
                        setParticipants(prev => prev.map(p =>
                            p.userID === cleanUserID
                                ? { ...p, streamID: data.streamID }
                                : p
                        ));
                    });

                    // Status change events
                    multiUserVideoCall.on('micStatusChanged', (data) => {
                        if (data.userID === cleanUserID) {
                            setIsMicOn(data.isMicOn);
                        }
                    });

                    multiUserVideoCall.on('videoStatusChanged', (data) => {
                        if (data.userID === cleanUserID) {
                            setIsVideoOn(data.isVideoOn);
                        }
                    });

                    // Screen share events
                    multiUserVideoCall.on('screenShareStarted', (data) => {
                        setIsScreenSharing(true);
                    });

                    multiUserVideoCall.on('screenShareStopped', () => {
                        setIsScreenSharing(false);
                    });
                };

                // IMPORTANT: Call the event listener setup function
                setupMultiUserEventListeners();

                // Generate token for authentication
                let token = '';
                try {
                    if (isDevelopmentMode()) {
                        const tokenResult = await generateZegoCloudToken(cleanUserName, cleanRoomID);
                        if (tokenResult && typeof tokenResult === 'object') {
                            token = tokenResult.token || tokenResult.simpleToken || '';
                        } else if (typeof tokenResult === 'string') {
                            token = tokenResult;
                        }
                    } else {
                        const tokenResult = await generateZegoToken(cleanUserName, cleanRoomID);
                        if (tokenResult && typeof tokenResult === 'object') {
                            token = tokenResult.token || tokenResult.simpleToken || '';
                        } else if (typeof tokenResult === 'string') {
                            token = tokenResult;
                        }
                    }
                } catch (error) {
                    token = '';
                }

                // Join the room

                const joinResult = await multiUserVideoCall.joinRoom(cleanRoomID, cleanUserID, cleanUserName, token);

                if (joinResult.success) {

                    setIsConnected(true);
                    setIsInitializing(false);

                    // Set initial state
                    const roomInfo = multiUserVideoCall.getRoomInfo();
                    const allParticipants = multiUserVideoCall.getAllParticipants();
                    setParticipants(allParticipants);

                    // Set up local video
                    const currentUser = multiUserVideoCall.getCurrentUser();
                    if (currentUser) {
                        setIsMicOn(currentUser.isMicOn);
                        setIsVideoOn(currentUser.isVideoOn);
                    }

                } else {
                    throw new Error('Failed to join room');
                }

            } catch (error) {
                console.error('Failed to initialize ZegoCloud:', error);
                let errorMessage = 'Failed to connect to video call';

                // Safely check error message and code
                const errorMsg = error?.message || error?.toString() || '';
                const errorCode = error?.code || 0;


                // Handle specific ZegoCloud error codes
                if (errorCode === 50119) {
                    errorMessage = 'Authentication failed. Please check your ZegoCloud credentials.';
                } else if (errorCode === 1102016) {
                    errorMessage = 'Room connection failed. Please try again or check room settings.';
                } else if (errorCode === 1100001) {
                    errorMessage = 'Invalid parameters. Please check your room ID and user name.';
                } else if (errorCode === 20014) {
                    errorMessage = 'App configuration error. Please check your ZegoCloud App ID.';
                } else if (errorMsg.includes('network')) {
                    errorMessage = 'Network connection failed. Please check your internet connection.';
                } else if (errorMsg.includes('permission')) {
                    errorMessage = 'Camera/microphone permission denied. Please allow access and try again.';
                } else if (errorMsg.includes('SDK')) {
                    errorMessage = 'Video call service unavailable. Please try again later.';
                } else if (errorMsg) {
                    errorMessage = errorMsg;
                }

                // Check if we should retry
                if (retryCount < maxRetries && (errorCode === 50119 || errorCode === 1102016 || errorCode === 1100001)) {
                    retryCount++;
                    setTimeout(() => {
                        // Recursive call to retry initialization
                        const retryInit = async () => {
                            try {
                                setIsInitializing(true);
                                setError(null);

                                // Try to connect again with the same parameters
                                const connectResult = await multiUserVideoCall.joinRoom(cleanRoomID, cleanUserName, cleanUserName);

                                if (connectResult && connectResult.success) {
                                    setIsConnected(true);
                                    setIsInitializing(false);

                                    // Add current user to participants with proper structure
                                    setParticipants([{
                                        userID: cleanUserName,
                                        userName: cleanUserName,
                                        isMicOn: true,
                                        isVideoOn: true,
                                        streamID: null
                                    }]);

                                    // Set up local stream
                                    const currentUser = multiUserVideoCall.getCurrentUser();
                                    if (currentUser) {
                                        setIsMicOn(currentUser.isMicOn);
                                        setIsVideoOn(currentUser.isVideoOn);
                                    }

                                    // Set up participants
                                    const allParticipants = multiUserVideoCall.getAllParticipants();
                                    setParticipants(allParticipants);
                                }
                            } catch (retryError) {
                                console.error('Retry failed:', retryError);
                                setError('Connection failed after retry. Please try again.');
                                setIsInitializing(false);
                            }
                        };

                        retryInit();
                    }, 3000); // Wait 3 seconds before retrying
                } else {

                    // Try using mock video call as fallback
                    try {
                        const mockResult = await mockVideoCall.connectToRoom(cleanRoomID, cleanUserName, cleanUserName);
                        if (mockResult.success) {
                            setIsConnected(true);
                            setIsInitializing(false);
                            setError(null);

                            // Set up mock stream
                            const mockState = mockVideoCall.getState();
                            setLocalStream(mockState.localStream);
                            setParticipants(mockState.participants);
                            setIsMicOn(mockState.isMicOn);
                            setIsVideoOn(mockState.isVideoOn);

                            // Set up video element
                            if (localVideoRef.current && mockState.localStream) {
                                localVideoRef.current.srcObject = mockState.localStream;
                            }

                            return; // Success with mock system
                        }
                    } catch (mockError) {
                    }

                    setError('Video call service unavailable. Please try again later.');
                    setIsInitializing(false);
                }
            } finally {
                clearTimeout(timeoutId);
            }
        };

        initMultiUserCall();

        return () => {
            try {
                // Clean up multi-user video call system
                if (multiUserVideoCall) {
                    multiUserVideoCall.leaveRoom();
                    multiUserVideoCall.destroy();
                }

                // Clean up local stream
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                }

                // Clean up screen share
                if (screenShareRef.current) {
                    screenShareRef.current.getTracks().forEach(track => track.stop());
                }

            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        };
    }, []);






    // Toggle microphone
    const toggleMic = async () => {
        try {
            const newMicStatus = !isMicOn;

            // Mark this as a manual change
            setIsManualChange(true);

            if (multiUserVideoCall.isConnected) {
                // Use multi-user system
                const result = await multiUserVideoCall.toggleMicrophone();
                if (result.success) {
                    setIsMicOn(result.isMicOn);
                    // Save state to localStorage
                    saveUserState({ isMicOn: result.isMicOn });
                    // Update current user's status in participants list
                    setParticipants(prev => prev.map(p =>
                        p.userID === userName || p.userID === cleanUserID
                            ? { ...p, isMicOn: result.isMicOn }
                            : p
                    ));
                }
            } else if (mockVideoCall.isConnected) {
                // Use mock system as fallback
                const result = await mockVideoCall.toggleMic();
                setIsMicOn(result.isMicOn);
                // Save state to localStorage
                saveUserState({ isMicOn: result.isMicOn });
                // Update current user's status in participants list
                setParticipants(prev => prev.map(p =>
                    p.userID === userName || p.userID === cleanUserID
                        ? { ...p, isMicOn: result.isMicOn }
                        : p
                ));

                // Force UI update
                setTimeout(() => {
                    setParticipants(prev => [...prev]); // Force re-render
                }, 100);
            } else {
                // Fallback for when no system is connected
                setIsMicOn(newMicStatus);
                saveUserState({ isMicOn: newMicStatus });
            }

        } catch (error) {
            console.error('Failed to toggle microphone:', error);
            setIsManualChange(false);
        }
    };

    // Toggle video
    const toggleVideo = async () => {
        try {
            const newVideoStatus = !isVideoOn;

            // Mark this as a manual change
            setIsManualChange(true);

            if (multiUserVideoCall.isConnected) {
                // Use multi-user system
                const result = await multiUserVideoCall.toggleVideo();
                if (result.success) {
                    setIsVideoOn(result.isVideoOn);
                    // Save state to localStorage
                    saveUserState({ isVideoOn: result.isVideoOn });
                    // Update current user's status in participants list
                    setParticipants(prev => prev.map(p =>
                        p.userID === userName || p.userID === cleanUserID
                            ? { ...p, isVideoOn: result.isVideoOn }
                            : p
                    ));
                }
            } else if (mockVideoCall.isConnected) {
                // Use mock system as fallback
                const result = await mockVideoCall.toggleVideo();
                setIsVideoOn(result.isVideoOn);
                // Save state to localStorage
                saveUserState({ isVideoOn: result.isVideoOn });
                // Update current user's status in participants list
                setParticipants(prev => prev.map(p =>
                    p.userID === userName || p.userID === cleanUserID
                        ? { ...p, isVideoOn: result.isVideoOn }
                        : p
                ));

                // Force UI update
                setTimeout(() => {
                    setParticipants(prev => [...prev]); // Force re-render
                }, 100);
            } else {
                // Fallback for when no system is connected
                setIsVideoOn(newVideoStatus);
                saveUserState({ isVideoOn: newVideoStatus });
            }

        } catch (error) {
            console.error('Failed to toggle video:', error);
            setIsManualChange(false);
        }
    };

    // Toggle screen sharing
    const toggleScreenShare = async () => {
        try {
            if (multiUserVideoCall.isConnected) {
                // Use multi-user system
                const result = await multiUserVideoCall.toggleScreenShare();
                if (result.success) {
                    setIsScreenSharing(result.isScreenSharing);
                    // Save state to localStorage
                    saveUserState({ isScreenSharing: result.isScreenSharing });
                }
            } else if (mockVideoCall.isConnected) {
                // Use mock system as fallback
                const result = await mockVideoCall.toggleScreenShare();
                setIsScreenSharing(result.isScreenSharing);
                // Save state to localStorage
                saveUserState({ isScreenSharing: result.isScreenSharing });
            }
        } catch (error) {
            console.error('Failed to toggle screen sharing:', error);
        }
    };

    // Leave room
    const leaveRoom = async () => {
        try {
            if (multiUserVideoCall.isConnected) {
                // Use multi-user system
                await multiUserVideoCall.leaveRoom();
            } else if (mockVideoCall.isConnected) {
                // Use mock system as fallback
                await mockVideoCall.disconnect();
            }
            navigate('/');
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Generate invite link
    const generateInviteLink = () => {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/video-call/join/${roomID}`;
        setInviteLink(inviteUrl);
        setShowInviteModal(true);
    };

    // Copy invite link to clipboard
    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            alert('Invite link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = inviteLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Invite link copied to clipboard!');
        }
    };

    // Share invite link
    const shareInviteLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my video call',
                    text: `Join my video call in room: ${roomID}`,
                    url: inviteLink
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            copyInviteLink();
        }
    };

    // Set up event listeners for mock video call
    useEffect(() => {
        if (mockVideoCall.isConnected) {
            // Listen for participant updates
            const handleParticipantsUpdate = (participants) => {
                setParticipants(participants);

                // Update remote streams for new participants
                const newRemoteStreams = {};
                participants.forEach(participant => {
                    if (participant.userID !== userName && participant.stream) {
                        newRemoteStreams[participant.userID] = participant.stream;
                    }
                });
                setRemoteStreams(newRemoteStreams);
            };

            // Listen for mic status updates
            const handleMicStatusUpdate = (data) => {
                // Update the specific participant's mic status
                setParticipants(prev => prev.map(p =>
                    p.userID === data.userID ? { ...p, isMicOn: data.isMicOn } : p
                ));

                // Only update local state if it's the current user AND the change came from the system
                // AND it's not a manual change
                if ((data.userID === userName || data.userID === cleanUserID) &&
                    mockVideoCall.isConnected &&
                    mockVideoCall.isMicOn === data.isMicOn &&
                    !isManualChange) {
                    setIsMicOn(data.isMicOn);
                }
            };

            // Listen for video status updates
            const handleVideoStatusUpdate = (data) => {
                // Update the specific participant's video status
                setParticipants(prev => prev.map(p =>
                    p.userID === data.userID ? { ...p, isVideoOn: data.isVideoOn } : p
                ));

                // Only update local state if it's the current user AND the change came from the system
                // AND it's not a manual change
                if ((data.userID === userName || data.userID === cleanUserID) &&
                    mockVideoCall.isConnected &&
                    mockVideoCall.isVideoOn === data.isVideoOn &&
                    !isManualChange) {
                    setIsVideoOn(data.isVideoOn);
                }
            };

            // Listen for new participants joining
            const handleParticipantJoined = (participant) => {
                setParticipants(prev => [...prev, participant]);

                // Create a mock stream for the new participant
                const mockStream = mockVideoCall.createMockStream(participant.userName);
                setRemoteStreams(prev => ({ ...prev, [participant.userID]: mockStream }));


                // Show notification
                alert(`${participant.userName} joined the call! Your video will move to the corner.`);
            };

            // Listen for participants leaving
            const handleParticipantLeft = (data) => {
                setParticipants(prev => prev.filter(p => p.userID !== data.userID));
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[data.userID];
                    return newStreams;
                });
            };

            // Register event listeners
            mockVideoCall.on('participantsUpdate', handleParticipantsUpdate);
            mockVideoCall.on('micStatusUpdate', handleMicStatusUpdate);
            mockVideoCall.on('videoStatusUpdate', handleVideoStatusUpdate);
            mockVideoCall.on('participantJoined', handleParticipantJoined);
            mockVideoCall.on('participantLeft', handleParticipantLeft);

            // Set up periodic refresh for mock system (only for remote participants)
            const refreshInterval = setInterval(() => {
                if (mockVideoCall.isConnected) {
                    const currentState = mockVideoCall.getState();

                    // Only update remote participants, preserve current user's manual state
                    setParticipants(prev => {
                        const updatedParticipants = currentState.participants.map(remoteParticipant => {
                            // If this is the current user, preserve their manual state
                            if (remoteParticipant.userID === userName || remoteParticipant.userID === cleanUserID) {
                                return {
                                    ...remoteParticipant,
                                    isMicOn: isMicOn, // Use local state
                                    isVideoOn: isVideoOn // Use local state
                                };
                            }
                            return remoteParticipant;
                        });
                        return updatedParticipants;
                    });

                    // Update remote streams
                    const newRemoteStreams = {};
                    currentState.participants.forEach(participant => {
                        if (participant.userID !== userName && participant.stream) {
                            newRemoteStreams[participant.userID] = participant.stream;
                        }
                    });
                    setRemoteStreams(newRemoteStreams);
                }
            }, 2000); // Check every 2 seconds

            // Cleanup function
            return () => {
                clearInterval(refreshInterval);
                mockVideoCall.off('participantsUpdate', handleParticipantsUpdate);
                mockVideoCall.off('micStatusUpdate', handleMicStatusUpdate);
                mockVideoCall.off('videoStatusUpdate', handleVideoStatusUpdate);
                mockVideoCall.off('participantJoined', handleParticipantJoined);
                mockVideoCall.off('participantLeft', handleParticipantLeft);
            };
        }
    }, [mockVideoCall.isConnected]);

    // Set video sources for remote streams
    useEffect(() => {
        if (participants.length > 1) {
            const remoteParticipant = participants.find(p => p.userID !== userName);
            if (remoteParticipant && remoteParticipant.isVideoOn) {
                const videoElement = document.getElementById(`remote-${remoteParticipant.userID}`);
                if (videoElement && remoteStreams[remoteParticipant.userID]) {
                    videoElement.srcObject = remoteStreams[remoteParticipant.userID];

                    // Add event listeners to track video loading
                    videoElement.onloadedmetadata = () => {
                    };
                    videoElement.onerror = (error) => {
                        console.error('Video error for:', remoteParticipant.userName, error);
                    };
                } else {

                    // Try to create stream if missing
                    if (videoElement && !remoteStreams[remoteParticipant.userID]) {
                        const newStream = mockVideoCall.createMockStream(remoteParticipant.userName);
                        setRemoteStreams(prev => ({
                            ...prev,
                            [remoteParticipant.userID]: newStream
                        }));
                    }
                }
            }
        }
    }, [participants, remoteStreams, userName]);

    // Real-time status synchronization (only for remote participants)
    useEffect(() => {
        // Don't sync if this is a manual change
        if (isManualChange) {
            return;
        }

        // Find current user in participants list and sync state
        const currentParticipant = participants.find(p =>
            p.userID === userName || p.userID === cleanUserID
        );

        if (currentParticipant) {
            // Only sync if the change came from the video call system, not manual changes
            // This prevents overriding manual user actions
            const shouldSyncMic = currentParticipant.isMicOn !== isMicOn &&
                (mockVideoCall.isConnected ? mockVideoCall.isMicOn === currentParticipant.isMicOn : true);
            const shouldSyncVideo = currentParticipant.isVideoOn !== isVideoOn &&
                (mockVideoCall.isConnected ? mockVideoCall.isVideoOn === currentParticipant.isVideoOn : true);

            if (shouldSyncMic) {
                setIsMicOn(currentParticipant.isMicOn);
            }
            if (shouldSyncVideo) {
                setIsVideoOn(currentParticipant.isVideoOn);
            }
        }
    }, [participants, userName, cleanUserID, isManualChange]); // Added isManualChange to dependencies

    // Apply saved state to video call systems when they connect
    useEffect(() => {
        if (isConnected && (multiUserVideoCall.isConnected || mockVideoCall.isConnected)) {

            // Apply saved state to the connected system
            if (mockVideoCall.isConnected) {
                // Update mock system state to match saved state
                if (mockVideoCall.isMicOn !== isMicOn) {
                    mockVideoCall.isMicOn = isMicOn;
                    if (mockVideoCall.audioTrack) {
                        mockVideoCall.audioTrack.enabled = isMicOn;
                    }
                }
                if (mockVideoCall.isVideoOn !== isVideoOn) {
                    mockVideoCall.isVideoOn = isVideoOn;
                    if (mockVideoCall.videoTrack) {
                        mockVideoCall.videoTrack.enabled = isVideoOn;
                    }
                }
            }
        }
    }, [isConnected, isMicOn, isVideoOn]);

    // Show loading or error state
    if (isInitializing) {
        return (
            <div className="room-container">
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="spinner"></div>
                        <h2>Connecting to video call...</h2>
                        <p>Please wait while we establish your connection.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="room-container">
                <div className="error-overlay">
                    <div className="error-content">
                        <h2>Connection Failed</h2>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Try Again
                        </button>
                        <button onClick={() => navigate('/')} className="back-btn">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="room-container">
            <div className="room-header">
                <div className="room-info">
                    <h2>Room: {roomID}</h2>
                    <p>Welcome, {userName}</p>
                    <div className="room-stats">
                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? 'Connected' : 'Connecting...'}
                        </div>
                        <div className="participant-count-display">
                            {participants.length} participant{participants.length !== 1 ? 's' : ''} in call
                        </div>
                    </div>
                </div>

                <div className="room-controls">
                    <button
                        className={`control-btn ${isMicOn ? 'active' : 'inactive'}`}
                        onClick={toggleMic}
                        title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                    >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    <button
                        className={`control-btn ${isVideoOn ? 'active' : 'inactive'}`}
                        onClick={toggleVideo}
                        title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                    >
                        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    <button
                        className={`control-btn ${isScreenSharing ? 'active' : 'inactive'}`}
                        onClick={toggleScreenShare}
                        title={isScreenSharing ? 'Stop Screen Sharing' : 'Start Screen Sharing'}
                    >
                        {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                        {isScreenSharing && <span className="screen-share-indicator">●</span>}
                    </button>

                    <button className="control-btn chat-btn" onClick={() => setShowChat(true)} title="Open Chat">
                        <MessageSquare size={20} />
                    </button>

                    <button className="control-btn feedback-btn" onClick={() => setShowFeedback(true)} title="Send Feedback">
                        <HelpCircle size={20} />
                    </button>

                    <button className="control-btn invite-btn" onClick={generateInviteLink} title="Invite People">
                        <UserPlus size={20} />
                    </button>

                    <button className="control-btn question-btn" onClick={() => setShowQuestionBank(true)} title="Question Bank">
                        <HelpCircle size={20} />
                    </button>

                    <button
                        className={`control-btn participants-btn ${showParticipants ? 'active' : ''}`}
                        onClick={() => setShowParticipants(!showParticipants)}
                        title="View Participants"
                    >
                        <Users size={20} />
                        <span className="participant-count">{participants.length}</span>
                    </button>

                    <button className="control-btn fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <button className="control-btn leave-btn" onClick={leaveRoom} title="Leave Call">
                        <Phone size={20} />
                    </button>
                </div>
            </div>

            <div className="room-content">
                <div className="video-container">
                    {/* Main video area */}
                    <div className="main-video-area">
                        {/* Layout indicator for debugging */}
                        <div className="layout-indicator" style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            zIndex: 1000
                        }}>
                            {participants.length === 1 ? 'Single User Mode' : 'Multi User Mode'}
                        </div>

                        {/* Show remote participant video in main area when there are other participants */}
                        {participants.length > 1 && (() => {
                            // Find the first remote participant (not current user)
                            // Try multiple ways to identify the remote participant
                            let remoteParticipant = participants.find(p =>
                                p.userID !== userName &&
                                p.userName !== userName &&
                                p.userID !== cleanUserID
                            );

                            // If no remote participant found, try to get the second participant in the list
                            if (!remoteParticipant && participants.length > 1) {
                                remoteParticipant = participants[1]; // Get second participant
                            }

                            // If still no remote participant, show a placeholder
                            if (!remoteParticipant && participants.length > 1) {
                                return (
                                    <div className="main-remote-video">
                                        <div className="video-off-placeholder">
                                            <div className="video-off-avatar">
                                                ??
                                            </div>
                                            <div className="video-off-name">Remote Participant</div>
                                        </div>
                                        <div className="video-label">
                                            Remote Participant
                                            <div className="participant-status">
                                                <MicOff size={16} color="#f44336" />
                                                <VideoOff size={16} color="#f44336" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }


                            if (remoteParticipant) {
                                return (
                                    <div key={remoteParticipant.userID} className="main-remote-video">
                                        {remoteParticipant.isVideoOn ? (
                                            <video
                                                id={`remote-${remoteParticipant.userID}`}
                                                className="remote-video"
                                                autoPlay
                                                playsInline
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '12px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div className="video-off-placeholder">
                                                <div className="video-off-avatar">
                                                    {remoteParticipant.userName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="video-off-name">{remoteParticipant.userName}</div>
                                            </div>
                                        )}
                                        <div className="video-label">
                                            {remoteParticipant.userName}
                                            <div className="participant-status">
                                                {remoteParticipant.isMicOn ? (
                                                    <Mic size={16} color="#4CAF50" />
                                                ) : (
                                                    <MicOff size={16} color="#f44336" />
                                                )}
                                                {remoteParticipant.isVideoOn ? (
                                                    <Video size={16} color="#4CAF50" />
                                                ) : (
                                                    <VideoOff size={16} color="#f44336" />
                                                )}
                                            </div>
                                        </div>
                                        {/* {!remoteParticipant.isVideoOn && (
                      <div className="video-off-overlay">
                        <VideoOff size={64} />
                        <span>Camera Off</span>
                      </div>
                    )} */}
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Show local video in main area when you're the only participant */}
                        {participants.length === 1 && (
                            <div className="main-local-video">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="main-video"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '12px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div className="video-label">
                                    You ({userName})
                                    <div className="participant-status">
                                        {isMicOn ? (
                                            <Mic size={16} color="#4CAF50" />
                                        ) : (
                                            <MicOff size={16} color="#f44336" />
                                        )}
                                        {isVideoOn ? (
                                            <Video size={16} color="#4CAF50" />
                                        ) : (
                                            <VideoOff size={16} color="#f44336" />
                                        )}
                                    </div>
                                </div>
                                <div className="alone-indicator">
                                    <span>You're the only one here</span>
                                </div>
                                {!isVideoOn && (
                                    <div className="video-off-overlay">
                                        <VideoOff size={64} />
                                        <span>Camera Off</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Local video in top-right corner (only when there are multiple participants) */}
                    {participants.length > 1 && (
                        <div className="local-video-corner">
                            <div className="local-video-wrapper">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="local-video"
                                />
                                <div className="video-label">You ({userName})</div>
                                {!isVideoOn && (
                                    <div className="video-off-overlay">
                                        <VideoOff size={24} />
                                        <span>Off</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Participants Sidebar */}
                {showParticipants && (
                    <div className="participants-sidebar">
                        <div className="sidebar-header">
                            <h3>Participants ({participants.length})</h3>
                            <button onClick={() => setShowParticipants(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="participants-list">
                            {participants.map((participant, index) => (
                                <div key={index} className="participant-item">
                                    <div className="participant-avatar">
                                        {participant.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="participant-info">
                                        <span className="participant-name">
                                            {participant.userName}
                                            {participant.userID === userName && <span className="you-label"> (You)</span>}
                                        </span>
                                        <div className="participant-status-icons">
                                            {!participant.isMicOn && <MicOff size={14} color="#f44336" />}
                                            {participant.isMicOn && <Mic size={14} color="#4CAF50" />}
                                            {!participant.isVideoOn && <VideoOff size={14} color="#f44336" />}
                                            {participant.isVideoOn && <Video size={14} color="#4CAF50" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Sidebar */}
                {showChat && (
                    <Chat
                        onClose={() => setShowChat(false)}
                        userName={userName}
                        messages={chatMessages}
                        onSendMessage={(message) => {
                            const newMsg = {
                                id: Date.now(),
                                sender: userName,
                                text: message,
                                timestamp: new Date().toLocaleTimeString()
                            };
                            setChatMessages(prev => [...prev, newMsg]);
                        }}
                    />
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="modal-overlay">
                    <div className="modal">
                        <Feedback onClose={() => setShowFeedback(false)} />
                    </div>
                </div>
            )}

            {/* Question Bank Modal */}
            {showQuestionBank && (
                <div className="modal-overlay">
                    <div className="modal">
                        <QuestionBank onClose={() => setShowQuestionBank(false)} />
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal invite-modal">
                        <div className="modal-header">
                            <h3>Invite People to Meeting</h3>
                            <button onClick={() => setShowInviteModal(false)} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <p>Share this link with others to join your meeting:</p>
                            <div className="invite-link-container">
                                <input
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    className="invite-link-input"
                                    placeholder="Invite link will appear here..."
                                />
                                <button onClick={copyInviteLink} className="copy-btn" title="Copy Link">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="invite-actions">
                                <button onClick={shareInviteLink} className="share-btn">
                                    <Share2 size={16} />
                                    Share Link
                                </button>
                                <button onClick={copyInviteLink} className="copy-btn-large">
                                    <Copy size={16} />
                                    Copy Link
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    // Force refresh from localStorage
                                    if (mockVideoCall.isConnected) {
                                        mockVideoCall.checkRoomUpdates();
                                        alert('Forced room update check!');
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #FF9800, #F57C00)' }}
                            >
                                🔄 Force Room Update
                            </button>
                            <button
                                onClick={() => {

                                    // Check localStorage
                                    const roomData = localStorage.getItem(`mockRoom_${roomID}`);

                                    alert(`Participants: ${participants.length}, Remote Streams: ${Object.keys(remoteStreams).length}\nlocalStorage: ${roomData ? 'Found' : 'Not found'}`);
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)' }}
                            >
                                🔍 Debug Streams
                            </button>
                            <button
                                onClick={() => {
                                    if (mockVideoCall.isConnected) {
                                        alert(`Video: ${mockVideoCall.videoTrack?.enabled ? 'ON' : 'OFF'}\nAudio: ${mockVideoCall.audioTrack?.enabled ? 'ON' : 'OFF'}`);
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #FF5722, #E64A19)' }}
                            >
                                📹 Check Camera Status
                            </button>
                            <button
                                onClick={() => {
                                    // Test mock stream creation
                                    const testStream = mockVideoCall.createMockStream('Test User');

                                    // Test video element creation
                                    const testVideo = document.createElement('video');
                                    testVideo.srcObject = testStream;
                                    testVideo.style.width = '200px';
                                    testVideo.style.height = '150px';
                                    testVideo.style.border = '2px solid red';
                                    testVideo.autoplay = true;
                                    testVideo.playsInline = true;

                                    document.body.appendChild(testVideo);
                                    alert('Test video element added to page! Check for red-bordered video.');
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #795548, #5D4037)' }}
                            >
                                🧪 Test Mock Stream
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const result = await toggleScreenShare();

                                        if (result.success) {
                                            alert(`Screen sharing ${result.isScreenSharing ? 'STARTED' : 'STOPPED'} successfully!`);
                                        } else {
                                            alert(`Screen sharing failed: ${result.error}`);
                                        }
                                    } catch (error) {
                                        console.error('Screen share test error:', error);
                                        alert(`Screen sharing test failed: ${error.message}`);
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #FF9800, #F57C00)' }}
                            >
                                🖥️ Test Screen Sharing
                            </button>
                            <button
                                onClick={() => {
                                    if (participants.length > 1) {
                                        const remoteParticipant = participants.find(p => p.userID !== userName);
                                        if (remoteParticipant) {
                                            // Toggle remote participant's video status for testing
                                            const updatedParticipants = participants.map(p =>
                                                p.userID === remoteParticipant.userID
                                                    ? { ...p, isVideoOn: !p.isVideoOn }
                                                    : p
                                            );
                                            setParticipants(updatedParticipants);
                                            alert(`Toggled ${remoteParticipant.userName}'s video: ${!remoteParticipant.isVideoOn ? 'ON' : 'OFF'}`);
                                        }
                                    } else {
                                        alert('No remote participants to toggle');
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #4CAF50, #388E3C)' }}
                            >
                                🎬 Toggle Remote Video
                            </button>
                            <button
                                onClick={() => {
                                    if (participants.length > 1) {
                                        // Force refresh the layout by updating participants
                                        const updatedParticipants = [...participants];
                                        setParticipants(updatedParticipants);

                                        // Also ensure remote streams are created
                                        const newRemoteStreams = {};
                                        participants.forEach(participant => {
                                            if (participant.userID !== userName) {
                                                newRemoteStreams[participant.userID] = mockVideoCall.createMockStream(participant.userName);
                                            }
                                        });
                                        setRemoteStreams(newRemoteStreams);

                                        alert('Forced layout refresh! Check console for debug info.');
                                    } else {
                                        alert('Need multiple participants to refresh layout');
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #FF9800, #F57C00)' }}
                            >
                                🔄 Force Layout Refresh
                            </button>
                            <button
                                onClick={() => {

                                    if (participants.length > 1) {
                                        const remoteParticipant = participants.find(p => p.userID !== userName);

                                        if (remoteParticipant) {
                                            const videoElement = document.getElementById(`remote-${remoteParticipant.userID}`);
                                
                                            if (videoElement && remoteStreams[remoteParticipant.userID]) {
                                                videoElement.srcObject = remoteStreams[remoteParticipant.userID];
                                            } else {
                                            }
                                        }
                                    }

                                    alert('Video debug info logged to console!');
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #E91E63, #C2185B)' }}
                            >
                                🎥 Debug Video Issues
                            </button>
                            <button
                                onClick={() => {

                                    const currentParticipant = participants.find(p =>
                                        p.userID === userName || p.userID === cleanUserID
                                    );

                                    if (currentParticipant) {
                                    }

                                    alert(`Status Debug Info:\nMic: ${isMicOn ? 'ON' : 'OFF'}\nVideo: ${isVideoOn ? 'ON' : 'OFF'}\nManual Change: ${isManualChange ? 'YES' : 'NO'}`);
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)' }}
                            >
                                📊 Debug Status Sync
                            </button>
                            <button
                                onClick={() => {
                                    // Manually toggle mic status for testing
                                    const newMicStatus = !isMicOn;
                                    setIsMicOn(newMicStatus);

                                    // Save to localStorage
                                    saveUserState({ isMicOn: newMicStatus });

                                    // Update participants list
                                    setParticipants(prev => prev.map(p =>
                                        p.userID === userName || p.userID === cleanUserID
                                            ? { ...p, isMicOn: newMicStatus }
                                            : p
                                    ));

                                    alert(`Mic manually toggled to: ${newMicStatus ? 'ON' : 'OFF'}`);
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #4CAF50, #388E3C)' }}
                            >
                                🎤 Manual Toggle Mic
                            </button>
                            <button
                                onClick={() => {
                                    // Manually toggle video status for testing
                                    const newVideoStatus = !isVideoOn;
                                    setIsVideoOn(newVideoStatus);

                                    // Save to localStorage
                                    saveUserState({ isVideoOn: newVideoStatus });

                                    // Update participants list
                                    setParticipants(prev => prev.map(p =>
                                        p.userID === userName || p.userID === cleanUserID
                                            ? { ...p, isVideoOn: newVideoStatus }
                                            : p
                                    ));

                                    alert(`Video manually toggled to: ${newVideoStatus ? 'ON' : 'OFF'}`);
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #2196F3, #1976D2)' }}
                            >
                                📹 Manual Toggle Video
                            </button>
                            <button
                                onClick={() => {
                                    // Show current saved state
                                    const savedState = localStorage.getItem(`userState_${userName}_${roomID}`);

                                    if (savedState) {
                                        const parsed = JSON.parse(savedState);
                                        alert(`Saved State:\nMic: ${parsed.isMicOn ? 'ON' : 'OFF'}\nVideo: ${parsed.isVideoOn ? 'ON' : 'OFF'}\nScreen Share: ${parsed.isScreenSharing ? 'ON' : 'OFF'}\nLast Updated: ${new Date(parsed.lastUpdated).toLocaleString()}`);
                                    } else {
                                        alert('No saved state found');
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #607D8B, #455A64)' }}
                            >
                                💾 Show Saved State
                            </button>
                            <button
                                onClick={() => {
                                    // Clear saved state
                                    localStorage.removeItem(`userState_${userName}_${roomID}`);
                                    alert('Saved state cleared! Reload page to see default state.');
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #F44336, #D32F2F)' }}
                            >
                                🗑️ Clear Saved State
                            </button>
                            <button
                                onClick={() => {
                                    if (mockVideoCall.isConnected) {
                                        const currentState = mockVideoCall.getState();
                                        setParticipants(currentState.participants);

                                        // Update remote streams
                                        const newRemoteStreams = {};
                                        currentState.participants.forEach(participant => {
                                            if (participant.userID !== userName && participant.stream) {
                                                newRemoteStreams[participant.userID] = participant.stream;
                                            }
                                        });
                                        setRemoteStreams(newRemoteStreams);
                                        alert(`Refreshed! Participants: ${currentState.participants.length}`);
                                    } else {
                                        alert(`Participants: ${participants.length}, Remote Streams: ${Object.keys(remoteStreams).length}`);
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #2196F3, #1976D2)' }}
                            >
                                🔄 Refresh Participants
                            </button>
                            <button
                                onClick={() => {
                                    if (participants.length > 1) {
                                        const lastParticipant = participants[participants.length - 1];
                                        if (lastParticipant.userID !== userName) {
                                            if (mockVideoCall.isConnected) {
                                                mockVideoCall.removeParticipant(lastParticipant.userID);
                                            } else if (multiUserVideoCall.isConnected) {
                                                // Remove from participants list
                                                setParticipants(prev => prev.filter(p => p.userID !== lastParticipant.userID));

                                                // Remove stream container if exists
                                                if (lastParticipant.streamID && remoteVideosRef.current[lastParticipant.streamID]) {
                                                    const container = remoteVideosRef.current[lastParticipant.streamID];
                                                    container.remove();
                                                    delete remoteVideosRef.current[lastParticipant.streamID];
                                                }

                                                // Remove from remote streams
                                                setRemoteStreams(prev => {
                                                    const newStreams = { ...prev };
                                                    delete newStreams[lastParticipant.streamID];
                                                    return newStreams;
                                                });
                                            }
                                            alert(`Test user "${lastParticipant.userName}" left the meeting!`);
                                        }
                                    }
                                }}
                                className="test-btn"
                                style={{ marginTop: '0.5rem', background: 'linear-gradient(45deg, #f44336, #d32f2f)' }}
                            >
                                🧪 Simulate Someone Leaving (Demo)
                            </button>
                            <p className="test-note">These simulate participants joining/leaving for testing purposes</p>
                        </div>
                        <div className="invite-info">
                            <p><strong>Room ID:</strong> {roomID}</p>
                            <p><strong>Meeting Link:</strong> {inviteLink}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Room;