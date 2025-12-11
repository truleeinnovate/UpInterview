import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

class ProctoringService {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
    this.videoElement = null;
    this.listeners = new Set();
    this.detectionInterval = null;
    this.lastDetectionTime = 0;
    this.detectionFrequency = 2000; // Check every 2 seconds (industry standard)
    this.currentSessionId = null; // Track current proctoring session

    // Tracking states
    this.faceDetectedCount = 0;
    this.noFaceCount = 0;
    this.multipleFacesCount = 0;
    this.lookingAwayCount = 0;
    this.tabSwitchCount = 0;
    this.isTabActive = true;
    this.monitoringActive = false; // Track if monitoring has started

    // Thresholds - adjusted for 2-second intervals
    this.NO_FACE_THRESHOLD = 3; // Alert after 3 consecutive no-face detections (6 seconds)
    this.MULTIPLE_FACES_THRESHOLD = 2; // Alert after 2 consecutive detections (4 seconds)
    this.LOOKING_AWAY_THRESHOLD = 3; // Alert after 3 detections (6 seconds)

    // Tab switch event handlers (to be added when monitoring starts)
    this.visibilityChangeHandler = null;
    this.windowBlurHandler = null;
  }

  async initialize(videoElement) {
    if (this.isInitialized) {
      console.log('Proctoring service already initialized');
      return;
    }

    console.log('Starting proctoring service initialization...', {
      hasVideoElement: !!videoElement,
      videoReadyState: videoElement?.readyState,
      videoSrcObject: !!videoElement?.srcObject
    });

    try {
      this.videoElement = videoElement;

      // Initialize TensorFlow.js backend
      console.log('Initializing TensorFlow.js...');
      await tf.ready();
      console.log('TensorFlow.js ready');

      // Create the face landmarks detector
      console.log('Creating face detector...');
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 3,
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;

      console.log('Proctoring service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize proctoring service:', error);
      throw error;
    }
  }

  setupTabSwitchDetection() {
    // Only set up if not already set up
    if (this.visibilityChangeHandler) {
      return;
    }

    // Detect when user switches tabs or windows
    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        this.isTabActive = false;
        this.tabSwitchCount++;

        // Get current URL
        const currentUrl = window.location.href;

        const incident = {
          type: 'TAB_SWITCH',
          message: 'Candidate switched tabs or windows',
          severity: 'high',
          timestamp: new Date().toISOString(),
          metadata: {
            url: currentUrl,
            action: 'tab_hidden'
          }
        };

        console.log('Tab switch detected with URL:', currentUrl);
        this.notifyListeners(incident);
      } else {
        this.isTabActive = true;
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);

    // Detect when window loses focus
    this.windowBlurHandler = () => {
      this.tabSwitchCount++;

      // Get current URL
      const currentUrl = window.location.href;

      this.notifyListeners({
        type: 'WINDOW_BLUR',
        message: 'Candidate switched to another window',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        metadata: {
          url: currentUrl,
          action: 'window_blur'
        }
      });
    };
    window.addEventListener('blur', this.windowBlurHandler);

    console.log('Tab switch detection enabled');
  }

  removeTabSwitchDetection() {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
    if (this.windowBlurHandler) {
      window.removeEventListener('blur', this.windowBlurHandler);
      this.windowBlurHandler = null;
    }
    console.log('Tab switch detection disabled');
  }

  startMonitoring() {
    if (!this.isInitialized) {
      console.error('Cannot start monitoring: service not initialized');
      return;
    }

    if (this.detectionInterval) {
      console.log('Monitoring already running');
      return;
    }

    // Set up tab switch detection when monitoring starts
    this.setupTabSwitchDetection();
    this.monitoringActive = true;

    this.detectionInterval = setInterval(() => {
      this.detectAndAnalyze();
    }, this.detectionFrequency);

    console.log('Proctoring monitoring started - checking every', this.detectionFrequency, 'ms');
  }

  stopMonitoring() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    // Remove tab switch detection when monitoring stops
    this.removeTabSwitchDetection();
    this.monitoringActive = false;

    console.log('Proctoring monitoring stopped');
  }

  async detectAndAnalyze() {
    if (!this.detector || !this.videoElement) {
      console.warn('Detector or video element missing');
      return;
    }

    if (this.videoElement.readyState < 2) {
      console.warn('Video not ready yet, readyState:', this.videoElement.readyState);
      return;
    }

    try {
      const faces = await this.detector.estimateFaces(this.videoElement, {
        flipHorizontal: false,
      });

      // Log face detection every 10 checks (every 10 seconds)
      this.detectionCount = (this.detectionCount || 0) + 1;
      if (this.detectionCount % 10 === 0) {
        console.log(`Face detection running - Found ${faces.length} face(s)`);
      }

      this.analyzeFaces(faces);
    } catch (error) {
      console.error('Proctoring detection error:', error);
    }
  }

  analyzeFaces(faces) {
    const now = Date.now();

    // No face detected
    if (faces.length === 0) {
      this.noFaceCount++;
      this.faceDetectedCount = 0;

      if (this.noFaceCount >= this.NO_FACE_THRESHOLD) {
        this.notifyListeners({
          type: 'NO_FACE',
          message: 'No face detected - candidate may have left',
          severity: 'high',
          timestamp: new Date().toISOString(),
        });
        this.noFaceCount = 0; // Reset to avoid spam
      }
      return;
    }

    // Multiple faces detected
    if (faces.length > 1) {
      this.multipleFacesCount++;

      if (this.multipleFacesCount >= this.MULTIPLE_FACES_THRESHOLD) {
        this.notifyListeners({
          type: 'MULTIPLE_FACES',
          message: `${faces.length} faces detected - possible external help`,
          severity: 'critical',
          timestamp: new Date().toISOString(),
        });
        this.multipleFacesCount = 0;
      }
    } else {
      this.multipleFacesCount = 0;
    }

    // Single face detected - analyze gaze and attention
    if (faces.length === 1) {
      this.faceDetectedCount++;
      this.noFaceCount = 0;

      const face = faces[0];
      this.analyzeGazeAndAttention(face);
    }
  }

  analyzeGazeAndAttention(face) {
    // Get key facial landmarks
    // MediaPipe FaceMesh landmark indices:
    // 1 = nose tip
    // 33 = left eye (outer corner)
    // 263 = right eye (outer corner)
    // 468 = left iris center
    // 473 = right iris center
    const keypoints = face.keypoints;

    if (!keypoints || keypoints.length === 0) {
      console.log('No keypoints found in face');
      return;
    }

    // Use iris centers for better gaze tracking
    const leftIris = keypoints[468];
    const rightIris = keypoints[473];
    const noseTip = keypoints[1];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];

    if (!noseTip || !leftEye || !rightEye || !leftIris || !rightIris) {
      console.log('Missing key facial landmarks');
      return;
    }

    // Calculate face center using eyes
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;

    // Calculate iris center
    const irisCenterX = (leftIris.x + rightIris.x) / 2;
    const irisCenterY = (leftIris.y + rightIris.y) / 2;

    // Calculate horizontal deviation (looking left/right)
    const horizontalDeviation = Math.abs(irisCenterX - eyeCenterX);

    // Calculate vertical deviation (looking up/down)
    const verticalDeviation = Math.abs(irisCenterY - eyeCenterY);

    // Detect looking away (significant deviation)
    // Adjusted thresholds for better sensitivity
    const isLookingAway = horizontalDeviation > 20 || verticalDeviation > 25;

    if (isLookingAway) {
      this.lookingAwayCount++;

      if (this.lookingAwayCount >= this.LOOKING_AWAY_THRESHOLD) {
        this.notifyListeners({
          type: 'LOOKING_AWAY',
          message: 'Candidate looking away from screen',
          severity: 'medium',
          timestamp: new Date().toISOString(),
        });
        this.lookingAwayCount = 0;
      }
    } else {
      this.lookingAwayCount = Math.max(0, this.lookingAwayCount - 1);
    }

    // Detect head position (too close or too far) using eye distance
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) +
      Math.pow(rightEye.y - leftEye.y, 2)
    );

    // Reduced thresholds for more realistic detection
    if (eyeDistance < 60) {
      this.notifyListeners({
        type: 'TOO_FAR',
        message: 'Candidate too far from camera',
        severity: 'low',
        timestamp: new Date().toISOString(),
      });
    } else if (eyeDistance > 200) {
      this.notifyListeners({
        type: 'TOO_CLOSE',
        message: 'Candidate too close to camera',
        severity: 'low',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Subscribe to proctoring events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // Get statistics
  getStatistics() {
    return {
      tabSwitches: this.tabSwitchCount,
      currentlyActive: this.isTabActive,
      monitoringActive: !!this.detectionInterval,
    };
  }

  // Reset counters
  reset() {
    this.faceDetectedCount = 0;
    this.noFaceCount = 0;
    this.multipleFacesCount = 0;
    this.lookingAwayCount = 0;
    this.tabSwitchCount = 0;
  }

  // Cleanup
  dispose() {
    this.stopMonitoring();
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
let proctoringInstance = null;

export const getProctoringService = () => {
  if (!proctoringInstance) {
    proctoringInstance = new ProctoringService();
  }
  return proctoringInstance;
};

export default ProctoringService;
