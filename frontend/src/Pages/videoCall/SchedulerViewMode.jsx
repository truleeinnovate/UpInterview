import { useState } from "react";
import { SlLike, SlDislike } from "react-icons/sl";
import { FileText } from "lucide-react";

export const SchedulerViewMode = ({ feedbackData, isViewMode }) => {
  const {
    candidate,
    interviewRound,
    position,
    feedbacks = [],
    interviewQuestions = {}
  } = feedbackData || {};

  // Track which feedback is active
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState(0);

  const activeFeedback = feedbacks[activeFeedbackIndex] || {};

  const {
    overallImpression = {},
    skills = [],
    generalComments = "",
    questionFeedback = []
  } = activeFeedback;

  // Combine preselected + interviewer-added questions
  const allQuestions = [
    ...(interviewQuestions.preselectedQuestions || []),
    ...(interviewQuestions.interviewerAddedQuestions || [])
  ];

  // Build question details map
  const questionDetailsMap = {};
  allQuestions.forEach((q) => {
    const id = q.questionId || q._id;
    if (id) questionDetailsMap[id] = q.snapshot || {};
  });

  // Merge question feedback
  const questionsWithDetails = questionFeedback.map((qf) => ({
    ...qf,
    snapshot: questionDetailsMap[qf.questionId] || {}
  }));

  const renderStarRating = (rating) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={true}
          className={`w-6 h-6 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <FileText
          className="h-5 w-5 mr-2"
          style={{ color: "rgb(33, 121, 137)" }}
        />
        <h3 className="text-lg font-medium text-gray-900">
          Interview Feedback - Scheduler View
        </h3>
      </div>

      {/* Feedback Tabs */}
      {feedbacks.length > 1 && (
        <div className="flex gap-3 mb-6">
          {feedbacks.map((fb, idx) => (
            <button
              key={fb._id || idx}
              onClick={() => setActiveFeedbackIndex(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                activeFeedbackIndex === idx
                  ? "bg-[#217989] text-white border-[#217989]"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              Feedback {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Overall Rating</h4>
            <div className="flex items-center">
              {renderStarRating(overallImpression?.overallRating || 0)}
              <span className="ml-2 text-sm text-gray-600">
                {overallImpression?.overallRating || 0}/5
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Communication Rating
            </h4>
            <div className="flex items-center">
              {renderStarRating(overallImpression?.communicationRating || 0)}
              <span className="ml-2 text-sm text-gray-600">
                {overallImpression?.communicationRating || 0}/5
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Skill Ratings</h4>
          {skills.length > 0 ? (
            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-sm text-gray-800">
                      {skill.skillName}
                    </div>
                    <div className="flex items-center">
                      {renderStarRating(skill.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {skill.rating}/5
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {skill.note || "No comments"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No skills rated</p>
          )}
        </div>

        {/* Questions */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            Questions & Feedback
          </h4>
          {questionsWithDetails.length > 0 ? (
            <div className="space-y-4">
              {questionsWithDetails.map((question, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
                      {question.snapshot?.skill ||
                        question.snapshot?.category ||
                        "N/A"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {question.snapshot?.difficultyLevel ||
                        question.snapshot?.difficulty ||
                        "N/A"}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-2">
                    {question.snapshot?.questionText ||
                      question.question ||
                      "N/A"}
                  </h3>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Expected Answer:
                    </p>
                    <p className="text-sm text-gray-700">
                      {question.snapshot?.correctAnswer ||
                        question.snapshot?.expectedAnswer ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Candidate Response:
                    </p>
                    <p className="text-sm text-gray-800">
                      {question.candidateAnswer?.answerType || "Not answered"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={
                        question.interviewerFeedback?.liked === "liked"
                          ? "text-green-700"
                          : ""
                      }
                    >
                      <SlLike />
                    </span>
                    <span
                      className={
                        question.interviewerFeedback?.liked === "disliked"
                          ? "text-red-500"
                          : ""
                      }
                    >
                      <SlDislike />
                    </span>
                  </div>

                  {question.interviewerFeedback?.dislikeReason && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">
                        Dislike Reason:
                      </p>
                      <p className="text-sm text-gray-800">
                        {question.interviewerFeedback.dislikeReason}
                      </p>
                    </div>
                  )}

                  {question.interviewerFeedback?.note && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-600">
                        Interviewer Note:
                      </p>
                      <p className="text-sm text-gray-800">
                        {question.interviewerFeedback.note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No questions answered yet</p>
          )}
        </div>

        {/* Overall Comments */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Overall Comments</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">
              {generalComments || "No comments provided"}
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Recommendation</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">
              {overallImpression?.recommendation ||
                "No recommendation provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// import { SlLike } from "react-icons/sl";
// import { SlDislike } from "react-icons/sl";
// import { FileText } from "lucide-react";

// export const SchedulerViewMode = ({ feedbackData, isViewMode }) => {
//   // Extract data from feedbackData structure
//   const {
//     candidate,
//     interviewRound,
//     position,
//     feedbacks = [],
//     interviewQuestions = {}
//   } = feedbackData || {};

//   console.log("Feedback data for scheduler view:", feedbackData);

//   // Get the first feedback (since there may be multiple)
//   const feedback = feedbacks.length > 0 ? feedbacks[0] : {};
  
//   // Extract feedback details
//   const {
//     overallImpression = {},
//     skills = [],
//     generalComments = '',
//     questionFeedback = []
//   } = feedback;

//   // Combine preselected and interviewer-added questions
//   const allQuestions = [
//     ...(interviewQuestions.preselectedQuestions || []),
//     ...(interviewQuestions.interviewerAddedQuestions || [])
//   ];

//   // Create a map of question details by ID
//   const questionDetailsMap = {};
//   allQuestions.forEach(q => {
//     const id = q.questionId || q._id;
//     if (id) {
//       questionDetailsMap[id] = q.snapshot || {};
//     }
//   });

//   // Combine question feedback with question details
//   const questionsWithDetails = questionFeedback.map(qf => ({
//     ...qf,
//     snapshot: questionDetailsMap[qf.questionId] || {}
//   }));

// //   console.log("Processed feedback data for scheduler view:", {
// //     candidate,
// //     interviewRound,
// //     position,
// //     overallImpression,
// //     skills,
// //     generalComments,
// //     questionsWithDetails
// //   });

//   const renderStarRating = (rating) => {
//     return (
//       <div className="flex">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <button
//             key={star}
//             type="button"
//             disabled={true}
//             className={`w-6 h-6 ${star <= rating
//                 ? 'text-yellow-400 fill-current'
//                 : 'text-gray-300'
//               }`}
//           >
//             ★
//           </button>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="bg-white rounded-lg p-6 shadow-sm">
//       <div className="flex items-center mb-6">
//         <FileText className="h-5 w-5 mr-2" style={{ color: 'rgb(33, 121, 137)' }} />
//         <h3 className="text-lg font-medium text-gray-900">Interview Feedback - Scheduler View</h3>
//       </div>

//       <div className="space-y-6">
//         {/* Candidate Info */}
//         {/* <div className="bg-gray-50 p-4 rounded-lg">
//           <h4 className="font-medium text-gray-700 mb-2">Candidate Information</h4>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Name</p>
//               <p className="font-medium">{candidate?.FirstName} {candidate?.LastName}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Email</p>
//               <p className="font-medium">{candidate?.Email}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Phone</p>
//               <p className="font-medium">{candidate?.Phone}</p>
//             </div>
//           </div>
//         </div>

        
//         <div className="bg-gray-50 p-4 rounded-lg">
//           <h4 className="font-medium text-gray-700 mb-2">Interview Details</h4>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Round</p>
//               <p className="font-medium">{interviewRound?.roundTitle || `Round ${interviewRound?.sequence}`}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Position</p>
//               <p className="font-medium">{position?.title}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Company</p>
//               <p className="font-medium">{position?.companyname}</p>
//             </div>
//           </div>
//           {interviewRound?.meetingId && (
//             <div className="mt-3">
//               <p className="text-sm text-gray-500">Meeting Link</p>
//               <p className="font-medium text-blue-600">
//                 <a href={interviewRound.meetingId} target="_blank" rel="noopener noreferrer">
//                   {interviewRound.meetingId}
//                 </a>
//               </p>
//             </div>
//           )}
//         </div> */}

//         {/* Interview Round Info */}

//         {/* Ratings */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h4 className="font-medium text-gray-700 mb-2">Overall Rating</h4>
//             <div className="flex items-center">
//               {renderStarRating(overallImpression?.overallRating || 0)}
//               <span className="ml-2 text-sm text-gray-600">{overallImpression?.overallRating || 0}/5</span>
//             </div>
//           </div>
//           <div>
//             <h4 className="font-medium text-gray-700 mb-2">Communication Rating</h4>
//             <div className="flex items-center">
//               {renderStarRating(overallImpression?.communicationRating || 0)}
//               <span className="ml-2 text-sm text-gray-600">{overallImpression?.communicationRating || 0}/5</span>
//             </div>
//           </div>
//         </div>

//         {/* Skills */}
//         <div>
//           <h4 className="font-medium text-gray-700 mb-2">Skill Ratings</h4>
//           {skills.length > 0 ? (
//             <div className="space-y-3">
//               {skills.map((skill, index) => (
//                 <div key={index} className="p-3 bg-gray-50 rounded-md">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <div className="text-sm text-gray-800">
//                       {skill.skillName}
//                     </div>
//                     <div className="flex items-center">
//                       {renderStarRating(skill.rating)}
//                       <span className="ml-2 text-sm text-gray-600">{skill.rating}/5</span>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {skill.note || 'No comments'}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-sm">No skills rated</p>
//           )}
//         </div>

//         {/* Questions */}
//         <div>
//           <h4 className="font-medium text-gray-700 mb-2">Questions & Feedback</h4>
//           {questionsWithDetails.length > 0 ? (
//             <div className="space-y-4">
//               {questionsWithDetails.map((question, index) => (
//                 <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                   <div className="flex items-start justify-between mb-3">
//                     <span className="px-3 py-1 bg-[#217989] bg-opacity-10 text-[#217989] rounded-full text-sm font-medium">
//                       {question.snapshot?.skill || question.snapshot?.category || 'N/A'}
//                     </span>
//                     <span className="text-sm text-gray-500">
//                       {question.snapshot?.difficultyLevel || question.snapshot?.difficulty || 'N/A'}
//                     </span>
//                   </div>

//                   <h3 className="font-semibold text-gray-800 mb-2">
//                     {question.snapshot?.questionText || question.question || 'N/A'}
//                   </h3>

//                   <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                     <p className="text-sm font-medium text-gray-600 mb-2">Expected Answer:</p>
//                     <p className="text-sm text-gray-700">
//                       {question.snapshot?.correctAnswer || question.snapshot?.expectedAnswer || 'N/A'}
//                     </p>
//                   </div>

//                   <div className="mt-4">
//                     <p className="text-sm font-medium text-gray-600 mb-1">Candidate Response:</p>
//                     <p className="text-sm text-gray-800">
//                       {question.candidateAnswer?.answerType || 'Not answered'}
//                     </p>
//                   </div>

//                   <div className="flex items-center gap-2 mt-2">
//                     <span className={question.interviewerFeedback?.liked === "liked" ? "text-green-700" : ""}>
//                       <SlLike />
//                     </span>
//                     <span className={question.interviewerFeedback?.liked === "disliked" ? "text-red-500" : ""}>
//                       <SlDislike />
//                     </span>
//                   </div>

//                   {question.interviewerFeedback?.dislikeReason && (
//                     <div className="mt-2">
//                       <p className="text-sm font-medium text-gray-600">Dislike Reason:</p>
//                       <p className="text-sm text-gray-800">{question.interviewerFeedback.dislikeReason}</p>
//                     </div>
//                   )}

//                   {question.interviewerFeedback?.note && (
//                     <div className="mt-2">
//                       <p className="text-sm font-medium text-gray-600">Interviewer Note:</p>
//                       <p className="text-sm text-gray-800">{question.interviewerFeedback.note}</p>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-sm">No questions answered yet</p>
//           )}
//         </div>

//         {/* Overall Comments */}
//         <div>
//           <h4 className="font-medium text-gray-700 mb-2">Overall Comments</h4>
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <p className="text-gray-800">{generalComments || "No comments provided"}</p>
//           </div>
//         </div>

//         {/* Recommendation */}
//         <div>
//           <h4 className="font-medium text-gray-700 mb-2">Recommendation</h4>
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <p className="text-gray-800">{overallImpression?.recommendation || "No recommendation provided"}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };