// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, Link, useParams } from "react-router-dom";
// import { Video, Users, ArrowLeft, Settings, Mic, Video as VideoIcon } from "lucide-react";
// import "./JoinRoom.css";

// const JoinRoom = () => {
//     const { roomID: urlRoomID } = useParams(); // Get roomID from URL parameters
//     const [roomID, setRoomID] = useState(urlRoomID || ""); // Use URL roomID if available
//     const [userName, setUserName] = useState("");
//     const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//     const [isVideoEnabled, setIsVideoEnabled] = useState(true);
//     const [isLoading, setIsLoading] = useState(false);
//     const [localStream, setLocalStream] = useState(null);
//     const [isPreviewLoading, setIsPreviewLoading] = useState(true);
//     const [isInvited, setIsInvited] = useState(false);
//     const navigate = useNavigate();

//     const videoPreviewRef = useRef(null);

//     // Initialize video preview
//     useEffect(() => {
//         initializeVideoPreview();

//         return () => {
//             // Cleanup stream when component unmounts
//             if (localStream) {
//                 localStream.getTracks().forEach(track => track.stop());
//             }
//         };
//     }, []);

//     // Update roomID when URL parameter changes
//     useEffect(() => {
//         if (urlRoomID) {
//             setRoomID(urlRoomID);
//             setIsInvited(true); // Mark as invited when roomID comes from URL
//         }
//     }, [urlRoomID]);

//     const initializeVideoPreview = async () => {
//         try {
//             setIsPreviewLoading(true);

//             // Request camera and microphone permissions
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true
//             });

//             setLocalStream(stream);

//             // Display the stream in the video element
//             if (videoPreviewRef.current) {
//                 videoPreviewRef.current.srcObject = stream;
//             }

//             setIsPreviewLoading(false);
//         } catch (error) {
//             console.error('Failed to access camera/microphone:', error);
//             setIsPreviewLoading(false);
//             // Show a message to the user about camera access
//         }
//     };

//     const toggleAudio = async () => {
//         if (localStream) {
//             const audioTracks = localStream.getAudioTracks();
//             audioTracks.forEach(track => {
//                 track.enabled = !isAudioEnabled;
//             });
//             setIsAudioEnabled(!isAudioEnabled);
//         }
//     };

//     const toggleVideo = async () => {
//         if (localStream) {
//             const videoTracks = localStream.getVideoTracks();
//             videoTracks.forEach(track => {
//                 track.enabled = !isVideoEnabled;
//             });
//             setIsVideoEnabled(!isVideoEnabled);
//         }
//     };

//     const handleJoin = async () => {
//         if (!roomID.trim() || !userName.trim()) {
//             alert("Please enter both room ID and your name");
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // Simulate a brief loading time
//             await new Promise(resolve => setTimeout(resolve, 1000));

//             // Navigate to the room
//             navigate(`/video-call/room/${roomID.trim()}/${userName.trim()}`);
//         } catch (error) {
//             console.error('Failed to join room:', error);
//             alert('Failed to join room. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const generateRoomID = () => {
//         const id = Math.random().toString(36).substring(2, 8).toUpperCase();
//         setRoomID(id);
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter') {
//             handleJoin();
//         }
//     };

//     return (
//         <div className="join-room-container">
//             <div className="join-room-header">
//                 <Link to="/" className="back-btn">
//                     <ArrowLeft size={20} />
//                     Back to Home
//                 </Link>
//                 <div className="header-title">
//                     <Video size={32} />
//                     <h1>Join Video Call</h1>
//                 </div>
//             </div>

//             <div className="join-room-content">
//                 <div className="join-form-container">
//                     <div className="form-header">
//                         <h2>Enter Room Details</h2>
//                         {isInvited ? (
//                             <div className="invite-welcome">
//                                 <p>🎉 You've been invited to join a video call!</p>
//                                 <p className="room-info">Room ID: <strong>{roomID}</strong></p>
//                             </div>
//                         ) : (
//                             <p>Join an existing room or create a new one to start your video call</p>
//                         )}
//                     </div>

//                     <div className="join-form">
//                         <div className="form-group">
//                             <label htmlFor="roomID">Room ID</label>
//                             <div className="input-group">
//                                 <input
//                                     id="roomID"
//                                     type="text"
//                                     placeholder="Enter room ID (e.g., ABC123)"
//                                     value={roomID}
//                                     onChange={(e) => setRoomID(e.target.value)}
//                                     onKeyPress={handleKeyPress}
//                                     className="form-input"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={generateRoomID}
//                                     className="generate-btn"
//                                     title="Generate random room ID"
//                                 >
//                                     Generate
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label htmlFor="userName">Your Name</label>
//                             <input
//                                 id="userName"
//                                 type="text"
//                                 placeholder="Enter your name"
//                                 value={userName}
//                                 onChange={(e) => setUserName(e.target.value)}
//                                 onKeyPress={handleKeyPress}
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="device-settings">
//                             <h3>Device Settings</h3>
//                             <div className="device-controls">
//                                 <button
//                                     className={`device-btn ${isAudioEnabled ? 'enabled' : 'disabled'}`}
//                                     onClick={toggleAudio}
//                                 >
//                                     <Mic size={20} />
//                                     <span>Microphone</span>
//                                     <div className={`status-indicator ${isAudioEnabled ? 'on' : 'off'}`}></div>
//                                 </button>

//                                 <button
//                                     className={`device-btn ${isVideoEnabled ? 'enabled' : 'disabled'}`}
//                                     onClick={toggleVideo}
//                                 >
//                                     <VideoIcon size={20} />
//                                     <span>Camera</span>
//                                     <div className={`status-indicator ${isVideoEnabled ? 'on' : 'off'}`}></div>
//                                 </button>
//                             </div>
//                         </div>

//                         <button
//                             onClick={handleJoin}
//                             disabled={!roomID.trim() || !userName.trim() || isLoading}
//                             className="join-btn"
//                         >
//                             {isLoading ? (
//                                 <>
//                                     <div className="spinner"></div>
//                                     Joining Room...
//                                 </>
//                             ) : (
//                                 <>
//                                     <Users size={20} />
//                                     Join Room
//                                 </>
//                             )}
//                         </button>
//                     </div>

//                     <div className="join-info">
//                         <div className="info-card">
//                             <h4>How it works</h4>
//                             <ul>
//                                 <li>Enter a room ID or generate a random one</li>
//                                 <li>Share the room ID with others to invite them</li>
//                                 <li>Click "Join Room" to start your video call</li>
//                                 <li>Use the question bank and feedback features during calls</li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="join-preview">
//                     <div className="preview-container">
//                         <div className="video-preview">
//                             {isPreviewLoading ? (
//                                 <div className="video-loading">
//                                     <div className="spinner"></div>
//                                     <p>Loading camera...</p>
//                                 </div>
//                             ) : (
//                                 <>
//                                     <video
//                                         ref={videoPreviewRef}
//                                         autoPlay
//                                         muted
//                                         playsInline
//                                         className="preview-video"
//                                     />
//                                     {!isVideoEnabled && (
//                                         <div className="camera-off-overlay">
//                                             <VideoIcon size={32} />
//                                             <span>Camera Off</span>
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>

//                         <div className="preview-controls">
//                             <div className="control-item">
//                                 <Mic size={16} />
//                                 <span>Microphone: {isAudioEnabled ? 'On' : 'Off'}</span>
//                             </div>
//                             <div className="control-item">
//                                 <VideoIcon size={16} />
//                                 <span>Camera: {isVideoEnabled ? 'On' : 'Off'}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default JoinRoom;