import axios from "axios";
import CryptoJS from 'crypto-js';
import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import AssessmentTestPage1 from './Components/AssessmentTestPage1.jsx'
import AssessmentTestPage2 from './Components/AssessmentTestPage2.jsx'
import AssessmentExamStart from './Components/AssessmentExamStart.jsx';
import { SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast'

const AssessmentTest = () => {

    const [isVerified, setIsVerified] = useState(false);
    const [assessment, setAssessment] = useState(null);
    const [assessmentQuestions, setAssessmentQuestions] = useState(null);
    const [calculatedScores, setCalculatedScores] = useState(null);
    const location = useLocation();
    const [scheduledAssessmentId, setScheduledAssessmentID] = useState("")
    const [candidateId, setCandidateId] = useState("")
    const [candidate, setCandidate] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (assessment?.assessmentId) {
            console.log('Fetching assessment questions for ID:', assessment.assessmentId._id);
            axios.get(`${process.env.REACT_APP_API_URL}/assessment-questions/list/${assessment.assessmentId._id}`)
                .then(response => {
                    console.log('API Response:', response.data);
                    if (response.data.success) {
                        const data = response.data.data;
                        console.log('Received assessment questions data:', data);
                        setAssessmentQuestions(data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching assessment questions:', error);
                    console.error('Error details:', error.response?.data || error.message);
                });
        }
    }, [assessment]);

    const getCandidateAssessmentDetails = async (candidateAssessmentId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate-assessment/details/${candidateAssessmentId}`)
            console.log("response=", response)
            if (response.data.success) {
                const document = response.data.candidateAssessment
                const idsObj = { scheduledAssessmentId: document.scheduledAssessmentId, candidateId: document.candidateId }
                return idsObj
            }
        } catch (error) {
            console.error("error in getting ids from candidate assessment")
            return null
        }
    }

    const decrypt = (encryptedText, secretKey) => {
        const decodedText = decodeURIComponent(encryptedText);
        const bytes = CryptoJS.AES.decrypt(decodedText, secretKey);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    };

    const calculateTotalScores = (assessment, assessmentQuestions) => {
        console.log('Calculating scores:', {
            passScoreBy: assessment?.assessmentId?.passScoreBy,
            passScoreType: assessment?.assessmentId?.passScoreType,
            assessment: assessment?.assessmentId,
            questions: assessmentQuestions?.sections
        });

        if (assessment?.assessmentId?.passScoreBy === "Overall") {
            console.log('Using Overall scores');
            return {
                passScore: assessment?.assessmentId?.passScore,
                totalScore: assessment?.assessmentId?.totalScore,
                showPercentage: assessment?.assessmentId?.passScoreType === "Percentage"
            };
        } else {
            console.log('Calculating scores for Each Section');
            const totalPassScore = assessmentQuestions?.sections?.reduce((sum, section) => sum + (section?.passScore || 0), 0);
            const totalScore = assessmentQuestions?.sections?.reduce((sum, section) => sum + (section?.totalScore || 0), 0);
            console.log('Calculated scores:', { totalPassScore, totalScore });
            return {
                passScore: totalPassScore,
                totalScore: totalScore,
                showPercentage: assessment?.assessmentId?.passScoreType === "Percentage"
            };
        }
    };

    useEffect(() => {
        console.log('Assessment or Questions changed:', {
            hasAssessment: !!assessment,
            hasQuestions: !!assessmentQuestions
        });

        if (assessment && assessmentQuestions) {
            console.log('Calculating scores for assessment:', assessment?.assessmentId?._id);
            const scores = calculateTotalScores(assessment, assessmentQuestions);
            console.log('Scores calculated:', scores);
            setCalculatedScores(scores);
        }
    }, [assessment, assessmentQuestions]);

    useEffect(() => {
        const fetchAssessmentAndCandidate = async () => {

            const queryParams = new URLSearchParams(window.location.search);
            console.log("queryParams", queryParams)

            const candidateAssessmentId = queryParams.get('candidateAssessmentId')
            console.log("candidateAssessmentId", candidateAssessmentId)
            const decryptedId = decrypt(candidateAssessmentId, 'test')
            console.log("decrypted id", decryptedId)
            localStorage.setItem("candidateAssessmentId", decryptedId)

            const { candidateId, scheduledAssessmentId } = await getCandidateAssessmentDetails(decryptedId)
            console.log("candidateId,scheduledAssessmentId", candidateId, scheduledAssessmentId)
            console.log('Decrypted IDs:', { scheduledAssessmentId, candidateId });

            if (!scheduledAssessmentId || !candidateId) {
                toast.error('Invalid Assessment ID or Candidate ID.');
                return;
            }
            setScheduledAssessmentID(scheduledAssessmentId)
            setCandidateId(candidateId)

            try {
                // Fetch assessment details
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/schedule-assessment/list/${scheduledAssessmentId}`);
                setAssessment(response.data.scheduledAssessment);
                console.log('Assessment Data:', response.data);

                // Fetch candidate details
                const candidateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}`);
                const candidateData = candidateResponse.data;
                console.log('candidate Data :', candidateData)

                // Handle candidate images
                if (Array.isArray(candidateData)) {
                    const candidatesWithImages = candidateData.map((candidate) => {
                        if (candidate.ImageData?.filename) {
                            const imageUrl = `${process.env.REACT_APP_API_URL}/${candidate.ImageData.path.replace(/\\/g, '/')}`;
                            return { ...candidate, imageUrl };
                        }
                        return candidate;
                    });
                    setCandidate(candidatesWithImages);
                } else {
                    if (candidateData.ImageData?.filename) {
                        const imageUrl = `${process.env.REACT_APP_API_URL}/${candidateData.ImageData.path.replace(/\\/g, '/')}`;
                        candidateData.imageUrl = imageUrl;
                    }
                    setCandidate(candidateData);
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        fetchAssessmentAndCandidate();
    }, [location]);

    const renderHeader = () => (
        <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-[90rem] mx-auto px-8 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <SparklesIcon className="h-6 w-6 text-blue-600" />
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                            UpInterview
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Powered by</span>
                        <img
                            src="https://placehold.co/150x50?text=Customer"
                            alt="Customer Logo"
                            className="h-6 hover:opacity-80 transition-opacity"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="-mt-16">
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
                {renderHeader()}

                {currentStep === 1 && (
                    <AssessmentTestPage1
                        scheduledAssessmentId={scheduledAssessmentId}
                        setCurrentStep={setCurrentStep}
                        candidate={candidate}
                        candidateId={candidateId}
                        setIsVerified={setIsVerified}
                        assessment={assessment}
                        isVerified={isVerified}
                        calculatedScores={calculatedScores}
                    />
                )}

                {currentStep === 2 && (
                    <AssessmentTestPage2
                        assessment={assessment}
                        candidate={candidate}
                        assessmentQuestions={assessmentQuestions}
                        setCurrentStep={setCurrentStep}
                        isVerified={isVerified}
                    />
                )}

                {currentStep === 3 && (
                    <div>
                        <AssessmentExamStart
                            assessment={assessment}
                            candidate={candidate}
                            questions={assessmentQuestions}
                            duration={assessment?.assessmentId?.Duration}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentTest;