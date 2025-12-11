class TranscriptionService {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.listeners = [];
    this.currentInterviewId = null;
    this.speakerName = '';
    this.speakerRole = '';
    this.interimTranscript = '';
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  initialize(interviewId, speakerName, speakerRole) {
    if (!this.isSupported()) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    this.currentInterviewId = interviewId;
    this.speakerName = speakerName;
    this.speakerRole = speakerRole;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isRecording = true;
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      if (this.isRecording) {
        console.log('Restarting speech recognition in 1 second...');
        setTimeout(() => {
          if (this.isRecording) {
            try {
              this.recognition.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
              this.isRecording = false;
            }
          }
        }, 1000);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.error('Microphone access not allowed');
        this.isRecording = false;
      } else if (event.error === 'network') {
        console.error('Network error in speech recognition');
        this.isRecording = false;
      } else if (event.error === 'aborted') {
        console.log('Speech recognition aborted');
      }
    };

    this.recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalText += transcript;

          const transcriptData = {
            interview_id: this.currentInterviewId,
            speaker_name: this.speakerName,
            speaker_role: this.speakerRole,
            text: transcript.trim(),
            confidence: confidence || 0.95,
            spoken_at: new Date().toISOString(),
          };

          this.notifyListeners(transcriptData, true);
        } else {
          interimText += transcript;
        }
      }

      if (interimText) {
        this.interimTranscript = interimText;
        this.notifyListeners({
          speaker_name: this.speakerName,
          speaker_role: this.speakerRole,
          text: interimText.trim(),
          isInterim: true,
        }, false);
      }
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(transcriptData, isFinal) {
    this.listeners.forEach(callback => {
      try {
        callback(transcriptData, isFinal);
      } catch (error) {
        console.error('Error in transcript listener:', error);
      }
    });
  }

  startRecording() {
    if (!this.recognition) {
      throw new Error('Transcription not initialized');
    }

    if (this.isRecording) {
      console.log('Recording already in progress');
      return;
    }

    try {
      this.recognition.start();
      console.log('Started recording and transcription');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }

  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.isRecording = false;
      this.recognition.stop();
      console.log('Stopped recording and transcription');
    }
  }

  dispose() {
    this.stopRecording();
    this.listeners = [];
    this.recognition = null;
  }
}

let transcriptionServiceInstance = null;

export function getTranscriptionService() {
  if (!transcriptionServiceInstance) {
    transcriptionServiceInstance = new TranscriptionService();
  }
  return transcriptionServiceInstance;
}
