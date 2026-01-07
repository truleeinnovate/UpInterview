// v1.0.0 - Ashok - Improved responsiveness and fixed minor UI issues and scroll lock
// v1.0.1 - Ashok - Fixed style issues

import { useState, useEffect } from "react";
import { ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AssessmentSidebar from "./AssessmentExamComponents/AssessmentExamSidebar.jsx";
import QuestionDisplay from "./AssessmentExamComponents/AssessmentExamQuestionDisplay.jsx";
import SubmitConfirmation from "./AssessmentExamComponents/AssessmentExamSubmitConfirmation.jsx";
import CompletionScreen from "./AssessmentExamComponents/AssessmentExamCompletionScreen.jsx";
import QuestionNavigation from "./AssessmentExamComponents/AssessmentExamQuestionNavigation.jsx";
import { config } from "../../../../../config.js";
// v1.0.0 <-------------------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.0 ------------------------------------------------------------------->

function AssessmentTest({
  assessment,
  candidate,
  questions,
  duration,
  candidateAssessmentId,
}) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(
    duration ? parseInt(duration) * 60 : 0
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  // v1.0.0 <-------------------------------------------------------------------
  const [showIncompletePopup, setShowIncompletePopup] = useState(false);
  useScrollLock(showIncompletePopup);
  // v1.0.0 ------------------------------------------------------------------->

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
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  //   v1.0.0 <---------------------------------------------------------------------
  const areAllQuestionsAnswered = () => {
    const allQuestions =
      questions?.sections?.flatMap((section) => section?.questions || []) || [];
    return allQuestions.every(
      (q) => answers[q._id] !== undefined && answers[q._id] !== ""
    );
  };
  //   v1.0.0 <---------------------------------------------------------------------

  const handleSubmit = () => {
    // v1.0.0 <---------------------------------
    if (!areAllQuestionsAnswered()) {
      setShowIncompletePopup(true);
      return;
    }
    // v1.0.0 <---------------------------------
    setShowConfirmSubmit(true);
  };


  // Enhanced verifyAnswer function with comprehensive trimming and type handling
  const verifyAnswer = (question, selectedAnswer) => {
    const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
    const questionType = question.snapshot?.questionType || question.questionType;

    // Helper function to clean and normalize answers with proper trimming
    const normalizeAnswer = (answer, preserveFormatting = false) => {
      if (answer === null || answer === undefined || answer === '') return '';

      let processedAnswer = answer.toString();

      if (!preserveFormatting) {
        // For most answer types, trim and normalize
        processedAnswer = processedAnswer.trim();
      }

      return processedAnswer;
    };

    // Enhanced MCQ cleaning function
    const cleanMCQAnswer = (answer) => {
      const normalized = normalizeAnswer(answer);
      if (!normalized) return '';

      // Remove patterns like "A) ", "B) ", "C) " etc. from the beginning
      // Also handles "A. ", "1) ", "1. " etc.
      const cleaned = normalized
        .replace(/^[A-Z][).]\s*/, '')  // Remove "A) ", "B) ", "A. ", "B. "
        .replace(/^\d+[).]\s*/, '')    // Remove "1) ", "2) ", "1. ", "2. "
        .trim();

      return cleaned.toLowerCase();
    };

    // Enhanced boolean normalization
    const normalizeBoolean = (value) => {
      const normalized = normalizeAnswer(value);
      if (!normalized) return '';

      const trueValues = ['true', 't', 'yes', 'y', '1', 'correct', 'right'];
      const falseValues = ['false', 'f', 'no', 'n', '0', 'incorrect', 'wrong'];

      if (trueValues.includes(normalized.toLowerCase())) return 'true';
      if (falseValues.includes(normalized.toLowerCase())) return 'false';

      return normalized.toLowerCase(); // Return as-is for strict comparison
    };

    switch (questionType) {
      case 'MCQ':
      case 'Multiple Choice':
        // For MCQ, clean both answers before comparison
        const cleanedSelected = cleanMCQAnswer(selectedAnswer);
        const cleanedCorrect = cleanMCQAnswer(correctAnswer);
        return cleanedSelected === cleanedCorrect;

      case 'Short Answer':
        // For short answers, trim and compare case-insensitively
        const shortSelected = normalizeAnswer(selectedAnswer);
        const shortCorrect = normalizeAnswer(correctAnswer);
        return shortSelected.toLowerCase() === shortCorrect.toLowerCase();

      case 'Long Answer':
        // For long answers, trim and compare case-insensitively
        const longSelected = normalizeAnswer(selectedAnswer);
        const longCorrect = normalizeAnswer(correctAnswer);
        return longSelected.toLowerCase() === longCorrect.toLowerCase();

      case 'Number':
      case 'Numeric':
        // For numbers, compare numerically after trimming
        const numSelected = normalizeAnswer(selectedAnswer);
        const numCorrect = normalizeAnswer(correctAnswer);
        return parseFloat(numSelected) === parseFloat(numCorrect);

      case 'Boolean':
        // For boolean, normalize both values and compare
        const boolSelected = normalizeBoolean(selectedAnswer);
        const boolCorrect = normalizeBoolean(correctAnswer);
        return boolSelected === boolCorrect;

      case 'Programming':
      case 'Code':
        // For programming questions, preserve formatting but trim outer whitespace
        const codeSelected = normalizeAnswer(selectedAnswer, true); // Preserve internal formatting
        const codeCorrect = normalizeAnswer(correctAnswer, true);
        return codeSelected === codeCorrect;

      default:
        // Default comparison with trimming
        const defaultSelected = normalizeAnswer(selectedAnswer);
        const defaultCorrect = normalizeAnswer(correctAnswer);
        return defaultSelected === defaultCorrect;
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      const candidateAssessmentData = {
        candidateAssessmentId: candidateAssessmentId, // Add candidateAssessmentId here
        scheduledAssessmentId: assessment._id,
        candidateId: candidate._id,
        status: "completed",
        sections: questions.sections.map((section) => ({
          SectionName: section.sectionName || "Unnamed Section",
          Answers: section.questions.map((question) => {
            // Remove console logs to prevent loops
            // console.log("Question ID:", question._id);
            const correctAnswer =
              question.snapshot?.correctAnswer || question.correctAnswer;
            const selectedAnswer = answers[question._id];
            const isCorrect = verifyAnswer(question, selectedAnswer);  // Consistent logic
            const score = isCorrect ? (question.score ?? 0) : 0;
            // const selectedAnswer = answers[question._id];
            // const isCorrect = correctAnswer === selectedAnswer;
            // const score = isCorrect ? question.score ?? 0 : 0;
            // console.log("Correct Answer:", correctAnswer);
            // console.log("Selected Answer:", selectedAnswer);
            // console.log("Score:", score);
            return {
              questionId: question._id,
              answer: selectedAnswer,
              isCorrect: isCorrect,
              score: score,
              isAnswerLater: skippedQuestions.includes(question._id),
              submittedAt: new Date(),
            };
          }),
          totalScore: section.questions.reduce((total, question) => {
            const answer = answers[question._id];
            const correctAnswer =
              question.snapshot?.correctAnswer || question.correctAnswer;
            return total + (answer === correctAnswer ? question.score ?? 0 : 0);
          }, 0),
          passScore: section.passScore ?? 0,
          sectionResult:
            section.questions.reduce((total, question) => {
              const answer = answers[question._id];
              const correctAnswer =
                question.snapshot?.correctAnswer || question.correctAnswer;
              return (
                total + (answer === correctAnswer ? question.score ?? 0 : 0)
              );
            }, 0) >= (section.passScore ?? 0)
              ? "pass"
              : "fail",
        })),
        totalScore: questions.sections.reduce((total, section) => {
          return (
            total +
            section.questions.reduce((sectionTotal, question) => {
              const answer = answers[question._id];
              const correctAnswer =
                question.snapshot?.correctAnswer || question.correctAnswer;
              return (
                sectionTotal +
                (answer === correctAnswer ? question.score ?? 0 : 0)
              );
            }, 0)
          );
        }, 0),
        overallResult: questions.sections.every((section) => {
          const sectionScore = section.questions.reduce((total, question) => {
            const answer = answers[question._id];
            const correctAnswer =
              question.snapshot?.correctAnswer || question.correctAnswer;
            return total + (answer === correctAnswer ? question.score ?? 0 : 0);
          }, 0);
          return sectionScore >= (section.passScore ?? 0);
        })
          ? "pass"
          : "fail",
        submittedAt: new Date(),
      };

      const response = await fetch(
        `${config.REACT_APP_API_URL}/candidate-assessment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(candidateAssessmentData),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit assessment");
      }

      setIsSubmitted(true);
      setShowConfirmSubmit(false);
    } catch (error) {
      console.error("Error submitting assessment:", error.message);
    }
  };

  const handleStartReview = () => {
    setIsReviewing(true);
    setCurrentQuestionIndex(0); // Reset to first question when starting review
    setCurrentSection(0); // Also reset section to first section
    setShowConfirmSubmit(false);
  };

  const handleCancelReview = () => {
    setIsReviewing(false);
    setShowConfirmSubmit(false);
  };

  const getTotalQuestions = () => {
    return (
      questions?.sections?.reduce(
        (acc, section) => acc + (section?.questions?.length || 0),
        0
      ) || 0
    );
  };

  const getTotalAnswered = () => {
    const allQuestions =
      questions?.sections?.flatMap((section) => section?.questions || []) || [];
    return allQuestions.filter((q) => answers[q._id]).length;
  };

  const totalQuestions = getTotalQuestions();
  const answeredQuestions = getTotalAnswered();
  const currentSectionData = questions?.sections?.[currentSection];
  const currentQuestion =
    currentSectionData?.questions?.[currentQuestionIndex] || null;

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
      {/* v1.0.0 <------------------------------------------------ */}
      <div className="mx-auto sm:px-4 px-8 py-11">
        <div className="flex sm:flex-col md:flex-col gap-8">
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
              {/* v1.0.1 <----------------------------------------------------------------------------------------------- */}
              <div className="sm:p-4 md:px-4 p-8">
                <div className="flex sm:flex-col sm:items-start items-center sm:justify-start sm:gap-4 justify-between mb-6">
                  <div className="flex sm:justify-between items-center space-x-4 sm:w-full">
                    <span className="px-4 py-2 bg-blue-100 text-custom-blue rounded-lg sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-medium">
                      Question {currentQuestionIndex + 1} of{" "}
                      {currentSectionData?.questions?.length || 0}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-medium">
                      {currentQuestion?.snapshot?.questionType}
                    </span>
                  </div>
                  <div className="flex sm:justify-between items-center space-x-2 sm:w-full">
                    {isReviewing ? (
                      <button
                        onClick={handleCancelReview}
                        className="sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-custom-blue bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <XMarkIcon className="sm:h-4 sm:w-4 h-5 w-5 mr-2" />
                        Exit Review
                      </button>
                    ) : (
                      <div
                        className={`flex items-center px-4 py-2 rounded-lg ${timeLeft < 300
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-custom-blue"
                          }`}
                      >
                        <ClockIcon className="sm:h-4 sm:w-4 h-5 w-5 mr-3" />
                        <span className="sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm font-mono font-semibold">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleSubmit}
                      className="sm:text-xs md:text-sm lg:text-sm xl:text-sm 2xl:text-sm inline-flex items-center px-4 py-2 rounded-lg font-medium text-white bg-custom-blue hover:bg-custom-blue/80 transition-colors duration-300"
                    >
                      {isReviewing ? "Finish Review" : "Review & Submit"}
                    </button>
                  </div>
                </div>
                <h3 className="sm:text-sm md:text-md lg:text-md xl:text-md 2xl:text-md font-semibold text-gray-900">
                  {currentQuestionIndex + 1}.{" "}
                  {currentQuestion?.snapshot?.questionText}
                </h3>
              </div>
              {/* v1.0.1 -----------------------------------------------------------------------------------------------> */}
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
      {/* v1.0.0 ------------------------------------------------> */}

      {/* v1.0.0 <---------------------------------------------------------------------- */}
      {showIncompletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Incomplete Submission
            </h3>
            <p className="text-gray-700 mb-6">
              Please answer all questions before submitting.
            </p>
            <button
              onClick={() => setShowIncompletePopup(false)}
              className="px-6 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* v1.0.0 ----------------------------------------------------------------------> */}
    </div>
  );
}

export default AssessmentTest;
