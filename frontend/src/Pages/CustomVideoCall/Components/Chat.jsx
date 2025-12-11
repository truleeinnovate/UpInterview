// import React, { useState, useRef, useEffect } from 'react';
// import { X, Send } from 'lucide-react';
// import './Chat.css';

// const Chat = ({ onClose, userName, messages = [], onSendMessage }) => {
//     const [newMessage, setNewMessage] = useState('');
//     const chatContainerRef = useRef(null);

//     useEffect(() => {
//         // Scroll to bottom when new messages arrive
//         if (chatContainerRef.current) {
//             chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//         }
//     }, [messages]);

//     const handleSendMessage = () => {
//         if (newMessage.trim() && onSendMessage) {
//             onSendMessage(newMessage);
//             setNewMessage('');
//         }
//     };

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSendMessage();
//         }
//     };

//     return (
//         <div className="chat-sidebar">
//             <div className="sidebar-header">
//                 <h3>Chat</h3>
//                 <button onClick={onClose} className="close-btn">
//                     <X size={20} />
//                 </button>
//             </div>

//             <div className="chat-messages" ref={chatContainerRef}>
//                 {messages.length === 0 ? (
//                     <div className="no-messages">
//                         <p>No messages yet. Start the conversation!</p>
//                     </div>
//                 ) : (
//                     messages.map((message) => (
//                         <div
//                             key={message.id}
//                             className={`chat-message ${message.sender === userName ? 'own' : 'other'}`}
//                         >
//                             <div className="message-sender">{message.sender}</div>
//                             <div className="message-text">{message.text}</div>
//                             <div className="message-time">{message.timestamp}</div>
//                         </div>
//                     ))
//                 )}
//             </div>

//             <div className="chat-input">
//                 <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Type a message..."
//                     maxLength={500}
//                 />
//                 <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
//                     <Send size={16} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chat; 