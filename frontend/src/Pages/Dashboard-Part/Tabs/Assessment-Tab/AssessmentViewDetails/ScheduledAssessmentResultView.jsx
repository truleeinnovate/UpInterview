// v1.0.0  -  Ashraf  -  displaying more fileds in result
// v1.0.1  -  Ashok   -  changed manImage (man.png) url from local to cloud storage url
// v1.0.2  -  Ashok   -  Improved responsiveness
// v1.0.3  -  Ashok   -  Fixed responsiveness issues
// v1.0.4  -  Ashok   -  fixed style issue

import { format } from "date-fns";
// import manImage from "../../../Images/man.png";
import { ReactComponent as IoIosArrowBack } from "../../../../../icons/IoIosArrowBack.svg";
import { ChevronUp, ChevronDown } from "lucide-react";

function AssessmentResultView({
  candidate,
  assessment,
  onBack,
  toggleStates,
  toggleArrow1,
  isFullscreen,
  mode,
  timeTaken, // Formatted time taken from AssessmentResultTab
  assessmentQuestions, // assessmentQuestions come from AssessmentViewDetails.jsx
}) {

  console.log('assessment', assessment);
  console.log('assessmentQuestions', assessmentQuestions);

  // <---------------------- v1.0.0
  // Helper to check if a date is valid
  const isValidDate = (date) => {
    const d = new Date(date);
    return date && !isNaN(d);
  };

  // Helper to get expiry date from candidate or fallback
  const getExpiryDate = () => {
    if (candidate.expiryAt && isValidDate(candidate.expiryAt))
      return candidate.expiryAt;
    if (
      candidate.schedule &&
      candidate.schedule.expiryAt &&
      isValidDate(candidate.schedule.expiryAt)
    )
      return candidate.schedule.expiryAt;
    return null;
  };

  // Section pass/fail logic
  const isEachSection = assessment.passScoreBy === "Each Section";
  const totalAnsweredQuestions = candidate.sections.reduce((count, section) => {
    return (
      count +
      section.Answers.reduce(
        (acc, answer) => (!answer.isAnswerLater ? acc + 1 : acc),
        0
      )
    );
  }, 0);

  // Section results for 'Each Section'
  const sectionResults = isEachSection
    ? candidate.sections.map((section) => ({
      name: section.SectionName,
      score: section.totalScore,
      passScore: section.passScore,
      result:
        section.totalScore >= (section.passScore || 0) ? "pass" : "fail",
      answered: section.Answers.filter((a) => !a.isAnswerLater).length,
      total: section.Answers.length,
    }))
    : [];

  // Overall result
  const overallResult = candidate.result;

  // Time taken calculation
  const totalDuration = assessment.Duration
    ? parseInt(assessment.Duration, 10)
    : 30;
  // <-------------------------------v1.0.0

  return (
    // v1.0.2 <---------------------------------------------------------------
    <div
      className={`flex ${isFullscreen ? "flex-col" : "flex-col"
        } gap-6 h-full min-h-screen sm:p-0 p-6`}
    >
      {/* v1.0.2 ------------------------------------------------------------> */}
      {/* Back Button */}
      {mode !== "interviewMode" && (
        <div className={`${isFullscreen ? "mb-2" : "mb-4"} flex items-center`}>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <IoIosArrowBack className="mr-2 h-5 w-5" />
            Back to Results
          </button>
        </div>
      )}

      {/* Main Content */}
      {/* v1.0.2 <--------------------------------------------------------------- */}
      <div
        className={`flex ${isFullscreen ? "sm:flex-col md:flex-col flex-row w-full" : "flex-col"
          } gap-6 flex-1`}
      >
        {/* v1.0.2 ---------------------------------------------------------------> */}
        {/* Left Panel - Candidate Details */}
        {/* v1.0.2 <--------------------------------------------------------------- */}

        <div
          className={`${isFullscreen ? "sm:w-full md:w-full w-1/3" : "w-full"
            } bg-white rounded-lg shadow-sm border border-gray-200 h-fit`}
        >
          {/* v1.0.2 ---------------------------------------------------------------> */}
          <div className="p-6">
            {/* Candidate Profile */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 mb-3 overflow-hidden">
                {/* v1.0.1 <---------------------------------------------------------------------------- */}
                {/* <img src={manImage} alt="Candidate" className="w-full h-full object-cover" /> */}
                <img
                  src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/man_u11smn.png"
                  alt="Candidate"
                  className="w-full h-full object-cover"
                />
                {/* v1.0.1 ----------------------------------------------------------------------------> */}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[300px]">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {candidate.email}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {candidate.experience} year(s) experience
              </p>
            </div>

            {/* Assessment Summary */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  Assessment Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Assessment:</span>
                    <span className="font-medium">
                      {assessment.AssessmentTitle}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    {/* // <---------------------- v1.0.0 */}

                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${overallResult === "pass"
                          ? "bg-green-100 text-green-800"
                          : overallResult === "fail"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {overallResult
                        ? overallResult.charAt(0).toUpperCase() +
                        overallResult.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expiry:</span>
                    <span className="font-medium">
                      {isValidDate(getExpiryDate())
                        ? format(new Date(getExpiryDate()), "MMM dd, yyyy")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">
                      {isValidDate(candidate.completionDate)
                        ? format(
                          new Date(candidate.completionDate),
                          "MMM dd, yyyy hh:mm a"
                        )
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Taken:</span>
                    <span className="font-medium">
                      {timeTaken} / {totalDuration} mins
                    </span>
                  </div>
                </div>
              </div>
              {/* Score Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Score Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Total Questions</p>
                    <p className="font-medium">
                      {assessment.NumberOfQuestions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Answered</p>
                    <p className="font-medium">{totalAnsweredQuestions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Score</p>
                    <p className="font-medium">{candidate.totalScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pass Score</p>
                    <p className="font-medium">
                      {isEachSection ? "-" : assessment.passScore}
                    </p>
                  </div>
                </div>
              </div>
              {/* Section Results (if passScoreBy is Each Section) */}
              {isEachSection && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-medium text-gray-800">Section Results</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {sectionResults.map((section, idx) => (
                      <div
                        key={section.name || idx}
                        className="flex justify-between items-center p-2 rounded border border-gray-200"
                      >
                        <span className="font-medium text-gray-700">
                          {section.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          Score: {section.score}/{section.passScore}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${section.result === "pass"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {section.result.charAt(0).toUpperCase() +
                            section.result.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Question Details */}
        {/* v1.0.2 <--------------------------------------------------------------- */}
        {/* v1.0.3 <------------------------------------------------------------------------- */}
        <div
          className={`max-h-[100vh-160px] ${isFullscreen ? "sm:w-full md:w-full w-2/3" : "w-full"
            } bg-white rounded-lg shadow-sm border border-gray-200 flex-1`}
        >
          {/* v1.0.2 ---------------------------------------------------------------> */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Question Responses</h3>
          </div>

          <div className="divide-y divide-gray-200 max-h-[calc(100vh-116px)] overflow-y-auto">
            {assessmentQuestions?.sections?.map((section, index) => {
              const candidateSection = candidate.sections.find(
                (candSec) =>
                  candSec.sectionId?.toString() === section._id?.toString()
              );
              const answerCount =
                candidateSection?.Answers.filter((a) => !a.isAnswerLater)
                  .length || 0;
              const sectionPass = isEachSection
                ? candidateSection?.totalScore >=
                (candidateSection?.passScore || 0)
                : true;
              // <-------------------------------v1.0.1

              return (
                <div
                  key={section.sectionName || index}
                  className="last:border-b-0"
                >
                  <div
                    className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleArrow1(index)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">
                        {section.sectionName}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-600">
                        <span>
                          Questions: {answerCount}/
                          {section.questions?.length || 0}
                        </span>
                        <span>
                          Score: {candidateSection?.totalScore || 0}
                          {isEachSection &&
                            `/${candidateSection?.passScore || 0}`}
                        </span>
                        {isEachSection && (
                          <span
                            className={`font-medium ${sectionPass ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {sectionPass ? "Passed" : "Failed"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      {toggleStates[index] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>

                  {toggleStates[index] && (
                    <div className="p-4 space-y-4">
                      {section.questions?.map((question, qIndex) => {
                        const answer = candidateSection?.Answers.find(
                          (ans) =>
                            ans.questionId.toString() ===
                            question._id.toString()
                        );
                        const isCorrect = answer?.isCorrect;
                        const userAnswer = answer?.userAnswer || "Not Answered";
                        const marks = answer?.score ?? 0;

                        return (
                          <div
                            key={question._id}
                            className="p-4 border border-gray-200 rounded-lg text-sm"
                          >
                            <div className="flex items-start">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0 text-xs">
                                {qIndex + 1}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-800 mb-3">
                                  {question.snapshot?.questionText ||
                                    "Question not available"}
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Correct Answer
                                    </p>
                                    <p className="font-medium break-words whitespace-pre-wrap">
                                      {question.snapshot?.correctAnswer ||
                                        "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Candidate's Answer
                                    </p>
                                    <p
                                      className={`font-medium break-words whitespace-pre-wrap ${isCorrect === false
                                          ? "text-red-600"
                                          : isCorrect
                                            ? "text-green-600"
                                            : "text-gray-800"
                                        }`}
                                    >
                                      {userAnswer}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Marks
                                    </p>
                                    <p className="font-medium">{question.score || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Score
                                    </p>
                                    <p className="font-medium">{marks}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* v1.0.3 -------------------------------------------------------------------------> */}
      </div>
    </div>
  );
}

export default AssessmentResultView;
