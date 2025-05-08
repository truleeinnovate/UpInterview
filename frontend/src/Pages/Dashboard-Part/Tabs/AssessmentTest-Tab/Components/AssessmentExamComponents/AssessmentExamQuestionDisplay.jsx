function QuestionDisplay({ question, answers, handleAnswer, isReviewing }) {
    if (!question) return null;

    const type = question?.snapshot?.questionType;
    const options = (type === 'MCQ' && Array.isArray(question.snapshot.options))
        ? question.snapshot.options.map((opt) => ({
            id: opt,
            text: opt,
        }))
        : [];

    const renderQuestionContent = () => {
        switch (type) {
            case 'MCQ':
                return (
                    <div className="space-y-4">
                        {options.map((option) => (
                            <label
                                key={option.id}
                                className={`flex items-center space-x-4 p-6 border rounded-2xl transition-all duration-300 cursor-pointer
                                ${answers[question._id] === option.id
                                        ? 'bg-blue-50 border-blue-200 shadow-inner'
                                        : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={question._id}
                                    value={option.id}
                                    checked={answers[question._id] === option.id}
                                    onChange={() => handleAnswer(question._id, option.id)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                    disabled={isReviewing}
                                />
                                <span className="text-lg text-gray-900">{option.text}</span>
                            </label>
                        ))}
                    </div>
                );
            default:
                return (
                    <div className="text-gray-500 italic">
                        Question type "{type}" is not supported yet.
                    </div>
                );
        }
    };

    return (
        <div className="p-8">
            {renderQuestionContent()}
        </div>
    );
}

export default QuestionDisplay;