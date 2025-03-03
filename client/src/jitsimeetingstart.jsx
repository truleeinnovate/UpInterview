import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Feedbakfrom from './Pages/Dashboard-Part/Tabs/StartInterview-Tab/Feedbakfrom';
import Call_InterviewQA from './Pages/Dashboard-Part/Tabs/StartInterview-Tab/Call_InterviewQA';

import { ReactComponent as RiFeedbackLine } from '../src/icons/RiFeedbackLine.svg';
import { ReactComponent as BsQuestionSquare } from '../src/icons/BsQuestionSquare.svg';


const JitsiMeeting = ({ roomName, displayName, initialJwtToken, onMeetingEnd }) => {
  const jitsiContainerRef = useRef(null);
  const navigate = useNavigate();
  const [jwtToken, setJwtToken] = useState(initialJwtToken);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInterviewQA, setShowInterviewQA] = useState(false);
  const [admin, setAdmin] = useState(true);
  const [meetingStarted, setMeetingStarted] = useState(false); // New state variable

 

  useEffect(() => {
    const loadJitsiScript = () => {
      const script = document.createElement('script');
      script.src = 'https://8x8.vc/vpaas-magic-cookie-019af5b8e9c74f42a44947ee0c08572d/external_api.js';
      script.async = true;
      script.onload = initializeJitsi;
      script.onerror = () => {
        console.error('Failed to load Jitsi script');
      };
      document.body.appendChild(script);
    };

    const initializeJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error('JitsiMeetExternalAPI not available');
        return;
      }

      const domain = '8x8.vc';
      const options = {
        roomName: `vpaas-magic-cookie-019af5b8e9c74f42a44947ee0c08572d/${roomName}`,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName,
        },
        jwt: jwtToken,
        configOverwrite: {
          // Add your custom config options here
        },
        interfaceConfigOverwrite: {
          // Add your custom interface config options here
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener('readyToClose', () => {
        if (onMeetingEnd) {
          onMeetingEnd();
        }
        navigate('/home');
      });

      api.addEventListener('participantRoleChanged', async (event) => {
        if (event.role === 'moderator') {
          const newToken = await refreshJwtToken();
          api.executeCommand('token', newToken);
        }
      });

      // Add more event listeners as needed
      api.addEventListener('participantJoined', (event) => {
        console.log('Participant joined:', event);
      });

      api.addEventListener('participantLeft', (event) => {
        console.log('Participant left:', event);
      });

      api.addEventListener('videoConferenceJoined', (event) => {
        console.log('Video conference joined:', event);
        setMeetingStarted(true); // Set meeting started to true
      });

      api.addEventListener('videoConferenceLeft', (event) => {
        console.log('Video conference left:', event);
        setMeetingStarted(false); // Set meeting started to false
      });
    };

    const refreshJwtToken = async () => {
      try {
        const response = await axios.get('/generate-token');
        const newToken = response.data.token;
        setJwtToken(newToken);
        return newToken;
      } catch (error) {
        console.error('Failed to refresh JWT token', error);
        return null;
      }
    };

    loadJitsiScript();

    return () => {
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = '';
      }
    };
  }, [roomName, displayName, jwtToken, onMeetingEnd, navigate]);

  const toggleFeedback = () => {
    setShowFeedback(!showFeedback);
    setShowInterviewQA(false);
  };

  const toggleInterviewQuestions = () => {
    setShowInterviewQA(!showInterviewQA);
    setShowFeedback(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {meetingStarted && (
        <nav className={`p-1 text-white flex justify-end ${showFeedback || showInterviewQA ? 'mr-[40%]' : ''}`}>
          {admin && (
            <>
              <button onClick={toggleInterviewQuestions} className="flex flex-col items-center mx-2">
                <BsQuestionSquare className="w-5 h-5 mb-1 text-black" />
                <span className="text-center text-black" style={{ fontSize: '10px' }}>Interview <br />Questions</span>
              </button>
              <button onClick={toggleFeedback} className="flex flex-col items-center mx-2">
                <RiFeedbackLine className="w-5 h-5 mb-1 text-black" />
                <span className="text-center text-black" style={{ fontSize: '10px' }}>Feedback</span>
              </button>


            </>
          )}
        </nav>
      )}
      <div className="flex flex-1">
        <div ref={jitsiContainerRef} className={`flex-1 ${showFeedback || showInterviewQA ? 'flex-[0.6]' : 'flex-1'} h-full`} />
        {/* {showFeedback && <Feedbakfrom toggleFeedback={toggleFeedback} />} */}
        {/* {showInterviewQA && <Call_InterviewQA toggleInterviewQuestions={toggleInterviewQuestions} />} */}
      </div>
    </div>
  );
};

export default JitsiMeeting;