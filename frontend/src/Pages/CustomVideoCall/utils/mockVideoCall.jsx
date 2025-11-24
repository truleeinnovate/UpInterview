// Mock Video Call System for testing without ZegoCloud
// Shared room storage using localStorage for cross-tab communication

export class MockVideoCall {
    constructor() {
        this.isConnected = false;
        this.localStream = null;
        this.remoteStreams = {};
        this.participants = [];
        this.isMicOn = true;
        this.isVideoOn = true;
        this.isScreenSharing = false;
        this.roomID = null;
        this.currentUser = null;
        this.eventListeners = {};
        this.pollingInterval = null;
    }

    // Get room data from localStorage
    getRoomData(roomID) {
        try {
            const data = localStorage.getItem(`mockRoom_${roomID}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    // Save room data to localStorage
    saveRoomData(roomID, data) {
        try {
            localStorage.setItem(`mockRoom_${roomID}`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save room data:', error);
        }
    }

    // Remove room data from localStorage
    removeRoomData(roomID) {
        try {
            localStorage.removeItem(`mockRoom_${roomID}`);
        } catch (error) {
            console.error('Failed to remove room data:', error);
        }
    }

    // Simulate connecting to a room
    async connectToRoom(roomID, userID, userName) {

        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.isConnected = true;
        this.roomID = roomID;
        this.currentUser = { userID, userName, isMicOn: true, isVideoOn: true };

        // Get or create room from localStorage
        let roomData = this.getRoomData(roomID);
        if (!roomData) {
            roomData = {
                participants: {},
                lastUpdated: Date.now()
            };
        }

        // Add current user to room
        roomData.participants[userID] = {
            userID,
            userName,
            isMicOn: true,
            isVideoOn: true,
            joinedAt: Date.now()
        };
        roomData.lastUpdated = Date.now();

        // Save updated room data
        this.saveRoomData(roomID, roomData);

        // Simulate getting local media stream
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Store references to tracks for proper management
            this.videoTrack = this.localStream.getVideoTracks()[0];
            this.audioTrack = this.localStream.getAudioTracks()[0];

        } catch (error) {
            // Create a mock stream for testing
            this.localStream = this.createMockStream();
        }

        // Update local participants list with all room participants
        this.participants = Object.values(roomData.participants);

        // Set up remote streams for other participants (mock streams)
        this.remoteStreams = {};
        Object.keys(roomData.participants).forEach(participantUserID => {
            if (participantUserID !== userID) {
                // Create a mock stream for each remote participant
                const participant = roomData.participants[participantUserID];
                this.remoteStreams[participantUserID] = this.createMockStream(participant.userName);
            }
        });

        // Start polling for room updates
        this.startPolling();

        // Trigger participant update event
        this.triggerEvent('participantsUpdate', this.participants);


        return { success: true, roomID, userID };
    }

    // Create a mock video stream for testing
    createMockStream(userName = 'Remote User') {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some visual elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 50, 80, 0, 2 * Math.PI);
        ctx.fill();

        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(userName, canvas.width / 2, canvas.height / 2 + 20);

        ctx.font = '24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Mock Video Stream', canvas.width / 2, canvas.height / 2 + 60);

        return canvas.captureStream();
    }

    // Start polling for room updates
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(() => {
            if (this.isConnected && this.roomID) {
                this.checkRoomUpdates();
            }
        }, 1000); // Check every second
    }

    // Check for room updates
    checkRoomUpdates() {
        const roomData = this.getRoomData(this.roomID);
        if (roomData) {
            const currentParticipants = Object.values(roomData.participants);
            const currentParticipantCount = currentParticipants.length;
            const localParticipantCount = this.participants.length;

            // Check if participants have changed
            if (currentParticipantCount !== localParticipantCount) {

                // Update local participants
                this.participants = currentParticipants;

                // Update remote streams
                this.remoteStreams = {};
                Object.keys(roomData.participants).forEach(participantUserID => {
                    if (participantUserID !== this.currentUser?.userID) {
                        const participant = roomData.participants[participantUserID];
                        this.remoteStreams[participantUserID] = this.createMockStream(participant.userName);
                    }
                });

                // Trigger update event
                this.triggerEvent('participantsUpdate', this.participants);
            }
        }
    }

    // Simulate disconnecting
    async disconnect() {

        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        // Properly stop all media tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
        }

        // Stop remote streams
        Object.values(this.remoteStreams).forEach(stream => {
            if (stream && stream.getTracks) {
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
        });

        if (this.roomID && this.currentUser) {
            // Remove user from room data
            const roomData = this.getRoomData(this.roomID);
            if (roomData && roomData.participants[this.currentUser.userID]) {
                delete roomData.participants[this.currentUser.userID];
                roomData.lastUpdated = Date.now();

                // If room is empty, remove it
                if (Object.keys(roomData.participants).length === 0) {
                    this.removeRoomData(this.roomID);
                } else {
                    this.saveRoomData(this.roomID, roomData);
                }
            }
        }

        this.isConnected = false;
        this.localStream = null;
        this.remoteStreams = {};
        this.participants = [];
        this.roomID = null;
        this.currentUser = null;

        return { success: true };
    }

    // Simulate toggling microphone
    async toggleMic() {
        this.isMicOn = !this.isMicOn;

        // Properly handle audio tracks
        if (this.audioTrack) {
            if (this.isMicOn) {
                // Enable audio track
                this.audioTrack.enabled = true;
            } else {
                // Disable audio track
                this.audioTrack.enabled = false;
            }
        }

        // Update current user's mic status
        if (this.currentUser && this.roomID) {
            this.currentUser.isMicOn = this.isMicOn;
            const roomData = this.getRoomData(this.roomID);
            if (roomData && roomData.participants[this.currentUser.userID]) {
                roomData.participants[this.currentUser.userID].isMicOn = this.isMicOn;
                roomData.lastUpdated = Date.now();
                this.saveRoomData(this.roomID, roomData);
            }
        }

        // Trigger mic status update event
        this.triggerEvent('micStatusUpdate', {
            userID: this.currentUser?.userID,
            isMicOn: this.isMicOn
        });

        return { success: true, isMicOn: this.isMicOn };
    }

    // Simulate toggling video
    async toggleVideo() {
        this.isVideoOn = !this.isVideoOn;

        // Properly handle camera tracks
        if (this.videoTrack) {
            if (this.isVideoOn) {
                // Enable video track
                this.videoTrack.enabled = true;
            } else {
                // Disable video track (this stops the camera light)
                this.videoTrack.enabled = false;
            }
        }

        // Update current user's video status
        if (this.currentUser && this.roomID) {
            this.currentUser.isVideoOn = this.isVideoOn;
            const roomData = this.getRoomData(this.roomID);
            if (roomData && roomData.participants[this.currentUser.userID]) {
                roomData.participants[this.currentUser.userID].isVideoOn = this.isVideoOn;
                roomData.lastUpdated = Date.now();
                this.saveRoomData(this.roomID, roomData);
            }
        }

        // Trigger video status update event
        this.triggerEvent('videoStatusUpdate', {
            userID: this.currentUser?.userID,
            isVideoOn: this.isVideoOn
        });

        return { success: true, isVideoOn: this.isVideoOn };
    }

    // Simulate screen sharing
    async toggleScreenShare() {
        try {
            if (!this.isScreenSharing) {
                // Start screen sharing using browser's getDisplayMedia
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always",
                        displaySurface: "monitor"
                    },
                    audio: true
                });

                // Store the screen stream
                this.screenStream = screenStream;
                this.isScreenSharing = true;

                // Update current user's status in room
                if (this.currentUser && this.roomID) {
                    const roomData = this.getRoomData(this.roomID);
                    if (roomData && roomData.participants[this.currentUser.userID]) {
                        roomData.participants[this.currentUser.userID].isScreenSharing = true;
                        roomData.lastUpdated = Date.now();
                        this.saveRoomData(this.roomID, roomData);
                    }
                }

                // Listen for screen share stop
                screenStream.getVideoTracks()[0].onended = () => {
                    this.stopScreenShare();
                };

                this.triggerEvent('screenShareStarted', { stream: screenStream });

            } else {
                await this.stopScreenShare();
            }

            return { success: true, isScreenSharing: this.isScreenSharing };
        } catch (error) {
            console.error('Mock: Failed to toggle screen sharing:', error);
            return { success: false, error: error.message };
        }
    }

    async stopScreenShare() {
        if (this.screenStream) {
            // Stop all tracks in the screen stream
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        this.isScreenSharing = false;

        // Update current user's status in room
        if (this.currentUser && this.roomID) {
            const roomData = this.getRoomData(this.roomID);
            if (roomData && roomData.participants[this.currentUser.userID]) {
                roomData.participants[this.currentUser.userID].isScreenSharing = false;
                roomData.lastUpdated = Date.now();
                this.saveRoomData(this.roomID, roomData);
            }
        }

        this.triggerEvent('screenShareStopped');
    }

    // Get current state
    getState() {
        return {
            isConnected: this.isConnected,
            localStream: this.localStream,
            remoteStreams: this.remoteStreams,
            participants: this.participants,
            isMicOn: this.isMicOn,
            isVideoOn: this.isVideoOn,
            isScreenSharing: this.isScreenSharing
        };
    }

    // Simulate a new participant joining
    async addParticipant(userID, userName) {

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!this.roomID) {
            return { success: false, error: 'Not connected to a room' };
        }

        const roomData = this.getRoomData(this.roomID);
        if (!roomData) {
            return { success: false, error: 'Room not found' };
        }

        // Add new participant to room
        const newParticipant = {
            userID,
            userName,
            isMicOn: true,
            isVideoOn: true,
            joinedAt: Date.now()
        };

        roomData.participants[userID] = newParticipant;
        roomData.lastUpdated = Date.now();
        this.saveRoomData(this.roomID, roomData);

        // Update local participants list
        this.participants = Object.values(roomData.participants);
        this.remoteStreams[userID] = this.createMockStream(userName);

        // Trigger participant joined event
        this.triggerEvent('participantJoined', newParticipant);
        this.triggerEvent('participantsUpdate', this.participants);

        return { success: true, participant: newParticipant };
    }

    // Simulate a participant leaving
    async removeParticipant(userID) {

        if (!this.roomID) {
            return { success: false, error: 'Not connected to a room' };
        }

        const roomData = this.getRoomData(this.roomID);
        if (roomData && roomData.participants[userID]) {
            // Remove participant from room data
            delete roomData.participants[userID];
            roomData.lastUpdated = Date.now();
            this.saveRoomData(this.roomID, roomData);

            // Update local participants list
            this.participants = Object.values(roomData.participants);

            // Remove their stream
            if (this.remoteStreams[userID]) {
                delete this.remoteStreams[userID];
            }

            // Trigger participant left event
            this.triggerEvent('participantLeft', { userID });
            this.triggerEvent('participantsUpdate', this.participants);

        }

        return { success: true };
    }

    // Event handling methods
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

    // Get all participants in the room
    getAllParticipants() {
        return this.participants;
    }

    // Get participant by ID
    getParticipant(userID) {
        return this.participants.find(p => p.userID === userID);
    }

    // Update participant status
    updateParticipantStatus(userID, status) {
        const participant = this.roomParticipants.get(userID);
        if (participant) {
            Object.assign(participant, status);
            this.triggerEvent('participantStatusUpdate', { userID, ...status });
        }
    }
}

// Create a global mock instance
export const mockVideoCall = new MockVideoCall(); 