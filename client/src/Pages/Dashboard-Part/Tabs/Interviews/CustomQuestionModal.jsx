// import React, { useState } from "react";

// const CustomQuestionModal = ({ isOpen, onClose, onSave, initialCount }) => {
//     const [question, setQuestion] = useState("");
//     const [answer, setAnswer] = useState("");
//     const [mandatory, setMandatory] = useState(false);
//     const [difficulty, setDifficulty] = useState("Medium");
//     const [questionNumber, setQuestionNumber] = useState(initialCount);

//     const handleSave = () => {
//         if (question.trim() && answer.trim() && difficulty) {
//             onSave({
//                 QuestionNumber: questionNumber,
//                 Question: question,
//                 Answer: answer,
//                 mandatory,
//                 DifficultyLevel: difficulty,
//             });
//             setQuestion("");
//             setAnswer("");
//             setMandatory(false);
//             setDifficulty("Medium");
//             setQuestionNumber((prevNumber) => prevNumber + 1);
//             onClose();
//         } else {
//             alert("Please fill in the question, answer, and select difficulty.");
//         }
//     };

//     const handleSaveAndNext = () => {
//         if (question.trim() && answer.trim() && difficulty) {
//             onSave({
//                 QuestionNumber: questionNumber,
//                 Question: question,
//                 Answer: answer,
//                 mandatory,
//                 DifficultyLevel: difficulty,
//             });
//             setQuestion("");
//             setAnswer("");
//             setMandatory(false);
//             setDifficulty("Medium");
//             setQuestionNumber((prevNumber) => prevNumber + 1);
//         } else {
//             alert("Please fill in the question, answer, and select difficulty.");
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex justify-end bg-gray-900 bg-opacity-50">
//             <div className="bg-white h-full w-1/2 flex flex-col">
//                 <div className="flex justify-between items-center border-b bg-custom-blue text-white p-4">
//                     <h2 className="text-lg font-bold">Add Question</h2>
//                     <button onClick={onClose} className="text-white">
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-6 w-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M6 18L18 6M6 6l12 12"
//                             />
//                         </svg>
//                     </button>
//                 </div>
//                 <div className="flex-grow overflow-auto p-4">
//                     <div className="flex gap-5 mb-4 mt-4">
//                         <label className="block text-sm font-medium text-gray-900 dark:text-black w-36">
//                             Question <span className="text-red-500">*</span>
//                         </label>
//                         <div className="flex-grow">
//                             <textarea
//                                 value={question}
//                                 onChange={(e) => setQuestion(e.target.value)}
//                                 rows={1}
//                                 className="border-b focus:outline-none mb-5 w-full"
//                             ></textarea>
//                         </div>
//                     </div>
//                     <div className="flex gap-5 mb-4 mt-4">
//                         <label className="block text-sm font-medium text-gray-900 dark:text-black w-36">
//                             Answer <span className="text-red-500">*</span>
//                         </label>
//                         <div className="flex-grow">
//                             <textarea
//                                 value={answer}
//                                 onChange={(e) => setAnswer(e.target.value)}
//                                 rows={1}
//                                 className="border-b focus:outline-none mb-5 w-full"
//                             ></textarea>
//                         </div>
//                     </div>
//                     <div className="flex items-center mb-9 gap-[75px]">
//                         <label className="block text-sm font-medium text-gray-700 mr-2">
//                             Mandatory <span className="text-red-500">*</span>
//                         </label>
//                         <button
//                             onClick={() => setMandatory(!mandatory)}
//                             className={`w-10 h-5 ml- flex items-center rounded-full p-1 mb-1 border-2 ${mandatory
//                                 ? "bg-blue-100 border-custom-blue"
//                                 : "bg-gray-200 border-gray-300"
//                                 }`}
//                         >
//                             <span
//                                 className={`w-2 h-2 ${mandatory ? "bg-custom-blue" : "bg-gray-300"
//                                     } rounded-full transform transition ${mandatory ? "translate-x-5" : "translate-x-0"
//                                     }`}
//                             />
//                         </button>
//                     </div>
//                     <div className="flex items-center gap-5 mb-4">
//                         <label className="block text-sm font-medium text-gray-900 dark:text-black w-36">
//                             Difficulty Level <span className="text-red-500">*</span>
//                         </label>
//                         <div className="flex gap-3">
//                             {['Easy', 'Medium', 'Hard'].map((level) => (
//                                 <button
//                                     key={level}
//                                     onClick={() => setDifficulty(level)}
//                                     className={`px-4 py- border rounded ${difficulty === level
//                                         ? level === 'Easy'
//                                             ? 'bg-[#FFC000] text-white'
//                                             : level === 'Medium'
//                                                 ? 'bg-[#3AA20D] text-white'
//                                                 : 'bg-[#FF0000] text-white'
//                                         : level === 'Easy'
//                                             ? 'border-[#FFC000] text-black'
//                                             : level === 'Medium'
//                                                 ? 'border-[#3AA20D] text-black'
//                                                 : 'border-[#FF0000] text-black'
//                                         }`}
//                                 >
//                                     {level}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//                 <div className="flex items-center justify-center mb-4">
//                     <p className="border rounded px-5 bg-custom-blue bg-opacity-20">{questionNumber + 1}</p>
//                 </div>
//                 <div className="border-t p-2 flex justify-end space-x-3">
//                     <button
//                         onClick={handleSave}
//                         className="px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded"
//                     >
//                         Save
//                     </button>

//                     <button
//                         onClick={handleSaveAndNext}
//                         className="px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded"
//                     >
//                         Save & Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CustomQuestionModal;


import React from 'react'

const CustomQuestionModal = () => {
  return (
    <div>CustomQuestionModal</div>
  )
}

export default CustomQuestionModal