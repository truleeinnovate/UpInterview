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
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";

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
    duration ? parseInt(duration) * 60 : 0,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showIncompletePopup, setShowIncompletePopup] = useState(false);
  useScrollLock(showIncompletePopup);

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

  const areAllQuestionsAnswered = () => {
    const allQuestions =
      questions?.sections?.flatMap((section) => section?.questions || []) || [];
    return allQuestions.every(
      (q) => answers[q._id] !== undefined && answers[q._id] !== "",
    );
  };

  const handleSubmit = () => {
    if (!areAllQuestionsAnswered()) {
      setShowIncompletePopup(true);
      return;
    }
    setShowConfirmSubmit(true);
  };

  // const verifyAnswer = (question, selectedAnswer) => {
  //   const correctAnswer =
  //     question.snapshot?.correctAnswer || question.correctAnswer;
  //   const questionType =
  //     question.snapshot?.questionType || question.questionType;
  //   // ------------------------------ new implementation ------------------------------------

  //   // 1. Get correct answer (Handle potential array from DB)
  //   const rawCorrect =
  //     question.snapshot?.correctAnswer || question.correctAnswer;

  //   // Normalize both to Arrays for consistent comparison
  //   const correctArray = Array.isArray(rawCorrect) ? rawCorrect : [rawCorrect];
  //   const selectedArray = Array.isArray(selectedAnswer)
  //     ? selectedAnswer
  //     : [selectedAnswer];

  //   const clean = (val) =>
  //     String(val || "")
  //       .trim()
  //       .toLowerCase();
  //   // ------------------------------ new implementation ------------------------------------

  //   const normalizeAnswer = (answer, preserveFormatting = false) => {
  //     if (answer === null || answer === undefined || answer === "") return "";

  //     let processedAnswer = answer.toString();

  //     if (!preserveFormatting) {
  //       processedAnswer = processedAnswer.trim();
  //     }

  //     return processedAnswer;
  //   };

  //   const cleanMCQAnswer = (answer) => {
  //     const normalized = normalizeAnswer(answer);
  //     if (!normalized) return "";

  //     const cleaned = normalized
  //       .replace(/^[A-Z][).]\s*/, "")
  //       .replace(/^\d+[).]\s*/, "")
  //       .trim();

  //     return cleaned.toLowerCase();
  //   };

  //   const normalizeBoolean = (value) => {
  //     const normalized = normalizeAnswer(value);
  //     if (!normalized) return "";

  //     const trueValues = ["true", "t", "yes", "y", "1", "correct", "right"];
  //     const falseValues = ["false", "f", "no", "n", "0", "incorrect", "wrong"];

  //     if (trueValues.includes(normalized.toLowerCase())) return "true";
  //     if (falseValues.includes(normalized.toLowerCase())) return "false";

  //     return normalized.toLowerCase();
  //   };

  //   switch (questionType) {
  //     case "MCQ":
  //     case "Multiple Choice":
  //       // const cleanedSelected = cleanMCQAnswer(selectedAnswer);
  //       // const cleanedCorrect = cleanMCQAnswer(correctAnswer);
  //       // return cleanedSelected === cleanedCorrect;
  //       if (correctArray.length !== selectedArray.length) return false;
  //       return correctArray.every((c) =>
  //         selectedArray.some((s) => clean(s) === clean(c)),
  //       );

  //     case "Short Answer":
  //       const shortSelected = normalizeAnswer(selectedAnswer);
  //       const shortCorrect = normalizeAnswer(correctAnswer);
  //       return shortSelected.toLowerCase() === shortCorrect.toLowerCase();

  //     case "Long Answer":
  //       const longSelected = normalizeAnswer(selectedAnswer);
  //       const longCorrect = normalizeAnswer(correctAnswer);
  //       return longSelected.toLowerCase() === longCorrect.toLowerCase();

  //     case "Number":
  //     case "Numeric":
  //       const numSelected = normalizeAnswer(selectedAnswer);
  //       const numCorrect = normalizeAnswer(correctAnswer);
  //       return parseFloat(numSelected) === parseFloat(numCorrect);

  //     case "Boolean":
  //       // const boolSelected = normalizeBoolean(selectedAnswer);
  //       // const boolCorrect = normalizeBoolean(correctAnswer);
  //       // return boolSelected === boolCorrect;
  //       return clean(correctArray[0]) === clean(selectedArray[0]);

  //     case "Programming":
  //     case "Code":
  //       const codeSelected = normalizeAnswer(selectedAnswer, true);
  //       const codeCorrect = normalizeAnswer(correctAnswer, true);
  //       return codeSelected === codeCorrect;

  //     default:
  //       // const defaultSelected = normalizeAnswer(selectedAnswer);
  //       // const defaultCorrect = normalizeAnswer(correctAnswer);
  //       // return defaultSelected === defaultCorrect;
  //       return clean(selectedArray[0]) === clean(correctArray[0]);
  //   }
  // };

  // const handleConfirmSubmit = async () => {
  //   try {
  //     const submissionData = {
  //       candidateAssessmentId,
  //       scheduledAssessmentId: assessment._id,
  //       candidateId: candidate._id,
  //       status: "completed",
  //       remainingTime: timeLeft,
  //       sections: questions.sections.map((section) => {
  //         const sectionQuestions = section.questions.map((question) => {
  //           const selectedAnswer = answers[question._id] || "";
  //           const correctAnswer =
  //             question.snapshot?.correctAnswer || question.correctAnswer;
  //           const questionType =
  //             question.snapshot?.questionType || question.questionType;

  //           // ----------------------------------------------------------
  //           const possibleScore =
  //             question.snapshot?.score || question.score || 0;
  //           // ----------------------------------------------------------
  //           const userAnswer = answers[question._id];
  //           const isCorrect = verifyAnswer(question, userAnswer);
  //           // const score = isCorrect ? question.score || 0 : 0;
  //           const score = isCorrect ? Number(possibleScore) : 0;

  //           return {
  //             questionId: question._id,
  //             questionType,
  //             userAnswer: userAnswer,
  //             correctAnswer: correctAnswer,
  //             isCorrect,
  //             score,
  //             isAnswerLater: skippedQuestions.includes(question._id),
  //             submittedAt: new Date().toISOString(),
  //           };
  //         });

  //         const sectionScore = sectionQuestions.reduce(
  //           (sum, q) => sum + q.score,
  //           0,
  //         );
  //         console.log("sectionscore:", sectionScore);
  //         const sectionResult =
  //           sectionScore >= (section.passScore || 0) ? "pass" : "fail";
  //         console.log("sectionResult:", sectionResult);

  //         return {
  //           sectionId: section._id,
  //           sectionName: section.sectionName || "Unnamed Section",
  //           passScore: section.passScore || 0,
  //           questions: sectionQuestions,
  //           totalScore: sectionScore,
  //           sectionResult,
  //           sectionPassed: sectionResult === "pass",
  //         };
  //       }),
  //       submittedAt: new Date().toISOString(),
  //     };

  //     // Send the data to the backend
  //     const response = await fetch(
  //       `${config.REACT_APP_API_URL}/candidate-assessment/submit`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(submissionData),
  //       },
  //     );

  //     console.log("Response from backend:", response);

  //     const responseData = await response.json();

  //     if (!response.ok) {
  //       console.error("Error submitting assessment:", responseData.message);
  //       throw new Error(responseData.message || "Failed to submit assessment");
  //     }

  //     console.log("Assessment submitted successfully:", responseData);
  //     setIsSubmitted(true);
  //     setShowConfirmSubmit(false);
  //   } catch (error) {
  //     console.error("Error submitting assessment:", error);
  //   }
  // };

  const verifyAnswer = (question, selectedAnswer) => {
    // const questionType =
    //   question.snapshot?.questionType || question.questionType;
    // const options = question.snapshot?.options || question.options || [];

    // const clean = (val) =>
    //   String(val || "")
    //     .trim()
    //     .toLowerCase();
    const questionType =
      question.snapshot?.questionType || question.questionType;
    const options = question.snapshot?.options || question.options || [];

    const clean = (val) =>
      String(val || "")
        .trim()
        .toLowerCase();

    switch (questionType) {
      // case "MCQ":
      // case "Multiple Choice": {
      //   // 1. Get correct answers from the options array objects
      //   const correctOptions = options
      //     .filter((opt) => typeof opt === "object" && opt.isCorrect === true)
      //     .map((opt) => clean(opt.optionText));

      //   // 2. Normalize selected answers to an array
      //   const selectedArray = Array.isArray(selectedAnswer)
      //     ? selectedAnswer.map((s) => clean(s))
      //     : selectedAnswer
      //       ? [clean(selectedAnswer)]
      //       : [];

      //   // 3. Comparison
      //   if (correctOptions.length === 0) return false;
      //   if (correctOptions.length !== selectedArray.length) return false;

      //   // Ensure every correct option is present in the selection
      //   return correctOptions.every((c) => selectedArray.includes(c));
      // }

      // case "MCQ":
      // case "Multiple Choice": {
      //   // 1. Extract all correct options based on the isCorrect flag
      //   const correctOptionTexts = options
      //     .filter((opt) => opt && opt.isCorrect === true)
      //     .map((opt) => clean(opt.optionText));

      //   // 2. Normalize selectedAnswer (handle both single string or array of strings)
      //   const selectedArray = Array.isArray(selectedAnswer)
      //     ? selectedAnswer.map((s) => clean(s))
      //     : selectedAnswer
      //       ? [clean(selectedAnswer)]
      //       : [];

      //   // 3. Logic check:
      //   if (correctOptionTexts.length === 0) return false;

      //   // Check if lengths match and every correct option is selected
      //   if (correctOptionTexts.length !== selectedArray.length) return false;
      //   return correctOptionTexts.every((c) => selectedArray.includes(c));
      // }

      case "MCQ":
      case "Multiple Choice": {
        const correctOptionTexts = options
          .filter((opt) => opt && opt.isCorrect === true)
          .map((opt) => clean(opt.optionText));

        // Use Set to ensure unique selections if the UI allows multiple clicks
        const selectedArray = Array.isArray(selectedAnswer)
          ? [...new Set(selectedAnswer.map((s) => clean(s)))]
          : selectedAnswer
            ? [clean(selectedAnswer)]
            : [];

        if (correctOptionTexts.length === 0) return false;

        // Length must match unique selections
        if (correctOptionTexts.length !== selectedArray.length) return false;

        // Every correct answer must be found in the user's selection
        return correctOptionTexts.every((c) => selectedArray.includes(c));
      }

      case "Boolean": {
        const rawCorrect =
          question.snapshot?.correctAnswer || question.correctAnswer;
        // Handle case where rawCorrect might still be an array from old data
        const correctVal = Array.isArray(rawCorrect)
          ? rawCorrect[0]
          : rawCorrect;

        // Handle selectedAnswer as array or string (based on input component)
        const selectedVal = Array.isArray(selectedAnswer)
          ? selectedAnswer[0]
          : selectedAnswer;

        return clean(correctVal) === clean(selectedVal);
      }

      case "Short Answer":
      case "Long Answer":
      case "Short":
      case "Long": {
        const correct =
          question.snapshot?.correctAnswer || question.correctAnswer;
        return clean(correct) === clean(selectedAnswer);
      }

      case "Number":
      case "Numeric": {
        const correct =
          question.snapshot?.correctAnswer || question.correctAnswer;
        return parseFloat(selectedAnswer) === parseFloat(correct);
      }

      case "Programming":
      case "Code": {
        const correct =
          question.snapshot?.correctAnswer || question.correctAnswer;
        return (
          String(selectedAnswer || "").trim() === String(correct || "").trim()
        );
      }

      default:
        const defCorrect =
          question.snapshot?.correctAnswer || question.correctAnswer;
        return clean(defCorrect) === clean(selectedAnswer);
    }
  };

  // const handleConfirmSubmit = async () => {
  //   try {
  //     const submissionData = {
  //       candidateAssessmentId,
  //       scheduledAssessmentId: assessment._id,
  //       candidateId: candidate._id,
  //       status: "completed",
  //       remainingTime: timeLeft,
  //       sections: questions.sections.map((section) => {
  //         const sectionQuestions = section.questions.map((question) => {
  //           // Get raw answer from state
  //           const rawAnswer = answers[question._id];

  //           // Fix: Explicitly check for null/undefined to allow boolean 'false' or number 0
  //           const userAnswer =
  //             rawAnswer !== undefined && rawAnswer !== null ? rawAnswer : "";

  //           const isCorrect = verifyAnswer(question, userAnswer);

  //           // Get weighted points from snapshot or root
  //           const questionWeight = Number(
  //             question.snapshot?.score || question.score || 0,
  //           );

  //           // Calculate actual score earned
  //           const awardedScore = isCorrect ? questionWeight : 0;
  //           return {
  //             questionId: question._id,
  //             questionType:
  //               question.snapshot?.questionType || question.questionType,
  //             userAnswer: userAnswer, // This will now correctly send true/false/0
  //             correctAnswer:
  //               question.snapshot?.correctAnswer || question.correctAnswer,
  //             isCorrect,
  //             score: awardedScore,
  //             isAnswerLater: skippedQuestions.includes(question._id),
  //             submittedAt: new Date().toISOString(),
  //           };
  //         });

  //         // Sum the actual awarded scores for the section total
  //         const sectionTotalScore = sectionQuestions.reduce(
  //           (sum, q) => sum + q.score,
  //           0,
  //         );

  //         const passThreshold = Number(section.passScore || 0);
  //         const sectionResult =
  //           sectionTotalScore >= passThreshold ? "pass" : "fail";

  //         return {
  //           sectionId: section._id,
  //           sectionName: section.sectionName || "Unnamed Section",
  //           passScore: passThreshold,
  //           questions: sectionQuestions,
  //           totalScore: sectionTotalScore,
  //           sectionResult,
  //           sectionPassed: sectionResult === "pass",
  //         };
  //       }),
  //       submittedAt: new Date().toISOString(),
  //     };

  //     const response = await fetch(
  //       `${config.REACT_APP_API_URL}/candidate-assessment/submit`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(submissionData),
  //       },
  //     );

  //     console.log("Response from backend:", response);

  //     const responseData = await response.json();

  //     if (!response.ok) {
  //       console.error("Error submitting assessment:", responseData.message);
  //       throw new Error(responseData.message || "Failed to submit assessment");
  //     }

  //     console.log("Assessment submitted successfully:", responseData);
  //     setIsSubmitted(true);
  //     setShowConfirmSubmit(false);
  //   } catch (error) {
  //     console.error("Error submitting assessment:", error);
  //   }
  // };

  const handleConfirmSubmit = async () => {
    try {
      // Determine the strategy: "Each Section" or "Overall"
      const passScoreBy = assessment.assessmentId?.passScoreBy || "Overall";

      const evaluatedSections = questions.sections.map((section) => {
        const sectionQuestions = section.questions.map((question) => {
          const rawAnswer = answers[question._id];

          // KEEPING YOUR WORKING LOGIC: Explicitly check for null/undefined to allow boolean 'false' or number 0
          const userAnswer =
            rawAnswer !== undefined && rawAnswer !== null ? rawAnswer : "";

          const isCorrect = verifyAnswer(question, userAnswer);

          let displayCorrectAnswer =
            question.snapshot?.correctAnswer || question.correctAnswer;
          const qType =
            question.snapshot?.questionType || question.questionType;

          if (qType === "MCQ") {
            const correctOpts = (
              question.snapshot?.options ||
              question.options ||
              []
            )
              .filter(
                (opt) => typeof opt === "object" && opt.isCorrect === true,
              )
              .map((opt) => opt.optionText);

            displayCorrectAnswer =
              correctOpts.length > 0 ? correctOpts.join(", ") : "";
          } else if (qType === "Boolean") {
            displayCorrectAnswer = Array.isArray(displayCorrectAnswer)
              ? displayCorrectAnswer[0]
              : displayCorrectAnswer;
          }

          const questionWeight = Number(
            question.snapshot?.score || question.score || 0,
          );

          const awardedScore = isCorrect ? questionWeight : 0;

          return {
            questionId: question._id,
            questionType:
              question.snapshot?.questionType || question.questionType,
            userAnswer,
            correctAnswer: displayCorrectAnswer,
            isCorrect,
            score: awardedScore,
            isAnswerLater: skippedQuestions.includes(question._id),
            submittedAt: new Date().toISOString(),
          };
        });

        const sectionTotalScore = sectionQuestions.reduce(
          (sum, q) => sum + q.score,
          0,
        );

        const passThreshold = Number(section.passScore || 0);
        const sectionResult =
          sectionTotalScore >= passThreshold ? "pass" : "fail";

        return {
          sectionId: section._id,
          sectionName: section.sectionName || "Unnamed Section",
          passScore: passThreshold,
          questions: sectionQuestions,
          totalScore: sectionTotalScore,
          sectionResult,
          sectionPassed: sectionResult === "pass",
        };
      });

      // CALCULATE OVERALL TOTALS
      const totalEarned = evaluatedSections.reduce(
        (sum, s) => sum + s.totalScore,
        0,
      );
      const totalRequiredToPass = questions.sections.reduce(
        (sum, s) => sum + Number(s.passScore || 0),
        0,
      );

      // Determine Overall Assessment Result based on passScoreBy
      let isAssessmentPassed = false;

      if (passScoreBy === "Each Section") {
        // Gatekeeper: Must pass every single individual section
        isAssessmentPassed = evaluatedSections.every((s) => s.sectionPassed);
      } else {
        // Overall: Calculate based on the total score of all sections combined
        isAssessmentPassed = totalEarned >= totalRequiredToPass;
      }

      const formattedTotalScore = Number(totalEarned.toFixed(2));

      const submissionData = {
        candidateAssessmentId,
        scheduledAssessmentId: assessment._id,
        candidateId: candidate._id,
        status: "completed",
        remainingTime: timeLeft,
        sections: evaluatedSections,
        totalScore: formattedTotalScore,
        assessmentResult: isAssessmentPassed ? "pass" : "fail",
        passScoreBy,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(
        `${config.REACT_APP_API_URL}/candidate-assessment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error submitting assessment:", responseData.message);
        throw new Error(responseData.message || "Failed to submit assessment");
      }

      console.log("Assessment submitted successfully:", responseData);
      setIsSubmitted(true);
      setShowConfirmSubmit(false);
    } catch (error) {
      console.error("Error submitting assessment:", error);
    }
  };

  const handleStartReview = () => {
    setIsReviewing(true);
    setCurrentQuestionIndex(0);
    setCurrentSection(0);
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
        0,
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
                        className={`flex items-center px-4 py-2 rounded-lg ${
                          timeLeft < 300
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
    </div>
  );
}

export default AssessmentTest;
