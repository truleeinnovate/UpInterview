// function QuestionDisplay({ question, answers, handleAnswer, isReviewing }) {
//     if (!question) return null;

//     const type = question?.snapshot?.questionType;
//     const options = (type === 'MCQ' && Array.isArray(question.snapshot.options))
//         ? question.snapshot.options.map((opt) => ({
//             id: opt,
//             text: opt,
//         }))
//         : [];

//     const renderQuestionContent = () => {
//         switch (type) {
//             case 'MCQ':
//                 return (
//                     <div className="space-y-4">
//                         {options.map((option) => (
//                             <label
//                                 key={option.id}
//                                 className={`flex items-center space-x-4 p-6 border rounded-2xl transition-all duration-300 cursor-pointer
//                                 ${answers[question._id] === option.id
//                                         ? 'bg-blue-50 border-blue-200 shadow-inner'
//                                         : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
//                                     }`}
//                             >
//                                 <input
//                                     type="radio"
//                                     name={question._id}
//                                     value={option.id}
//                                     checked={answers[question._id] === option.id}
//                                     onChange={() => handleAnswer(question._id, option.id)}
//                                     className="h-5 w-5 text-blue-600 focus:ring-blue-500"
//                                     disabled={isReviewing}
//                                 />
//                                 <span className="text-lg text-gray-900">{option.text}</span>
//                             </label>
//                         ))}
//                     </div>
//                 );
//             default:
//                 return (
//                     <div className="text-gray-500 italic">
//                         Question type "{type}" is not supported yet.
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="p-8">
//             {renderQuestionContent()}
//         </div>
//     );
// }

// export default QuestionDisplay;

// v1.0.0 - Ashok - Improved responsiveness

import React from "react";
// v1.0.0 <----------------------------------------------------------------------
import CodeEditor from "./AssessmentExamCodeEditor/AssessmentExamCodeEditor";
// v1.0.0 ---------------------------------------------------------------------->

// AnswerInput component to handle different question types
const AnswerInput = ({
  questionType,
  options,
  value,
  onChange,
  questionId,
  disabled = false,
}) => {
  // Handle different question types
  switch (questionType) {
    case "MCQ":
      // v1.0.0 <-----------------------------------------------------------------------------------
      return (
        <div className="space-y-4">
          {options?.map((option, index) => (
            <label
              key={index}
              className={`flex items-center space-x-4 p-6 border rounded-2xl transition-all duration-300 cursor-pointer
                ${
                  value === option
                    ? "bg-blue-50 border-blue-200 shadow-inner"
                    : "hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
            >
              <input
                type="radio"
                name={`mcq-${questionId}`}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="sm:h-4 sm:w-4 h-5 w-5 accent-custom-blue text-custom-blue focus:ring-custom-blue"
                disabled={disabled}
              />
              <span className="sm:text-sm md:text-md lg:text-lg xl:text-lg 2xl:text-lg text-gray-900">
                {option}
              </span>
            </label>
          ))}
        </div>
      );
    // v1.0.0 ----------------------------------------------------------------------------------->

    case "Short":
      // v1.0.0 <--------------------------------------------------------------------------------
      return (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm p-3 border"
          placeholder="Type your answer here..."
          disabled={disabled}
        />
      );
    // v1.0.0 -------------------------------------------------------------------------------->

    case "Long":
      // v1.0.0 <--------------------------------------------------------------------------------
      return (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm p-3 border"
          placeholder="Type your detailed answer here..."
          disabled={disabled}
        />
      );
    // v1.0.0 -------------------------------------------------------------------------------->

    case "Programming":
      return (
        // v1.0.0 <----------------------------------------------------------------
        // <div className="mt-1">
        //   <div className="relative">
        //     <pre className="bg-gray-800 text-gray-100 p-4 rounded-md">
        //       <code>
        //         <textarea
        //           value={value || ""}
        //           onChange={(e) => onChange(e.target.value)}
        //           className="sm:text-sm w-full h-64 bg-transparent text-white font-mono focus:outline-none resize-none"
        //           spellCheck="false"
        //           placeholder="// Write your code here..."
        //           disabled={disabled}
        //         />
        //       </code>
        //     </pre>
        //   </div>
        // </div>
        <div>
          <CodeEditor value={value} onChange={onChange} disabled={disabled} />
        </div>
        // v1.0.0 ---------------------------------------------------------------->
      );

    case "Number":
      // v1.0.0 <--------------------------------------------------------------------------------
      return (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm p-3 border"
          placeholder="Enter a number"
          disabled={disabled}
        />
      );
    // v1.0.0 -------------------------------------------------------------------------------->

    case "Boolean":
      // v1.0.0 <--------------------------------------------------------------------------------
      return (
        <div className="flex space-x-6">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`boolean-${questionId}`}
              value="true"
              checked={value === "true"}
              onChange={(e) => onChange(e.target.value)}
              className="sm:h-4 sm:w-4 h-5 w-5 accent-custom-blue text-custom-blue focus:ring-custom-blue"
              disabled={disabled}
            />
            <span className="ml-2 sm:text-sm md:text-md lg:text-lg xl:text-lg 2xl:text-lg">
              True
            </span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name={`boolean-${questionId}`}
              value="false"
              checked={value === "false"}
              onChange={(e) => onChange(e.target.value)}
              className="sm:h-4 sm:w-4 h-5 w-5 accent-custom-blue text-custom-blue focus:ring-custom-blue"
              disabled={disabled}
            />
            <span className="ml-2 sm:text-sm md:text-md lg:text-lg xl:text-lg 2xl:text-lg">
              False
            </span>
          </label>
        </div>
      );
    // v1.0.0 -------------------------------------------------------------------------------->

    case "Interview":
      // v1.0.0 <--------------------------------------------------------------------------------
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <textarea
              value={value?.answer || ""}
              onChange={(e) => onChange({ ...value, answer: e.target.value })}
              rows={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm p-3 border"
              placeholder="Type your detailed response here..."
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={value?.notes || ""}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm p-3 border"
              placeholder="Any additional notes..."
              disabled={disabled}
            />
          </div>
        </div>
      );
      // v1.0.0 -------------------------------------------------------------------------------->

    default:
      return (
        <p className="text-gray-500 sm:text-sm italic">
          No input method defined for this question type.
        </p>
      );
  }
};

function QuestionDisplay({ question, answers, handleAnswer, isReviewing }) {
  if (!question) return null;

  const type = question?.snapshot?.questionType;
  const options =
    type === "MCQ" && Array.isArray(question?.snapshot?.options)
      ? question.snapshot.options
      : [];

  return (
    // v1.0.0 <-------------------------
    <div className="sm:mx-4 mx-8">
      {/* v1.0.0 <------------------------- */}
      <div>
        {question?.snapshot?.hints?.length > 0 && (
          // v1.0.0 <----------------------------------------------------------------
          <div className="bg-blue-50 border-l-4 border-blue-400 sm:p-2 p-4 mb-6">
            {/* v1.0.0 ----------------------------------------------------------------> */}
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Hint:</span>{" "}
                  {question?.snapshot?.hints?.[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="">
          <AnswerInput
            questionType={type}
            options={options}
            value={answers[question._id] || ""}
            onChange={(value) => handleAnswer(question._id, value)}
            questionId={question._id}
            disabled={isReviewing}
          />
        </div>
      </div>
    </div>
  );
}

export default QuestionDisplay;
