// import React, { useCallback, useEffect, useState } from "react";
// import { ReactComponent as FiFilter } from "../../../../icons/FiFilter.svg";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { ReactComponent as MdOutlineCancel } from "../../../../icons/MdOutlineCancel.svg";
// import { ReactComponent as IoIosArrowUp } from "../../../../icons/IoIosArrowUp.svg";
// import { ReactComponent as IoIosArrowDown } from "../../../../icons/IoIosArrowDown.svg";
// import { set } from "date-fns";

// const AddInterviewScheduleQuestions = ({ isOpen, onClose, categoryName, skills, onSave, alreadyAddedQuestions }) => {
//     const [questions, setQuestions] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [selectedQuestions, setSelectedQuestions] = useState([]);
//     const [removedQuestions, setRemovedQuestions] = useState([]);
//     const [error, setError] = useState(null);
//     const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
//     const [allSkills, setAllSkills] = useState(skills);
//     const [filteredSkills, setFilteredSkills] = useState(skills);
//     const [createdLists, setCreatedLists] = useState([]);
//     const [filterSkills] = useState(skills);
//     const [openList, setOpenList] = useState(null);
//     const userId = Cookies.get("userId");
//     const [suggestedQuestions, setSuggestedQuestions] = useState([]);

//     useEffect(() => {
//         if (isOpen) {
//             setAllSkills(skills);
//             setFilteredSkills(skills);
//         }
//     }, [skills, isOpen]);

//     // useEffect(() => {
//     //     const fetchQuestionsForAllSkills = async () => {
//     //         try {
//     //             setQuestions([]);
//     //             setLoading(true);
//     //             setError(null);
//     //             // let updatedCreatedLists = [];
//     //             for (const skill of allSkills) {
//     //                 let response;

//     //                 if (categoryName === "My Questions") {
//     //                     response = await axios.get(
//     //                         `${process.env.REACT_APP_API_URL}/newquestion/${skill}`,
//     //                         { params: { OwnerId: userId } }
//     //                     );
//     //                 } else if (categoryName === "Suggested Questions") {
//     //                     response = await axios.get(
//     //                         `${process.env.REACT_APP_API_URL}/suggestedquestions/${skill}`,
//     //                         { params: { userId: userId } }
//     //                     );
//     //                 } else if (categoryName === "Favorite Questions List") {
//     //                     const favoriteResponse = await axios.get(
//     //                         `${process.env.REACT_APP_API_URL}/api/lists/${userId}`,
//     //                         { params: { skillName: skill } }
//     //                     );
//     //                     setCreatedLists(favoriteResponse);
//     //                     console.log("Favorite Questions:", favoriteResponse.data);
//     //                     console.log("skill:", skill);

//     //                     // const favoriteQuestions = favoriteResponse.data;
//     //                     const suggestedQuestionsResponse = await axios.get(
//     //                         `${process.env.REACT_APP_API_URL}/suggestedquestions/${skill}`
//     //                     );
//     //                     setSuggestedQuestions(suggestedQuestionsResponse.data);
//     //                     console.log("Suggested Questions:", suggestedQuestionsResponse.data);
//     //                     continue;
//     //                 } else {
//     //                     console.error("Unknown categoryName:", categoryName);
//     //                     return;
//     //                 }
//     //                 if (response.data.length === 0) {
//     //                     console.log(`No questions found for category: ${categoryName} and skill: ${skill}`);
//     //                 } else {
//     //                     setQuestions((prevQuestions) => [...prevQuestions, ...response.data]);
//     //                 }
//     //             }

//     //         } catch (err) {
//     //             console.error("Error fetching questions:", err.message);
//     //             setError("There was an issue fetching questions. Please try again later.");
//     //         } finally {
//     //             setLoading(false);
//     //         }
//     //     };
//     //     fetchQuestionsForAllSkills();
//     // }, [allSkills, userId, categoryName]);

//     useEffect(() => {
//         const fetchQuestionsForAllSkills = async () => {
//             try {
//                 setQuestions([]);  // Reset questions before fetching new data
//                 setLoading(true);   // Set loading to true before starting the fetch process
//                 setError(null);     // Clear previous errors

//                 let allFetchedQuestions = []; // Store all fetched questions
//                 let allSuggestedQuestions = []; // Store all suggested questions

//                 // Fetch questions for each skill
//                 for (const skill of allSkills) {
//                     let response;

//                     if (categoryName === "My Questions") {
//                         response = await axios.get(
//                             `${process.env.REACT_APP_API_URL}/newquestion/${skill}`,
//                             { params: { OwnerId: userId } }
//                         );
//                     } else if (categoryName === "Suggested Questions") {
//                         response = await axios.get(
//                             `${process.env.REACT_APP_API_URL}/suggestedquestions/${skill}`,
//                             { params: { userId: userId } }
//                         );
//                         allSuggestedQuestions = [...allSuggestedQuestions, ...response.data]; // Collect suggested questions for all skills
//                     } else if (categoryName === "Favorite Questions List") {
//                         const favoriteResponse = await axios.get(
//                             `${process.env.REACT_APP_API_URL}/api/lists/${userId}`,
//                             { params: { skillName: skill } }
//                         );
//                         setCreatedLists(favoriteResponse.data); // Set the created lists once the data is fetched
//                         console.log("Favorite Questions:", favoriteResponse.data);

//                         // Get suggested questions for the "Favorite Questions List" category
//                         const suggestedQuestionsResponse = await axios.get(
//                             `${process.env.REACT_APP_API_URL}/suggestedquestions/${skill}`
//                         );
//                         allSuggestedQuestions = [...allSuggestedQuestions, ...suggestedQuestionsResponse.data]; // Collect suggested questions
//                         console.log("Suggested Questions:", suggestedQuestionsResponse.data);
//                         continue;
//                     } else {
//                         console.error("Unknown categoryName:", categoryName);
//                         return;
//                     }

//                     // Check if there are any questions, and append to the array
//                     if (response.data.length === 0) {
//                         console.log(`No questions found for category: ${categoryName} and skill: ${skill}`);
//                     } else {
//                         allFetchedQuestions = [...allFetchedQuestions, ...response.data]; // Append all fetched questions
//                     }
//                 }

//                 // After fetching all questions, update state
//                 setQuestions(allFetchedQuestions); // Set all questions
//                 setSuggestedQuestions(allSuggestedQuestions); // Set combined suggested questions

//             } catch (err) {
//                 console.error("Error fetching questions:", err.message);
//                 setError("There was an issue fetching questions. Please try again later.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchQuestionsForAllSkills();

//     }, [allSkills, userId, categoryName]);

//     const fetchLists = useCallback(async () => {
//         try {
//             const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/lists/${userId}`);
//             setCreatedLists(response.data);
//         } catch (error) {
//             console.error('Error fetching lists:', error);
//         }
//     }, [userId]);

//     useEffect(() => {
//         fetchLists();
//     }, [fetchLists]);

//     const handleFilterChange = (skill) => {
//         if (filteredSkills.includes(skill)) {
//             setFilteredSkills(filteredSkills.filter((s) => s !== skill));
//             setAllSkills(allSkills.filter((s) => s !== skill));
//         } else {
//             setFilteredSkills([...filteredSkills, skill]);
//             setAllSkills([...allSkills, skill]);
//         }
//     };

//     const toggleFilterPopup = () => {
//         setIsFilterPopupOpen(!isFilterPopupOpen);
//     };

//     const removeSkill = (skillToRemove) => {
//         setAllSkills(allSkills.filter((skill) => skill !== skillToRemove));
//         setFilteredSkills(filteredSkills.filter((skill) => skill !== skillToRemove));
//     };

//     useEffect(() => {
//         if (isOpen) {
//             setSelectedQuestions(() =>
//                 alreadyAddedQuestions.map((q) => ({
//                     ...q,
//                     mandatory: q.mandatory || false,
//                 }))
//             );
//             setRemovedQuestions([]);
//         }
//     }, [isOpen, alreadyAddedQuestions]);

//     const toggleList = (listId) => {
//         setOpenList(openList === listId ? null : listId);
//     };
//     const [isOpentoggle, setIsOpentoggle] = useState({});

//     const toggleSection = (section) => {
//         setIsOpentoggle((prevState) => ({
//             ...prevState,
//             [section]: !prevState[section],
//         }));
//     };

//     const renderFavoriteQuestionsSections = () => {
//         if (!createdLists.length || !suggestedQuestions.length) {
//             return <p>No created lists or suggested questions available.</p>;
//         }

//         const suggestedQuestionsMap = suggestedQuestions.reduce((acc, question) => {
//             acc[question._id] = question;
//             return acc;
//         }, {});

//         console.log("suggestedQuestionsMap:", suggestedQuestionsMap);

//         return createdLists.map((list) => {
//             const matchedQuestions = list.questions
//                 .map((questionId) => {
//                     const matchedQuestion = suggestedQuestionsMap[questionId];
//                     console.log(`Matching questionId: ${questionId}`, matchedQuestion);
//                     return matchedQuestion;
//                 })
//                 .filter(Boolean);

//             console.log("matchedQuestions:", matchedQuestions);

//             return (
//                 <div key={list._id} className="mt-4">
//                     <div
//                         className={`flex space-x-8 p-2 text-md justify-between items-center bg-custom-blue text-white font-semibold pr-5 cursor-pointer ${isOpen[list._id] ? 'rounded-t-md' : 'rounded-md'}`}
//                     >
//                         <p className="pr-4 ml-2 w-1/4">{list.name}</p>
//                         <p className="rounded px-3 py-2 ml-4 text-white cursor-pointer text-center">
//                             No.of Questions &nbsp; ({matchedQuestions.length})
//                         </p>
//                         <div className="relative">
//                             <div className="flex items-center">
//                                 <div className={`flex items-center text-3xl ml-3 mr-3 text-white`} onClick={() => toggleSection(list._id)}>
//                                     {isOpentoggle[list._id] ? <IoIosArrowUp /> : <IoIosArrowDown />}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     {isOpentoggle[list._id] && (
//                         <div className={`p-4 bg-[#eaf7fa] ${isOpentoggle[list._id] ? 'rounded-b-md' : 'rounded-md'} border-t border-custom-blue`}>
//                             {matchedQuestions.length > 0 ? (
//                                 matchedQuestions.map((question, index) => (
//                                     <div
//                                         key={question._id}
//                                         className="border border-gray-300 mb-4 bg-white rounded-md"
//                                     >
//                                         <div className="flex justify-between items-center border-b pb-2 mb-2 p-2">
//                                             <p className="flex">
//                                                 {/* Checkbox */}
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={selectedQuestions.some((q) => q._id === question._id)}
//                                                     onChange={() => handleCheckboxChange(question)}
//                                                     className="mr-2"
//                                                 />
//                                                 <span
//                                                     className="text-lg font-semibold ml-4"
//                                                     style={{ width: "120px" }}
//                                                 >
//                                                     {index + 1}.
//                                                 </span>
//                                                 <span className="opacity-75 text-lg font-semibold -ml-24">
//                                                     {question.Question}
//                                                 </span>
//                                             </p>
//                                             <div className="flex items-center">
                                               
//                                                 {/* Difficulty Level */}
//                                                 <span
//                                                     className={`text-sm font-semibold w-20 text-center rounded py-1 ${question.DifficultyLevel === "Easy"
//                                                         ? "bg-[#FFC000]"
//                                                             : question.DifficultyLevel === "Medium"
//                                                             ? "bg-[#3AA20D]"
//                                                             : "bg-[#FF0000]"
//                                                         }`}
//                                                     title="Difficulty Level"
//                                                 >
//                                                     {question.DifficultyLevel}
//                                                 </span>
//                                                 <div className="border-r border-gray-300 h-6 mx-2"></div>
//                                                 {/* Mandatory Toggle */}
//                                                 <div className="flex items-center">
//                                                     <p className="text-gray-700 mr-2">Mandatory</p>
//                                                     <button
//                                                         onClick={() => handleMandatoryToggle(question._id)}
//                                                         className={`w-10 h-5 flex items-center rounded-full p-1 border-2 ${getMandatoryStatus(question._id)
//                                                                 ? "bg-blue-100 border-custom-blue"
//                                                                 : "bg-gray-200 border-gray-300"
//                                                             }`}
//                                                     >
//                                                         <span
//                                                             className={`w-2 h-2 rounded-full transform transition ${getMandatoryStatus(question._id)
//                                                                     ? "bg-custom-blue translate-x-5"
//                                                                     : "bg-gray-300 translate-x-0"
//                                                                 }`}
//                                                         />
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="mt-2 ml-10">
//                                             {question.Options && question.Options.length > 0 && (
//                                                 <ul className="list-none">
//                                                     {(() => {
//                                                         const isAnyOptionLong = question.Options.some(
//                                                             (option) => option.length > 55
//                                                         );

//                                                         return question.Options.map((option, idx) => (
//                                                             <li
//                                                                 key={idx}
//                                                                 style={{
//                                                                     display: isAnyOptionLong ? "block" : "inline-block",
//                                                                     width: isAnyOptionLong ? "100%" : "50%",
//                                                                     marginBottom: "0.5rem",
//                                                                 }}
//                                                             >
//                                                                 <span style={{ marginRight: "0.5rem" }}>
//                                                                     {String.fromCharCode(97 + idx)})
//                                                                 </span>
//                                                                 <span>{option}</span>
//                                                             </li>
//                                                         ));
//                                                     })()}
//                                                 </ul>
//                                             )}
//                                         </div>

//                                         <div className="mt-2 ml-10 mb-2">
//                                             <span className="text-sm font-semibold">Answer: </span>
//                                             <span className="opacity-75 text-sm text-gray-800">
//                                                 {question.QuestionType === "MCQ" && question.Options
//                                                     ? `${String.fromCharCode(
//                                                         97 + question.Options.indexOf(question.Answer)
//                                                     )}) `
//                                                     : ""}
//                                                 {question.Answer}
//                                             </span>
//                                         </div>
//                                     </div>

//                                 ))
//                             ) : (
//                                 <p>No questions to display yet.</p>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             );
//         });
//     };



//     const handleSave = () => {
//         const filteredSelectedQuestions = selectedQuestions.filter((question) => {
//             if (categoryName === "Suggested Questions" && question.category === "My Questions") {
//                 return false;
//             }
//             return true;
//         });
//         onSave(filteredSelectedQuestions, removedQuestions);
//         setSelectedQuestions([]);
//         setRemovedQuestions([]);
//         onClose();
//     };

//     const handleCheckboxChange = (question) => {
//         const isSelected = selectedQuestions.some((q) => q._id === question._id);
//         const isAlreadyAdded = alreadyAddedQuestions.some((q) => q._id === question._id);
//         if (isSelected) {
//             setSelectedQuestions(selectedQuestions.filter((q) => q._id !== question._id));
//             if (isAlreadyAdded) {
//                 setRemovedQuestions([...removedQuestions, question]);
//             }
//         } else {
//             setSelectedQuestions([
//                 ...selectedQuestions,
//                 { ...question, category: categoryName },
//             ]);
//             setRemovedQuestions(removedQuestions.filter((q) => q._id !== question._id));
//         }
//     };

//     const handleMandatoryToggle = (id) => {
//         setSelectedQuestions((prev) =>
//             prev.map((q) =>
//                 q._id === id ? { ...q, mandatory: !q.mandatory } : q
//             )
//         );
//     };

//     const getMandatoryStatus = (id) =>
//         selectedQuestions.find((q) => q._id === id)?.mandatory || false;

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//             <div className="bg-white shadow-lg flex flex-col" style={{ width: "97%", height: "94%" }}>
//                 <div className="border-b p-2 bg-custom-blue text-white">
//                     <div className="mx-6 my-1 flex justify-between items-center">
//                         <p className="text-xl font-semibold">{categoryName}</p>
//                         <button className="shadow-lg rounded-full" onClick={onClose}>
//                             <MdOutlineCancel className="text-2xl" />
//                         </button>
//                     </div>
//                 </div>
//                 <div className="flex justify-between items-center mb-2 ml-8">
//                     <div className="flex flex-wrap gap-4 mt-2">
//                         {allSkills.map((skill, index) => (
//                             <div
//                                 key={index}
//                                 className="flex items-center border border-custom-blue text-xs justify-between bg-gray-100 text-custom-blue px-3 py-1 rounded-md shadow-sm"
//                             >
//                                 <span>{skill}</span>
//                                 <button
//                                     onClick={() => removeSkill(skill)}
//                                     className="ml-2 text-custom-blue hover:underline"
//                                     aria-label={`Remove ${skill}`}
//                                 >
//                                     ✕
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="mt-2">
//                         <button onClick={toggleFilterPopup} className="relative border rounded-md right-12 p-1">
//                             <FiFilter className="text-custom-blue" />
//                         </button>
//                         {isFilterPopupOpen && (
//                             <div className="absolute right-14 mt-2 bg-white border rounded shadow-xl w-48 z-50">
//                                 <div className="py-1">
//                                     <p className="border-b px-3 font-semibold">Filters</p>
//                                     <div className="px-3 py-1">
//                                         <label className="flex items-center space-x-2">
//                                             <input
//                                                 type="checkbox"
//                                                 className="form-checkbox h-4 w-4"
//                                                 checked={filteredSkills.length === filterSkills.length}
//                                                 onChange={(e) => {
//                                                     if (e.target.checked) {
//                                                         setFilteredSkills(filterSkills);
//                                                         setAllSkills(filterSkills);
//                                                     } else {
//                                                         setFilteredSkills([]);
//                                                         setAllSkills([]);
//                                                     }
//                                                 }}
//                                             />
//                                             <span className="font-semibold" >Skill/Technology</span>
//                                         </label>
//                                     </div>
//                                     {filterSkills.map((skill) => (
//                                         <div key={skill} className="px-3 py-1">
//                                             <label className="flex items-center space-x-2">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={filteredSkills.includes(skill)}
//                                                     onChange={() => handleFilterChange(skill)}
//                                                 />
//                                                 <span>{skill}</span>
//                                             </label>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <div className="flex-grow overflow-auto">
//                     <div className="mx-8 mt-3">
//                         {loading && <p>Loading questions...</p>}
//                         {error && <p>{error}</p>}
//                         {!loading && !error && questions.length === 0 && categoryName !== "Favorite Questions List" && (
//                             <p>No questions available for the selected skill in the "{categoryName}" category.</p>
//                         )}
//                         {!loading && !error && categoryName === "Favorite Questions List" ? (
//                             renderFavoriteQuestionsSections()
//                         ) : (
//                             questions.map((question, index) => (
//                                 <div
//                                     key={question._id}
//                                     className="border rounded-md hover:shadow-lg transition mb-3"
//                                 >
//                                     <div className="flex justify-between px-2 border-b">
//                                         <div className="flex items-center space-x-2">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedQuestions.some(
//                                                     (q) => q._id === question._id
//                                                 )}
//                                                 onChange={() => handleCheckboxChange(question)}
//                                             />
//                                             <h4 className="font-medium">
//                                                 {index + 1}. {question.Question}
//                                             </h4>
//                                         </div>
//                                         <div className="flex space-x-2">
//                                             <div className="border-r border-gray-300 h-full mx-2"></div>
//                                             <span
//                                                 className={`px-2 py-1 mt-[12px] ml-2 w-20 h-6 text-center text-xs font-semibold text-black
//                                                     ${question.DifficultyLevel === "Easy"
//                                                     ? "bg-[#FFC000]"
//                                                         : question.DifficultyLevel === "Medium"
//                                                         ? "bg-[#3AA20D]"
//                                                         : "bg-[#FF0000]"
//                                                     }
//                                                         rounded`}
//                                             >
//                                                 {question.DifficultyLevel}
//                                             </span>
//                                             <div className="border-r border-gray-300 h-full mx-2"></div>
//                                             <div>
//                                                 <p className="ml-2 text-gray-700">Mandatory</p>
//                                                 <button
//                                                     onClick={() => handleMandatoryToggle(question._id)}
//                                                     className={`w-10 h-5 ml-6 flex items-center rounded-full p-1 mb-1 border-2 ${getMandatoryStatus(question._id)
//                                                         ? "bg-blue-100 border-custom-blue"
//                                                         : "bg-gray-200 border-gray-300"
//                                                         }`}
//                                                 >
//                                                     <span
//                                                         className={`w-2 h-2 ${getMandatoryStatus(question._id)
//                                                             ? "bg-custom-blue"
//                                                             : "bg-gray-300"
//                                                             } rounded-full transform transition ${getMandatoryStatus(question._id)
//                                                                 ? "translate-x-5"
//                                                                 : "translate-x-0"
//                                                             }`}
//                                                     />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <p className="text-sm ml-[20px] text-gray-600 p-2">
//                                         <strong>Answer:</strong> {question.Answer}
//                                     </p>
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 </div>
//                 <div className="border-t p-2 flex justify-end space-x-3">
//                     <button onClick={handleSave} className="px-4 py-1 bg-custom-blue text-white rounded">
//                         Add
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddInterviewScheduleQuestions;


import React from 'react'

const AddInterviewScheduleQuestions = () => {
  return (
    <div>AddInterviewScheduleQuestions</div>
  )
}

export default AddInterviewScheduleQuestions