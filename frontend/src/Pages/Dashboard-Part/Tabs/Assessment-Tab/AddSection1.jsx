import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';

const AddQuestion2 = ({ isOpen, onClose, onOutsideClick, position, onSectionAdded, addedSections, assessmentId, isFromProfileDetails, onExceedLimit, checkedCount, questionsLimit }) => {
    console.log(isFromProfileDetails, "isFromProfileDetails")
    // const [skillToQuestionsMap, setSkillToQuestionsMap] = useState({});

    const skillToQuestionsMap = {
        HTML: [
            { Question: "What is HTML?", Score: 5, DifficultyLevel: "Easy", Answer: "HTML is a markup language used for creating web pages. It stands for HyperText Markup Language.", QuestionType: "Short Text(Single line)" },
            { Question: "Explain semantic HTML.", Score: 10, DifficultyLevel: "Medium", Answer: "Semantic HTML is the practice of using HTML markup to reinforce the semantics of the information in webpages, rather than merely define its presentation or look.", QuestionType: "Short Text(Single line)",hint:"hint", },
        ],
        CSS: [
            { Question: "What is CSS?", Score: 5, DifficultyLevel: "Easy", Answer: "CSS is a style sheet language used to describe the presentation of a document written in HTML.", QuestionType: "MCQ" },
            { Question: "Explain the box model.", Score: 10, DifficultyLevel: "Medium", Answer: "The CSS box model is a fundamental concept in CSS that describes how elements are rendered on a webpage. It consists of four components: content, padding, border, and margin.", QuestionType: "Short Text(Single line)",hint:"hint",options:["option1","option2","option3","option4"] },
        ],
        JavaScript: [
            { Question: "What is JavaScript?", Score: 5, DifficultyLevel: "Easy", Answer: "JavaScript is a programming language used to create interactive effects within web browsers.", QuestionType: "MCQ" },
            { Question: "Explain closures in JavaScript.", Score: 10, DifficultyLevel: "Hard", Answer: "Closures are a fundamental concept in JavaScript that allows functions to remember and access variables from their containing scope even when the function is executed outside that scope.", QuestionType: "Short Text(Single line)",hint:"hint",options:["option1","option2","option3","option4"] },
        ],
        // Add more skills and their questions here
    };

    // const fetchQuestionsForSkill = async (skill) => {
    //     try {
    //         console.log(`Fetching questions for skill: ${skill}`);
    //         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/questions/${skill}`);
    //         console.log(`Response data for ${skill}:`, response.data);
    //         setSkillToQuestionsMap(prevMap => ({
    //             ...prevMap,
    //             [skill]: response.data
    //         }));
    //     } catch (error) {
    //         console.error('Error fetching questions:', error);
    //     }
    // };
    const [popupMessage, setPopupMessage] = useState(null);

    const handleClosePopup = () => {
        setPopupMessage(null);
    };
    const [technologies, setTechnologies] = useState([]);
    const [skills, setSkills] = useState([]);
    const [selectedTechnologies, setSelectedTechnologies] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [errors, setErrors] = useState({});
    const [isIntegrateClicked, setIsIntegrateClicked] = useState(false);
    const [isCustomizeClicked, setIsCustomizeClicked] = useState(false);
    const [sectionName, setSectionName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(null);

    const onIntegrateClick = (event) => {
        event.stopPropagation();
        setIsIntegrateClicked(true);
        setIsCustomizeClicked(false);
        setSectionName('');
    };

    const onCustomizeClick = (event) => {
        event.stopPropagation();
        setIsCustomizeClicked(true);
        setIsIntegrateClicked(false);
    };

    const handleAdd = async () => {
        const category = isCustomizeClicked ? 'customize' : 'integrate';
        let validationErrors = {};
    
        // Validate only if in integrate mode
        if (isIntegrateClicked) {
            if (selectedTechnologies.length === 0) {
                validationErrors.technology = "Please select at least one technology.";
            }
            if (selectedSkills.length === 0) {
                validationErrors.skills = "Please select at least one skill.";
            }
        }
    
        // Validate section name if in customize mode
        if (isCustomizeClicked) {
            if (!sectionName.trim()) {
                validationErrors.sectionName = "Section name is required.";
            }
        }
    
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        // Check for duplicate section names
        if (isCustomizeClicked && addedSections.includes(sectionName)) {
            setPopupMessage(`Section "${sectionName}" already exists.`);
            return;
        }
    
        // Calculate the number of questions to be added
        const questionsToAdd = isIntegrateClicked && skillToQuestionsMap[selectedSkills[0]]
            ? skillToQuestionsMap[selectedSkills[0]].length
            : 0;
        const newTotalQuestions = checkedCount + questionsToAdd;
    
        // Check if adding these questions exceeds the limit
        if (newTotalQuestions > questionsLimit) {
            // Trigger a callback to show a popup in NewAssessment.jsx
            onExceedLimit();
            return;
        }
    
        // Prepare section data
        const sectionData = {
            SectionName: isCustomizeClicked ? sectionName : selectedSkills[0],
            Category: category,
            Position: position,
            Skills: selectedSkills,
            Questions: isIntegrateClicked && skillToQuestionsMap[selectedSkills[0]] ? skillToQuestionsMap[selectedSkills[0]] : [],
        };
    
        // Add section to backend
        try {
            if (isFromProfileDetails) {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/assessment/${assessmentId}/section`, sectionData);
                console.log("Section added successfully");
            } else {
                onSectionAdded(sectionData);
            }
        } catch (error) {
            console.error("Error adding section:", error);
        }
    
        // If customizing, add the section name
        if (isCustomizeClicked && sectionName) {
            onSectionAdded({
                SectionName: sectionName,
                Category: category,
                Position: position,
                Skills: selectedSkills,
                Questions: [],
            });
        } else if (isIntegrateClicked) {
            // If integrating, add a section for each selected skill
            selectedSkills.forEach(skill => {
                const questions = skillToQuestionsMap[skill] || [];
                onSectionAdded({
                    SectionName: skill,
                    Category: category,
                    Position: position,
                    Questions: questions,
                });
            });
        }
    
        onClose();
        // Reset form to default
        setIsIntegrateClicked(false);
        setIsCustomizeClicked(false);
        setSectionName('');
        setSelectedIcon(null);
        setSelectedSkills([]);
        setSelectedTechnologies([]);
    };

    const handleIconSelect = (name) => {
        setSelectedIcon(name);
    };

    const [isTechnologyDropdownOpen, setIsTechnologyDropdownOpen] = useState(false);
    const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchTechnologies = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/technology`);
                setTechnologies(response.data);
            } catch (error) {
                console.error('Error fetching technologies:', error);
            }
        };

        fetchTechnologies();
    }, []);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
                setSkills(response.data);
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };

        fetchSkills();
    }, []);

    const handleTechnologySelect = (techName) => {
        if (!selectedTechnologies.includes(techName)) {
            setSelectedTechnologies((prevSelected) => [...prevSelected, techName]);
            setErrors((prevErrors) => ({ ...prevErrors, technology: undefined })); // Clear technology error
        }
        setIsTechnologyDropdownOpen(false);
    };

    const handleSkillSelect = (skillName) => {
        if (!selectedSkills.includes(skillName)) {
            setSelectedSkills((prevSelected) => {
                const updatedSkills = [...prevSelected, skillName];
                console.log("selectedSkills", updatedSkills);
                return updatedSkills;
            });
            setErrors((prevErrors) => ({ ...prevErrors, skills: undefined })); // Clear skills error
        }
        setIsSkillDropdownOpen(false);
    };

    // const handleSkillSelect = (skillName) => {
    //     if (!selectedSkills.includes(skillName)) {
    //         setSelectedSkills((prevSelected) => {
    //             const updatedSkills = [...prevSelected, skillName];
    //             console.log("selectedSkills", updatedSkills);
    //             return updatedSkills;
    //         });
    //         setErrors((prevErrors) => ({ ...prevErrors, skills: undefined })); // Clear skills error
    //         // Fetch questions for the selected skill
    //         fetchQuestionsForSkill(skillName);
    //     }
    //     setIsSkillDropdownOpen(false);
    // };


    const handleAddSections = () => {
        // Call the onSectionAdded function for each selected skill
        selectedSkills.forEach(skill => {
            onSectionAdded(skill);
        });
        // Clear selected skills after adding sections
        setSelectedSkills([]);
        setIsSkillDropdownOpen(false);
    };

    const handleRemoveTechnology = (techName) => {
        setSelectedTechnologies((prevSelected) => prevSelected.filter((tech) => tech !== techName));
    };

    // New function to remove selected skill
    const handleRemoveSkill = (skillName) => {
        setSelectedSkills((prevSelected) => prevSelected.filter((skill) => skill !== skillName));
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-15 z-50 ${isOpen ? 'visible' : 'invisible'}`}>
            <div onClick={onOutsideClick} className={`fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="fixed top-0 w-full bg-white border-b z-50">
                    <div className="flex justify-between items-center p-4">
                        <h2 className="text-lg font-bold">New Section</h2>
                        <button onClick={onClose} className="focus:outline-none">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-3 mt-10 overflow-auto h-full">
                    <div className="flex justify-center">
                        <div className='text-center'>
                            <p className='text-center'>
                                <button onClick={onIntegrateClick} className="mt-6 text-white bg-gray-700 hover:bg-gray-800 focus:outline-none font-medium rounded text-sm py-2.5 me-2 mb-2" style={{ width: "300px" }}>
                                    Integrate
                                </button>
                                <p className='mb-2'>The system provides sections and questions</p>
                            </p>
                            <p>
                                <button onClick={onCustomizeClick} className="text-white bg-gray-700 hover:bg-gray-800 focus:outline-none font-medium rounded text-sm py-2.5 me-2 mb-2" style={{ width: "300px" }}>
                                    Customize
                                </button>
                                <p>You can create your own sections and questions</p>
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        {isIntegrateClicked && (
                            <div className='mx-8'>
                                <p className='text-center mb-4'>
                                    Skills are organized by technology. Select a technology to add relevant skills. If the skill you're looking for isn't listed, choose the 'Other' option.
                                </p>
                                <div>

                                    <div className="relative flex w-full">
                                        <label htmlFor="technology" className="block w-[100px] text-sm font-medium text-gray-900">
                                            Technology <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex-grow relative">
                                            <div
                                                className="border-b border-gray-300 text-gray-900 text-sm focus:outline-none w-[450px] min-h-6 flex flex-wrap gap-x-1 relative"
                                                onClick={() => setIsTechnologyDropdownOpen(!isTechnologyDropdownOpen)}
                                            >
                                                {selectedTechnologies.map((tech) => (
                                                    <div key={tech} className="flex mb-1 bg-gray-200 rounded-sm text-xs p-1">
                                                        {tech}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveTechnology(tech);
                                                            }}
                                                            className="ml-2 text-xs bg-slate-300 rounded px-2"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ))}
                                                <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />
                                            </div>
                                            {isTechnologyDropdownOpen && (
                                                <div className="absolute z-50 w-full border rounded-sm mt-1 bg-white shadow-lg max-h-60 overflow-y-auto text-sm">
                                                    {technologies
                                                        .filter((tech) => !selectedTechnologies.includes(tech.TechnologyMasterName))
                                                        .map((tech) => (
                                                            <div
                                                                key={tech._id}
                                                                onClick={() => handleTechnologySelect(tech.TechnologyMasterName)}
                                                                className="cursor-pointer p-2 hover:bg-gray-100"
                                                            >
                                                                {tech.TechnologyMasterName}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                            {errors.technology && (
                                                <p className="text-red-500 text-sm mt-1">{errors.technology}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative flex mt-8">
                                        <label htmlFor="skill" className="block w-[100px] text-sm font-medium text-gray-900">
                                            Skill <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex-grow relative">
                                            <div
                                                className="border-b border-gray-300 text-gray-900 text-sm focus:outline-none w-[450px] min-h-6 flex flex-wrap gap-x-1 relative"
                                                onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                                            >
                                                {selectedSkills.map((skill) => (
                                                    <div key={skill} className="flex mb-1 bg-gray-200 rounded-sm text-xs p-1">
                                                        {skill}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveSkill(skill);
                                                            }}
                                                            className="ml-2 text-xs bg-slate-300 rounded px-2"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ))}
                                                <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0" />
                                            </div>
                                            {isSkillDropdownOpen && (
                                                <div className="absolute z-50 w-full border rounded-sm mt-1 bg-white shadow-lg max-h-60 overflow-y-auto text-sm">
                                                    {skills
                                                        .filter((skill) => !selectedSkills.includes(skill.SkillName) && !addedSections.includes(skill.SkillName))
                                                        .map((skill) => (
                                                            <div
                                                                key={skill._id}
                                                                onClick={() => handleSkillSelect(skill.SkillName)}
                                                                className="cursor-pointer p-2 hover:bg-gray-100"
                                                            >
                                                                {skill.SkillName}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                            {errors.skills && (
                                                <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                        {isCustomizeClicked && (
                            <div className="mt-10 mx-10">
                                <div className="border p-3">
                                    <label htmlFor="section_name" className="text-start block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                                        Section Name <span className="text-red-500 text-xl">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="section_name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-blue focus:border-custom-blue block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-custom-blue dark:focus:border-custom-blue"
                                        required
                                        value={sectionName}
                                        onChange={(e) => setSectionName(e.target.value)}
                                    />
                                    {errors.sectionName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.sectionName}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sectionFooter">
                        <button onClick={handleAdd} className="sectionFooterButton">
                            Add
                        </button>
                    </div>
                </div>
                {popupMessage && (
                    <div className="fixed inset-0 flex items-center justify-center z-60">

                        <div className="bg-white p-2 rounded shadow-lg w-[400px] h-[100px] relative">
                            <button onClick={handleClosePopup} className="absolute top-2 right-2 focus:outline-none">
                                <svg className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <p className='text-center mt-5'>{popupMessage}</p>

                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AddQuestion2;