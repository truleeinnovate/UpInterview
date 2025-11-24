// Multi-User Video Call System following ZegoCloud best practices
// import * as ZegoExpressEngine from 'zego-express-engine-webrtc';

class MultiUserVideoCall {
    constructor() {
        this.engine = null;
        this.isConnected = false;
        this.roomID = null;
        this.userID = null;
        this.userName = null;
        this.localStream = null;
        this.remoteStreams = new Map(); // streamID -> stream data
        this.participants = new Map(); // userID -> participant data
        this.isMicOn = true;
        this.isVideoOn = true;
        this.isScreenSharing = false;
        this.eventListeners = {};
        this.appID = 1921148917; // Your ZegoCloud App ID
        this.server = 'wss://webliveroom1921148917-api.coolzcloud.com/ws';
    }

    // Initialize the ZegoCloud engine
    async initialize(appID = null, server = null) {
        try {

            const finalAppID = appID || this.appID;
            const finalServer = server || this.server;

            // this.engine = new ZegoExpressEngine.ZegoExpressEngine(finalAppID, finalServer);

            // Configure logging to reduce console spam
            try {
                this.engine.setLogConfig({
                    logLevel: 'ERROR',
                    remoteLogLevel: 'NONE',
                    logURL: ''
                });
            } catch (error) {
            }

            // Set up event listeners
            this.setupEventListeners();

            return { success: true };
        } catch (error) {
            console.error('Failed to initialize ZegoCloud engine:', error);
            return { success: false, error };
        }
    }

    // Set up all event listeners for multi-user functionality
    setupEventListeners() {
        // Room state updates
        this.engine.on('roomStateUpdate', (roomID, state, errorCode, extendedData) => {

            if (state === 'CONNECTED') {
                this.isConnected = true;
                this.triggerEvent('roomConnected', { roomID });
            } else if (state === 'DISCONNECTED') {
                this.isConnected = false;
                this.triggerEvent('roomDisconnected', { roomID });
            } else if (state === 'CONNECTING') {
                this.triggerEvent('roomConnecting', { roomID });
            }
        });

        // User updates (people joining/leaving)
        this.engine.on('roomUserUpdate', (roomID, updateType, userList) => {

            if (updateType === 'ADD') {
                // New users joined the room
                userList.forEach(user => {
                    this.participants.set(user.userID, {
                        userID: user.userID,
                        userName: user.userName || user.userID,
                        isMicOn: true,
                        isVideoOn: true,
                        joinedAt: Date.now()
                    });
                });

                this.triggerEvent('participantsUpdate', {
                    type: 'ADD',
                    participants: userList,
                    allParticipants: Array.from(this.participants.values())
                });

            } else if (updateType === 'DELETE') {
                // Users left the room
                userList.forEach(user => {
                    this.participants.delete(user.userID);

                    // Stop playing their streams if any
                    const streamID = `stream_${user.userID}`;
                    if (this.remoteStreams.has(streamID)) {
                        this.stopPlayingStream(streamID);
                    }
                });

                this.triggerEvent('participantsUpdate', {
                    type: 'DELETE',
                    participants: userList,
                    allParticipants: Array.from(this.participants.values())
                });
            }
        });

        // Stream updates (video/audio streams being published/stopped)
        this.engine.on('roomStreamUpdate', (roomID, updateType, streamList) => {

            if (updateType === 'ADD') {
                // New streams are being published
                streamList.forEach(stream => {
                    // Only play streams that are not from the current user
                    if (stream.userID !== this.userID) {
                        this.startPlayingStream(stream.streamID, stream.userID);
                    } else {
                    }
                });

                this.triggerEvent('streamsUpdate', {
                    type: 'ADD',
                    streams: streamList
                });

            } else if (updateType === 'DELETE') {
                // Streams have stopped
                streamList.forEach(stream => {
                    this.stopPlayingStream(stream.streamID);
                });

                this.triggerEvent('streamsUpdate', {
                    type: 'DELETE',
                    streams: streamList
                });
            }
        });

        // Publisher state updates (local stream publishing status)
        this.engine.on('publisherStateUpdate', (streamID, state, errorCode, extendedData) => {

            this.triggerEvent('publisherStateUpdate', {
                streamID,
                state,
                errorCode,
                extendedData
            });
        });

        // Player state updates (remote stream playing status)
        this.engine.on('playerStateUpdate', (streamID, state, errorCode, extendedData) => {

            this.triggerEvent('playerStateUpdate', {
                streamID,
                state,
                errorCode,
                extendedData
            });
        });
    }

    // Join a room with proper user update notifications
    async joinRoom(roomID, userID, userName, token = '') {
        try {

            this.roomID = roomID;
            this.userID = userID;
            this.userName = userName;

            // Add current user to participants
            this.participants.set(userID, {
                userID,
                userName,
                isMicOn: this.isMicOn,
                isVideoOn: this.isVideoOn,
                joinedAt: Date.now(),
                isCurrentUser: true
            });

            // Join room with userUpdate enabled for multi-user notifications
            const loginResult = await this.engine.loginRoom(
                roomID,
                token,
                {
                    userID: userID,
                    userName: userName
                },
                {
                    userUpdate: true // Enable user update notifications
                }
            );


            if (loginResult === true) {
                // Start publishing local stream
                await this.startPublishingLocalStream();

                this.triggerEvent('roomJoined', {
                    roomID,
                    userID,
                    userName,
                    participants: Array.from(this.participants.values())
                });

                return { success: true };
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Failed to join room:', error);
            return { success: false, error };
        }
    }

    // Start publishing local stream
    async startPublishingLocalStream() {
        try {

            // Get user media permissions first
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Create ZegoCloud stream
            const stream = await this.engine.createStream({
                camera: { audio: true, video: true }
            });

            this.localStream = stream;

            // Start publishing with a unique stream ID
            const streamID = `stream_${this.userID}_${Date.now()}`;
            await this.engine.startPublishingStream(streamID, stream);


            this.triggerEvent('localStreamPublished', {
                streamID: streamID,
                stream: stream
            });

        } catch (error) {
            console.error('Failed to start publishing local stream:', error);
            throw error;
        }
    }

    // Start playing a remote stream
    async startPlayingStream(streamID, userID) {
        try {

            // Create a container for the remote video
            const container = document.createElement('div');
            container.className = 'remote-video-wrapper';
            container.id = `remote-${streamID}`;
            container.style.cssText = `
                position: relative;
                width: 300px;
                height: 225px;
                border-radius: 12px;
                overflow: hidden;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.2);
                margin: 10px;
            `;

            // Create a video element for this stream
            const videoElement = document.createElement('video');
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            `;

            // Add video element to container
            container.appendChild(videoElement);

            // Add container to the remote videos section
            const remoteVideosContainer = document.querySelector('.remote-videos');
            if (remoteVideosContainer) {
                remoteVideosContainer.appendChild(container);
            } else {
                console.warn('Remote videos container not found, adding to body');
                document.body.appendChild(container);
            }

            // Store stream data
            this.remoteStreams.set(streamID, {
                streamID,
                userID,
                videoElement,
                container,
                isPlaying: false
            });

            // Start playing the stream
            await this.engine.startPlayingStream(streamID, {
                container: videoElement
            });

            // Update stream status
            const streamData = this.remoteStreams.get(streamID);
            streamData.isPlaying = true;
            this.remoteStreams.set(streamID, streamData);


            this.triggerEvent('remoteStreamStarted', {
                streamID,
                userID,
                videoElement,
                container
            });

        } catch (error) {
            console.error('Failed to start playing remote stream:', error);
            // Remove from streams if failed
            this.remoteStreams.delete(streamID);
        }
    }

    // Stop playing a remote stream
    stopPlayingStream(streamID) {
        try {

            this.engine.stopPlayingStream(streamID);

            // Clean up stream data
            const streamData = this.remoteStreams.get(streamID);
            if (streamData) {
                if (streamData.container) {
                    streamData.container.remove();
                } else if (streamData.videoElement) {
                    streamData.videoElement.remove();
                }
            }

            this.remoteStreams.delete(streamID);


            this.triggerEvent('remoteStreamStopped', {
                streamID
            });

        } catch (error) {
            console.error('Failed to stop playing remote stream:', error);
        }
    }

    // Toggle microphone
    async toggleMicrophone() {
        try {
            if (this.localStream) {
                const audioTracks = this.localStream.getAudioTracks();
                audioTracks.forEach(track => {
                    track.enabled = !this.isMicOn;
                });

                this.isMicOn = !this.isMicOn;

                // Update current user's mic status
                const currentUser = this.participants.get(this.userID);
                if (currentUser) {
                    currentUser.isMicOn = this.isMicOn;
                    this.participants.set(this.userID, currentUser);
                }


                this.triggerEvent('micStatusChanged', {
                    userID: this.userID,
                    isMicOn: this.isMicOn
                });

                return { success: true, isMicOn: this.isMicOn };
            }
        } catch (error) {
            console.error('Failed to toggle microphone:', error);
            return { success: false, error };
        }
    }

    // Toggle video
    async toggleVideo() {
        try {
            if (this.localStream) {
                const videoTracks = this.localStream.getVideoTracks();
                videoTracks.forEach(track => {
                    track.enabled = !this.isVideoOn;
                });

                this.isVideoOn = !this.isVideoOn;

                // Update current user's video status
                const currentUser = this.participants.get(this.userID);
                if (currentUser) {
                    currentUser.isVideoOn = this.isVideoOn;
                    this.participants.set(this.userID, currentUser);
                }


                this.triggerEvent('videoStatusChanged', {
                    userID: this.userID,
                    isVideoOn: this.isVideoOn
                });

                return { success: true, isVideoOn: this.isVideoOn };
            }
        } catch (error) {
            console.error('Failed to toggle video:', error);
            return { success: false, error };
        }
    }

    // Toggle screen sharing
    async toggleScreenShare() {
        try {
            if (!this.isScreenSharing) {
                // Start screen sharing using ZEGO's createZegoStream method
                const screenStream = await this.engine.createZegoStream({
                    screen: {
                        videoBitrate: 1500,
                        audio: true, // Include audio from screen
                        video: {
                            quality: 4,
                            frameRate: 15,
                            width: window.screen.width,
                            height: window.screen.height
                        }
                    },
                });

                if (!screenStream) {
                    throw new Error('Failed to create screen stream');
                }


                // Stop current local stream publishing
                if (this.localStream) {
                    await this.engine.stopPublishingStream(this.localStream.streamID);
                }

                // Start publishing screen stream
                const publishResult = await this.engine.startPublishingStream(screenStream.streamID, screenStream);

                if (publishResult === 0) {
                    this.localStream = screenStream;
                    this.isScreenSharing = true;


                    this.triggerEvent('screenShareStarted', {
                        stream: screenStream,
                        streamID: screenStream.streamID
                    });
                } else {
                    throw new Error(`Failed to publish screen stream: ${publishResult}`);
                }

            } else {
                // Stop screen sharing and restore camera
                if (this.localStream) {
                    await this.engine.stopPublishingStream(this.localStream.streamID);
                }

                // Create new camera stream
                const cameraStream = await this.engine.createZegoStream({
                    camera: {
                        video: {
                            quality: 3,
                            frameRate: 15,
                            width: 640,
                            height: 480
                        },
                        audio: true
                    }
                });

                if (cameraStream) {
                    // Start publishing camera stream
                    const publishResult = await this.engine.startPublishingStream(cameraStream.streamID, cameraStream);

                    if (publishResult === 0) {
                        this.localStream = cameraStream;
                        this.isScreenSharing = false;


                        this.triggerEvent('screenShareStopped', {
                            stream: cameraStream,
                            streamID: cameraStream.streamID
                        });
                    } else {
                        throw new Error(`Failed to publish camera stream: ${publishResult}`);
                    }
                } else {
                    throw new Error('Failed to create camera stream');
                }
            }

            return { success: true, isScreenSharing: this.isScreenSharing };
        } catch (error) {
            console.error('Failed to toggle screen sharing:', error);
            return { success: false, error: error.message };
        }
    }

    // Leave room
    async leaveRoom() {
        try {

            // Stop publishing local stream
            if (this.localStream) {
                await this.engine.stopPublishingStream('local-stream');
                this.localStream = null;
            }

            // Stop all remote streams
            for (const [streamID] of this.remoteStreams) {
                this.stopPlayingStream(streamID);
            }

            // Logout from room
            await this.engine.logoutRoom();

            // Reset state
            this.isConnected = false;
            this.roomID = null;
            this.userID = null;
            this.userName = null;
            this.participants.clear();
            this.remoteStreams.clear();
            this.isMicOn = true;
            this.isVideoOn = true;
            this.isScreenSharing = false;

            this.triggerEvent('roomLeft');

            return { success: true };
        } catch (error) {
            console.error('Failed to leave room:', error);
            return { success: false, error };
        }
    }

    // Get all participants
    getAllParticipants() {
        return Array.from(this.participants.values());
    }

    // Get current user
    getCurrentUser() {
        return this.participants.get(this.userID);
    }

    // Get remote streams
    getRemoteStreams() {
        return Array.from(this.remoteStreams.values());
    }

    // Get room info
    getRoomInfo() {
        return {
            roomID: this.roomID,
            userID: this.userID,
            userName: this.userName,
            isConnected: this.isConnected,
            participantCount: this.participants.size,
            streamCount: this.remoteStreams.size
        };
    }

    // Event handling
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    triggerEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event callback:', error);
                }
            });
        }
    }

    // Cleanup
    destroy() {
        try {
            if (this.engine) {
                this.engine.logoutRoom();
                // Note: destroyEngine might not be available in this version
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

// Create a global instance
export const multiUserVideoCall = new MultiUserVideoCall(); 