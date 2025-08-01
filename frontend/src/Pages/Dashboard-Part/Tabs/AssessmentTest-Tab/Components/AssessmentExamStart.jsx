import { useState, useEffect } from 'react';
import { ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AssessmentSidebar from './AssessmentExamComponents/AssessmentExamSidebar.jsx';
import QuestionDisplay from './AssessmentExamComponents/AssessmentExamQuestionDisplay.jsx';
import SubmitConfirmation from './AssessmentExamComponents/AssessmentExamSubmitConfirmation.jsx';
import CompletionScreen from './AssessmentExamComponents/AssessmentExamCompletionScreen.jsx';
import QuestionNavigation from './AssessmentExamComponents/AssessmentExamQuestionNavigation.jsx';
import { config } from '../../../../../config.js';

function AssessmentTest({ assessment, candidate, questions, duration,candidateAssessmentId }) {
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(duration ? parseInt(duration) * 60 : 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [skippedQuestions, setSkippedQuestions] = useState([]);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    useEffect(() => {
        if (duration) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [duration]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = () => {
        setShowConfirmSubmit(true);
    };

 const handleConfirmSubmit = async () => {
    try {
        const candidateAssessmentData = {
            candidateAssessmentId: candidateAssessmentId, // Add candidateAssessmentId here
            scheduledAssessmentId: assessment._id,
            candidateId: candidate._id,
            status: 'completed',
            sections: questions.sections.map(section => ({
                SectionName: section.sectionName || 'Unnamed Section',
                Answers: section.questions.map(question => {
                    // Remove console logs to prevent loops
                    // console.log("Question ID:", question._id);
                    // console.log("Question:", question);
                    const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
                    const selectedAnswer = answers[question._id];
                    const isCorrect = correctAnswer === selectedAnswer;
                    const score = isCorrect ? question.score ?? 0 : 0;
                    // console.log("Correct Answer:", correctAnswer);
                    // console.log("Selected Answer:", selectedAnswer);
                    // console.log("Score:", score);
                    return {
                        questionId: question._id,
                        answer: selectedAnswer,
                        isCorrect: isCorrect,
                        score: score,
                        isAnswerLater: skippedQuestions.includes(question._id),
                        submittedAt: new Date()
                    }
                }),
                totalScore: section.questions.reduce((total, question) => {
                    const answer = answers[question._id];
                    const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
                    return total + (answer === correctAnswer ? (question.score ?? 0) : 0);
                }, 0),
                passScore: section.passScore ?? 0,
                sectionResult: section.questions.reduce((total, question) => {
                    const answer = answers[question._id];
                    const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
                    return total + (answer === correctAnswer ? (question.score ?? 0) : 0);
                }, 0) >= (section.passScore ?? 0) ? 'pass' : 'fail'
            })),
            totalScore: questions.sections.reduce((total, section) => {
                return total + section.questions.reduce((sectionTotal, question) => {
                    const answer = answers[question._id];
                    const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
                    return sectionTotal + (answer === correctAnswer ? (question.score ?? 0) : 0);
                }, 0);
            }, 0),
            overallResult: questions.sections.every(section => {
                const sectionScore = section.questions.reduce((total, question) => {
                    const answer = answers[question._id];
                    const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
                    return total + (answer === correctAnswer ? (question.score ?? 0) : 0);
                }, 0);
                return sectionScore >= (section.passScore ?? 0);
            }) ? 'pass' : 'fail',
            submittedAt: new Date()
        };
        console.log("candidateAssessmentData", candidateAssessmentData);

        const response = await fetch(`${config.REACT_APP_API_URL}/candidate-assessment/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(candidateAssessmentData)
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to submit assessment');
        }

        setIsSubmitted(true);
        setShowConfirmSubmit(false);
    } catch (error) {
        console.error('Error submitting assessment:', error.message);
    }
};

    const handleStartReview = () => {
        setIsReviewing(true);
        setShowConfirmSubmit(false);
    };

    const handleCancelReview = () => {
        setIsReviewing(false);
        setShowConfirmSubmit(false);
    };

    const getTotalQuestions = () => {
        return questions?.sections?.reduce((acc, section) => acc + (section?.questions?.length || 0), 0) || 0;
    };

    const getTotalAnswered = () => {
        const allQuestions = questions?.sections?.flatMap(section => section?.questions || []) || [];
        return allQuestions.filter(q => answers[q._id]).length;
    };

    const totalQuestions = getTotalQuestions();
    const answeredQuestions = getTotalAnswered();
    const currentSectionData = questions?.sections?.[currentSection];
    const currentQuestion = currentSectionData?.questions?.[currentQuestionIndex] || null;

    if (isSubmitted) {
        return <CompletionScreen />;
    }

    if (showConfirmSubmit) {
        return (
            <SubmitConfirmation
                questions={questions}
                answers={answers}
                totalQuestions={totalQuestions}
                answeredQuestions={answeredQuestions}
                handleStartReview={handleStartReview}
                handleConfirmSubmit={handleConfirmSubmit}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white">
            <div className="max-w-[90rem] mx-auto px-8 py-11">
                <div className="flex gap-8">
                    <AssessmentSidebar
                        questions={questions}
                        currentSection={currentSection}
                        setCurrentSection={setCurrentSection}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        answers={answers}
                        timeLeft={timeLeft}
                        formatTime={formatTime}
                        totalQuestions={totalQuestions}
                        answeredQuestions={answeredQuestions}
                    />
                    <div className="flex-1">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <span className="px-4 py-2 bg-blue-100 text-custom-blue rounded-lg text-sm font-medium">
                                            Question {currentQuestionIndex + 1} of {currentSectionData?.questions?.length || 0}
                                        </span>
                                        <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                                            {currentQuestion?.snapshot?.questionType}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {isReviewing ? (
                                            <button
                                                onClick={handleCancelReview}
                                                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-custom-blue bg-gray-100 hover:bg-gray-200 transition-colors"
                                            >
                                                <XMarkIcon className="h-5 w-5 mr-2" />
                                                Exit Review
                                            </button>
                                        ) : (
                                            <div className={`flex items-center px-4 py-2 rounded-xl ${timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-custom-blue'}`}>
                                                <ClockIcon className="h-6 w-6 mr-3" />
                                                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleSubmit}
                                            className="inline-flex items-center px-4 py-2 rounded-xl font-medium text-white bg-custom-blue hover:bg-custom-blue/80 transition-colors duration-300"
                                        >
                                            {isReviewing ? 'Finish Review' : 'Review & Submit'}
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    {currentQuestionIndex + 1}. {currentQuestion?.snapshot?.questionText}
                                </h3>
                            </div>
                            <QuestionDisplay
                                question={currentQuestion}
                                answers={answers}
                                handleAnswer={handleAnswer}
                                isReviewing={isReviewing}
                            />
                            <QuestionNavigation
                                currentQuestionIndex={currentQuestionIndex}
                                setCurrentQuestionIndex={setCurrentQuestionIndex}
                                currentSection={currentSection}
                                setCurrentSection={setCurrentSection}
                                questions={questions}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssessmentTest;