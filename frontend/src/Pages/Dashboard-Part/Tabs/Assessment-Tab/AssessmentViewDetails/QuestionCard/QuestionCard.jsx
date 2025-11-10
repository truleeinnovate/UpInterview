// v1.0.0 - Ashok - fixed issues

const QuestionCard = ({ question }) => {
  const { questionText, questionType, options, correctAnswer } =
    question.snapshot;

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "border-white rounded-md px-2 py-1 bg-[#81C784]";
      case "Medium":
        return "border-white rounded-md px-2 py-1 bg-[#FFD54F]";
      case "Hard":
        return "border-white rounded-md px-2 py-1 bg-[#E57373]";
      default:
        return "";
    }
  };

  const renderByType = () => {
    switch (questionType) {
      case "MCQ":
        // Extract the actual answer text from "C) number"

        return (
          <div>
            {/* Options grid */}
            <div className="grid grid-cols-2">
              {options.map((option, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center p-3 rounded-lg transition-colors"
                  >
                    <span>{option}</span>
                  </div>
                );
              })}
            </div>

            {/* Correct answer below */}
            <div className="flex items-center gap-2 p-3">
              <span className="text-gray-600">Answer:</span>
              <span className="text-gray-900 font-medium">{correctAnswer}</span>
            </div>
          </div>
        );

      case "Short":
      case "Long":
        return (
          <p className="mt-2 text-gray-700">
            <span className="font-medium text-gray-800">Answer:</span>{" "}
            {correctAnswer || "—"}
          </p>
        );

      case "Programming":
        return (
          <pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm font-mono overflow-x-auto text-gray-800">
            {correctAnswer || "// No code provided"}
          </pre>
        );

      case "Number":
      case "Boolean":
        return (
          <p className="mt-2 text-gray-700">
            <span className="font-medium text-gray-800">Answer:</span>{" "}
            {String(correctAnswer) || "—"}
          </p>
        );

      default:
        return (
          <p className="mt-2 text-gray-500 italic">Unsupported question type</p>
        );
    }
  };

  return (
    <div className="shadow-sm border rounded-2xl bg-white">
      <div className="flex items-center justify-end mb-2 border rounded-2xl border-t-0 border-l-0 border-r-0 rounded-b-none border-b py-2 px-4">
        {/* Type Label */}
        {/* <span className="flex items-center justify-center text-sm py-1 px-2 rounded-md bg-custom-blue text-white tracking-wide">
          {questionType}
        </span> */}
        {/* Difficulty Badge */}
        <span
          className={`text-sm w-16 text-center ${getDifficultyStyles(
            question?.snapshot?.difficultyLevel
          )} rounded-md py-0.5`}
        >
          {question?.snapshot?.difficultyLevel}
        </span>
      </div>
      {/* Header Row */}

      <div className="flex items-start justify-between mb-2 py-2 px-4">
        <p className="font-medium text-gray-900 pr-2">
          {question?.order}. {questionText}
        </p>
      </div>
      <div className="border border-t border-b-0 border-l-0 border-r-0">
        <div className="py-2 px-4">{renderByType()}</div>
      </div>
    </div>
  );
};

export default QuestionCard;
