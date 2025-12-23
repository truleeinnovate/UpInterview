import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { formatAMPM, json_verify, nameTructed } from "../../utils/helper";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const ChatMessage = ({ senderId, senderName, text, timestamp }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const localSender = localParticipantId === senderId;
  const time = formatAMPM(new Date(timestamp));
  const name = localSender ? "You" : nameTructed(senderName, 15);

  return (
    <div
      className={`flex ${localSender ? "justify-end" : "justify-start"} px-3 py-0.5`}
    >
      <div
        className={`flex flex-col max-w-[85%] ${localSender ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-lg px-3 py-2 ${localSender ? 'bg-custom-blue/90 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          <p className="text-sm mb-0.5 break-words">
            {text}
          </p>
          <div className={`flex items-center justify-between text-[11px] ${localSender ? 'text-blue-100' : 'text-gray-500'}`}>
            <span className="font-medium">{name}</span>
            <span className="ml-2 opacity-80">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInput = ({ inputHeight }) => {
  const [message, setMessage] = useState("");
  const { publish } = usePubSub("CHAT");
  const input = useRef();

  const sendMessage = () => {
    const messageText = message.trim();
    if (messageText.length > 0) {
      try {
        publish(messageText, { persist: true });
        setMessage("");
        input.current?.focus();
      } catch (e) {
        console.error("Error sending message:", e);
      }
    }
  };

  return (
    <div className="w-full p-4 border-t border-gray-200">
      <div className="relative w-full">
        <input
          type="text"
          className="w-full p-3 pr-12 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
          placeholder="Type a message..."
          autoComplete="off"
          ref={input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-custom-blue hover:text-custom-blue/80 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ChatMessages = ({ listHeight }) => {
  const listRef = useRef();
  const messagesEndRef = useRef();
  const { messages } = usePubSub("CHAT");
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollTimeout = useRef();

  // Scroll to bottom when new messages arrive and auto-scroll is enabled
  useEffect(() => {
    if (isAutoScroll && messagesEndRef.current) {
      // Use setTimeout to ensure the DOM is updated
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    
    return () => clearTimeout(scrollTimeout.current);
  }, [messages, isAutoScroll]);

  // Handle scroll events to determine if we should disable auto-scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // If user scrolls up, disable auto-scroll
    if (distanceFromBottom > 50 && isAutoScroll) {
      setIsAutoScroll(false);
    } 
    // If user scrolls to bottom, re-enable auto-scroll
    else if (distanceFromBottom <= 50 && !isAutoScroll) {
      setIsAutoScroll(true);
    }
  }, [isAutoScroll]);
  
  // Scroll to bottom when clicking the scroll indicator
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsAutoScroll(true);
    }
  }, []);

  return (
    <div className="relative h-full">
      <div 
        ref={listRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-2"
        style={{ 
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          msOverflowStyle: 'none',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
    >
        {messages && messages.length > 0 ? (
          <>
            {messages.map((msg, i) => {
              const { senderId, senderName, message, timestamp } = msg;
              return (
                <ChatMessage
                  key={`chat_item_${i}`}
                  {...{ senderId, senderName, text: message, timestamp }}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No messages yet</p>
          </div>
        )}
      </div>
      
      {/* Scroll to bottom button */}
      {!isAutoScroll && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors"
          title="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export function ChatPanel({ panelHeight }) {
  const inputHeight = 80; // Height for input area
  const listHeight = panelHeight - inputHeight;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-hidden">
        <ChatMessages listHeight={listHeight} />
      </div>
      <div className="shrink-0">
        <ChatInput inputHeight={inputHeight} />
      </div>
    </div>
  );
}