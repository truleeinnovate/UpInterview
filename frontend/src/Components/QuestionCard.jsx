import {
    FileText,
    Plus,
    X,
    Video,
    ThumbsUp,
    ThumbsDown,
    XCircle,
} from "lucide-react";

// QuestionCard Component - Handles both view and edit modes
const QuestionCard = ({
    question,
    mode,
    onNoteAdd,
    onNoteChange,
    onLikeToggle,
    onDislikeToggle,
    DisLikeSection,
    dislikeQuestionId,
    RadioGroupInput,
    SharePopupSection,
    isViewMode
}) => {
    const questionId = question.questionId || question.id || question._id;
    const technology = question?.snapshot?.technology?.[0] ||
        question?.snapshot?.snapshot?.technology?.[0] ||
        question?.snapshot?.category?.[0] ||
        question?.snapshot?.snapshot?.category?.[0] ||
        "N/A";

    console.log("isViewMode", isViewMode)

    const difficulty = question.snapshot?.difficultyLevel ||
        question.snapshot?.snapshot?.difficultyLevel ||
        question.difficulty ||
        "N/A";

    const questionText = question.snapshot?.questionText ||
        question.snapshot?.snapshot?.questionText ||
        question.question ||
        "N/A";

    const expectedAnswer = question.snapshot?.correctAnswer ||
        question.snapshot?.snapshot?.correctAnswer ||
        question.expectedAnswer ||
        "N/A";

    const isMandatory = question.mandatory === "true" ||
        question.snapshot?.mandatory === "true";

    const isLiked = question.isLiked === "liked";
    const isDisliked = question.isLiked === "disliked";

    const showDislikeSection = (dislikeQuestionId === questionId || !!question.whyDislike) && isDisliked;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-3 hover:shadow-md transition-shadow duration-200">
            {/* Header Section - Responsive flex */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium w-fit">
                    {technology}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                    {difficulty}
                </span>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 leading-relaxed">
                {questionText}
            </h3>

            {/* Expected Answer Section */}
            <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                    Expected Answer:
                </p>
                <p className="text-xs sm:text-sm text-gray-700">
                    {expectedAnswer}
                </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-gray-500 text-xs mt-3">
                <span className="px-2 py-1 bg-gray-100 rounded">
                    Mandatory: {isMandatory ? "Yes" : "No"}
                </span>
            </div>

            {/* Action Section - Different for view/edit modes */}
            {mode === 'view' ? (
                <ViewModeActions
                    questionId={questionId}
                    isLiked={isLiked}
                    isDisliked={isDisliked}
                    onLikeToggle={onLikeToggle}
                    onDislikeToggle={onDislikeToggle}
                    RadioGroupInput={RadioGroupInput}
                    question={question}
                    isViewMode={isViewMode}
                />
            ) : (
                <EditModeActions
                    question={question}
                    questionId={questionId}
                    isLiked={isLiked}
                    isDisliked={isDisliked}
                    onNoteAdd={onNoteAdd}
                    onNoteChange={onNoteChange}
                    onLikeToggle={onLikeToggle}
                    onDislikeToggle={onDislikeToggle}
                    RadioGroupInput={RadioGroupInput}
                    SharePopupSection={SharePopupSection}
                />
            )}

            {/* Notes Section */}
            {mode === 'edit' && question.notesBool && (
                <NoteInput
                    questionId={questionId}
                    note={question.note || ''}
                    onNoteChange={onNoteChange}
                />
            )}

            {/* Why Dislike Section */}
            {mode === 'edit' && <DisLikeSection each={question} />}

            {/* View Mode Notes */}
            {mode === 'view' && question.notesBool && question.note && (
                <Note
                    content={question.note}
                    isViewMode={true}
                />
            )}
        </div>
    );
};

// View Mode Actions
const ViewModeActions = ({ questionId, isLiked, isDisliked, onLikeToggle, onDislikeToggle, RadioGroupInput, question, isViewMode }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100 ${isViewMode ? 'hidden' : ''}`}>
        <div className="w-full sm:w-auto">
            {RadioGroupInput && <RadioGroupInput each={question} />}
        </div>
        {/* {!isViewMode &&
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onLikeToggle(questionId)}
                    className={`transition-all hover:scale-110 p-1.5 rounded-full ${isLiked ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    aria-label="Like"
                >
                    <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                    onClick={() => onDislikeToggle(questionId)}
                    className={`transition-all hover:scale-110 p-1.5 rounded-full ${isDisliked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    aria-label="Dislike"
                >
                    <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>
        } */}
    </div>
);

// Edit Mode Actions
const EditModeActions = ({
    question, questionId, isLiked, isDisliked,
    onNoteAdd, onNoteChange, onLikeToggle, onDislikeToggle,
    RadioGroupInput, SharePopupSection
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="w-full sm:w-auto">
            <RadioGroupInput each={question} />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
                onClick={() => onNoteAdd(questionId)}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${question.notesBool
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-[#227a8a] text-white hover:bg-[#1b6270]'
                    }`}
            >
                {question.notesBool ? 'Delete Note' : 'Add Note'}
            </button>

            <SharePopupSection />

            <button
                onClick={() => onLikeToggle(questionId)}
                className={`transition-all hover:scale-110 p-1.5 rounded-full ${isLiked ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                aria-label="Like"
            >
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
                onClick={() => onDislikeToggle(questionId)}
                className={`transition-all hover:scale-110 p-1.5 rounded-full ${isDisliked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                aria-label="Dislike"
            >
                <ThumbsDown className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
        </div>
    </div>
);

// Note Input Component
const NoteInput = ({ questionId, note, onNoteChange }) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <label
            htmlFor={`note-${questionId}`}
            className="block text-sm font-medium text-gray-700 mb-2"
        >
            Note
        </label>
        <div className="relative">
            <textarea
                id={`note-${questionId}`}
                value={note}
                onChange={(e) => onNoteChange(questionId, e.target.value.slice(0, 250))}
                placeholder="Add your note here..."
                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#227a8a] focus:border-transparent resize-y text-sm"
                maxLength={250}
            />
            <span className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white bg-opacity-75 px-2 py-1 rounded">
                {note.length}/250
            </span>
        </div>
    </div>
);

// Note Display Component (View Mode)
const Note = ({ content, isViewMode }) => (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-xs font-medium text-blue-800 mb-1">Note:</p>
        <p className="text-sm text-gray-700">{content}</p>
    </div>
);

// Empty State Component
export const EmptyState = ({ message, subMessage, icon = "FileText" }) => {
    const IconComponent = icon === "FileText" ? FileText : FileText; // Add more icons as needed

    return (
        <div className="p-8 sm:p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-600 font-medium mb-1">
                {message}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
                {subMessage}
            </p>
        </div>
    );
};

export default QuestionCard;