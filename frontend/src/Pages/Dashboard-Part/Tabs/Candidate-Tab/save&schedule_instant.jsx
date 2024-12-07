import React, { useState, useRef, useEffect } from "react";
import AddPositionForm from "../Position-Tab/Position-Form.jsx";
import AddCandidateForm from "../Candidate-Tab/CreateCandidate.jsx";
import AddTeamMemberForm from "../Team-Tab/CreateTeams.jsx"
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import PopupComponent from "../Interviews/OutsourceOption";

import { ReactComponent as MdOutlineCancel } from '../../../../icons/MdOutlineCancel.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';

const Schedulenow = ({ isOpen1, onClose1, onOutsideClick1, lastName, setSidebarOpen1 }) => {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [defaultdata] = useState(lastName);
    const [selectedCandidate] = useState(defaultdata);
    const [positions, setPositions] = useState([]);
    const [value, setValue] = useState('');
    const [skillsData, setSkillsData] = useState([]);
    useEffect(() => {
        const fetchSkillsData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/position`);
                console.log('Position data:', response.data);
                setSkillsData(response.data);
            } catch (error) {
                console.error('Error fetching position data:', error);
            }
        };

        fetchSkillsData();
    }, []);

    const [teamData, setTeamData] = useState([]);
    useEffect(() => {
        const fetchTeamsData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/team`);
                console.log('Teams data:', response.data);
                setTeamData(response.data);
            } catch (error) {
                console.error('Error fetching position data:', error);
            }
        };
        fetchTeamsData();
    }, []);

    const [formData, setFormData] = useState({
        InterviewTitle: "",
        InterviewType: "",
        Position: "",
        Candidate: "",
        AddInterviewers: "",
        TeamMember: "",
        OutsourceInterviewers: "",
        Duration: "",
    });
    console.log("formData",formData)
    const [errors, setErrors] = useState('');
    const handleChange = (e) => {
        const { name } = e.target;
        let errorMessage = '';
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [name]: errorMessage });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = {
            InterviewTitle: 'InterviewTitle is required',
            InterviewType: 'InterviewType is required',
            Description: 'Description is required',
        };
        let formIsValid = true;
        const newErrors = { ...errors };

        Object.entries(requiredFields).forEach(([field, message]) => {
            if (!formData[field]) {
                newErrors[field] = message;
                formIsValid = false;
            }
        });

        if (!formIsValid) {
            setErrors(newErrors);
            return;
        }
        try {
            const { InterviewTitle, DateTime, Duration } = formData;
            const teamMemberNames = selectedTeamMembers.map((member) => member.name);
            const interviewResponse = await axios.post(`${process.env.REACT_APP_API_URL}/interview`, {
                ...formData,
                InterviewType: selectedtype,
                Position: selectedPosition,
                Candidate: selectedCandidate,
                Description: textareaValue,
                Category: "internal",
                TeamMember: teamMemberNames,
                Status: "Scheduled"
            });
            console.log('Interview created:', interviewResponse.data);

            const Body = `Interview successfully scheduled for Technical Round (${InterviewTitle})on ${DateTime} via ${selectedtype}, scheduled for ${Duration}.`;

            const notificationResponse = await axios.post(`${process.env.REACT_APP_API_URL}/notification`, {
                Title: InterviewTitle,
                Body: Body,
                InterviewType: selectedtype,
                Status: "Scheduled"
            });

            console.log('Notification created:', notificationResponse.data);
            setFormData({
                InterviewTitle: "",
                InterviewType: "",
                Position: "",
                Candidate: "",
                Duration: "",
                Description: "",
            });
            onClose1();
        } catch (error) {
            console.error('Error creating interview or posting notification:', error);
        }
    };

    const handlePositionSelect = (position) => {
        setSelectedPosition(position);
        setValue("");
        setShowDropdown(false);
        setErrors((prevErrors) => ({
            ...prevErrors,
            Position: ''
        }));
    };

    const handlePositionInputChange = (e) => {
        const inputValue = e.target.value;
        setValue(inputValue);
        setShowDropdown(true);
        setFormData((prevFormData) => ({
            ...prevFormData,
            Position: inputValue
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            Position: ''
        }));
    };

    const handleAddNewPositionClick = () => {
        setShowMainContent(false);
        setShowNewCandidateContent(false);
        setShowNewPositionContent(true);
        if (value.trim() !== "") {
            const newPosition = { _id: positions.length + 1, title: value };
            setPositions([newPosition, ...positions]); // Add new position at the beginning
            setSelectedPosition(value);
            setValue("");
            setShowDropdown(false);
        }
    };

    const [filteredPositions, setFilteredPositions] = useState([]);

    const [selectedtype, setSelectedtype] = useState('');
    const [showDropdowntype, setShowDropdowntype] = useState(false);

    const toggleDropdowntype = () => {
        setShowDropdowntype(!showDropdowntype);
    };

    const handletypeSelect = (type) => {
        setSelectedtype(type);
        setFormData((prevFormData) => ({
            ...prevFormData,
            InterviewType: type,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            InterviewType: ''
        }));
        setShowDropdowntype(false);
    };
    const positionRef = useRef(null);

    const types = [
        "Phone",
        "Video",
        "Face To Face",
    ];

    const [showDropdowninterview, setShowDropdowninterview] = useState(false);

    const toggleDropdowninterview = () => {
        setShowDropdowninterview(!showDropdowninterview);
    };

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

    const handleinterviewSelect = (interview) => {
        if (interview === "My Self" || interview === "Team Member" || interview === "Outsource Interviewer") {
            setShowDropdowninterview(false);
        } else {
            setShowDropdowninterview(false);
        }
        setIsTeamMemberSelected(interview === "Team Member");

        if (interview === "My Self" || interview === "Team Member") {
            setShowDropdowninterview(false);
        } else if (interview === "Outsource Interviewer") {
            setShowConfirmation(true);
        } else {
            setShowDropdowninterview(false);
        }
        setIsTeamMemberSelected(interview === "Team Member");
    };

    const interviews = [
        "My Self",
        "Team Member",
        "Outsource Interviewer",
    ];
    const [showNewTeamMemberContent, setShowNewTeamMemberContent] = useState(false);

    const handleAddNewTeamMemberClick = () => {
        setShowMainContent(false);
        setShowNewPositionContent(false);
        setShowNewCandidateContent(false);
        setShowNewTeamMemberContent(true);
    };

    const handleclose = () => {
        setShowMainContent(true);
        setShowNewCandidateContent(false);
        setShowNewPositionContent(false);
        setShowNewTeamMemberContent(false);
    };

    const [isTeamMemberSelected, setIsTeamMemberSelected] = useState(false);

    const removeSelectedTeamMember = (memberToRemove) => {
        setSelectedTeamMembers(selectedTeamMembers.filter(member => member !== memberToRemove));
    };

    const clearSelectedTeamMembers = () => {
        setSelectedTeamMembers([]);
    };

    const [showMainContent, setShowMainContent] = useState(true);
    const [showNewPositionContent, setShowNewPositionContent] = useState(false);
    const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);

    useEffect(() => {
        const fetchCandidateData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate`);
                console.log('Candidate data:', response.data);
            } catch (error) {
                console.error('Error fetching candidate data:', error);
            }
        };
        fetchCandidateData();
    }, []);

    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const filtered = skillsData
            .filter(position => position.title.toLowerCase().includes(value.toLowerCase()))
            .slice(-5);
        setFilteredPositions(filtered);
        setShowDropdown((filtered.length > 0 || filtered.length === 0) && value.trim().length > 0);
    }, [value, skillsData]);

    const [showTeamMemberDropdown, setShowTeamMemberDropdown] = useState(false);

    const toggleDropdownTeamMember = () => {
        setShowTeamMemberDropdown(!showTeamMemberDropdown);
    };

    const handleTeamMemberSelect = (teamMember) => {
        if (!selectedTeamMembers.some(member => member.id === teamMember._id)) {
            setSelectedTeamMembers([...selectedTeamMembers, { id: teamMember._id, name: teamMember.LastName }]);
        }
        setShowTeamMemberDropdown(false);
        setIsTeamMemberSelected(false)
    };


    const [textareaValue, setTextareaValue] = useState('');
    const handleChangedescription = (event) => {
        const value = event.target.value;
        if (value.length <= 250) {
            setTextareaValue(value);
            event.target.style.height = 'auto';
            event.target.style.height = event.target.scrollHeight + 'px';
            setFormData({ ...formData, Description: value });

            setErrors({ ...errors, Description: '' });
        }
    };



    const [showPopup, setShowPopup] = useState(false);

    const handleAddInterviewClick = () => {
        setSidebarOpen1(false);
        setShowPopup(true);
        setShowConfirmation(false)
    };

    const handlePopupClose = () => {
        setShowPopup(false);
        setSidebarOpen1(true);
    };
    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-15 z-30 ${isOpen1 ? 'visible' : 'invisible'}`}>
                <div onClick={onOutsideClick1} className={`fixed inset-y-0 right-0 z-10 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform ${isOpen1 ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div>
                        {showMainContent ? (
                            <div>
                                <div className="fixed top-0 w-full bg-white border-b z-0">
                                    <div className="flex justify-between items-center p-4">
                                        <h2 className="text-lg font-bold">Schedule an Interview</h2>
                                        <button onClick={onClose1} className="focus:outline-none">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="fixed top-20 bottom-16 overflow-auto p-4 w-full text-sm">
                                    <form onSubmit={handleSubmit}>
                                        <div className="flex gap-5 mb-5">
                                            <div>
                                                <label htmlFor="InterviewTitle" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">Interview Title <span className="text-red-500">*</span></label>
                                            </div>
                                            <div className="flex-grow">
                                                <input
                                                    value={formData.InterviewTitle}
                                                    onChange={handleChange}
                                                    name="InterviewTitle"
                                                    type="text"
                                                    id="InterviewTitle"
                                                    className={`border-b focus:outline-none mb-5 w-full ${errors.InterviewTitle ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                                                />
                                                {errors.InterviewTitle && <p className="text-red-500 text-sm -mt-4">{errors.InterviewTitle}</p>}
                                            </div>
                                        </div>
                                        {/* interview type */}
                                        <div className="flex gap-5 mb-5">
                                            <div>
                                                <label htmlFor="InterviewType" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">Interview Type <span className="text-red-500">*</span></label>
                                            </div>
                                            <div className="relative flex-grow">
                                                <div className="relative">
                                                    <input
                                                        value={selectedtype}
                                                        onClick={toggleDropdowntype}
                                                        readOnly
                                                        type="text"
                                                        className={`border-b focus:outline-none mb-5 w-full ${errors.InterviewType ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                                                    />
                                                    {errors.InterviewType && <p className="text-red-500 text-sm -mt-4">{errors.InterviewType}</p>}
                                                </div>
                                                <MdArrowDropDown className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                                                />
                                                {/* Dropdown */}
                                                {showDropdowntype && (
                                                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                                        {types.map((type) => (
                                                            <div key={type} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handletypeSelect(type)}>
                                                                {type}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Position */}
                                        <div className="flex gap-5 mb-5 relative" ref={positionRef}>
                                            <div>
                                                <label htmlFor="Position" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                                                    Position <span className="text-red-500">*</span>
                                                </label>
                                            </div>
                                            <div className="relative flex-grow">
                                                <div className="relative">
                                                    {selectedPosition ? (
                                                        <div className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full h-9 flex items-center">
                                                            <div className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2">
                                                                {selectedPosition}
                                                                <button onClick={() => handlePositionSelect("")} className="ml-1 bg-slate-300 rounded-lg px-2">X</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className={`border-b focus:outline-none mb-5 w-full ${errors.Position ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                                                            value={value}
                                                            onChange={handlePositionInputChange}
                                                            onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown
                                                        />

                                                    )}
                                                    {errors.Position && <p className="text-red-500 text-sm -mt-4">{errors.Position}</p>}

                                                    <MdArrowDropDown
                                                        onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown
                                                        className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                                                    />
                                                    {/* Dropdown */}
                                                    {showDropdown && (
                                                        <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                                            <p className="p-1 font-medium">Recent Positions</p>
                                                            <ul>
                                                                {filteredPositions.slice(0, 4).map(position => ( // Display only 4 positions
                                                                    <li
                                                                        key={position._id}
                                                                        className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                                                        onClick={() => handlePositionSelect(position.title)}
                                                                    >
                                                                        {position.title}
                                                                    </li>
                                                                ))}
                                                                <li
                                                                    className="flex cursor-pointer shadow-md border-b p-1 rounded"
                                                                    onClick={handleAddNewPositionClick}
                                                                >
                                                                    <IoIosAddCircle className="text-2xl" />
                                                                    <span>Add New Position</span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Candidate */}
                                        <div className="flex gap-5 mb-5">
                                            <div>
                                                <label htmlFor="Candidate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                                                    Candidate <span className="text-red-500">*</span>
                                                </label>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full relative">

                                                    <p className="bg-slate-300 rounded-lg mb-1 w-fit px-3">{defaultdata}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-5 mb-5">
                                            <div>
                                                <label htmlFor="AddInterviewers" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                                                    Add Interviews <span className="text-red-500">*</span>
                                                </label>
                                            </div>

                                            <div className="relative flex-grow">
                                                <div className="relative mb-3">
                                                    <div className="border-b border-gray-300 focus:border-black focus:outline-none min-h-6 h-auto mb-5 w-full relative" onClick={toggleDropdowninterview}>
                                                        <div className="flex flex-wrap">
                                                            {selectedTeamMembers.map((member) => (
                                                                <div key={member.id} className="bg-slate-200 rounded-lg px-2 py-1 inline-block mr-2 mb-2">
                                                                    {member.name}
                                                                    <button onClick={() => removeSelectedTeamMember(member)} className="ml-1 bg-slate-300 rounded-lg px-2">X</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="absolute top-2 right-5">
                                                            {selectedTeamMembers.length > 0 && (
                                                                <button onClick={clearSelectedTeamMembers} className="bg-slate-300 rounded-lg px-2 mb-2">X</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <MdArrowDropDown
                                                        className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                                                    />
                                                </div>
                                                {showDropdowninterview && (
                                                    <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                                                        {interviews.map((interview) => (
                                                            <div key={interview} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleinterviewSelect(interview)}>
                                                                {interview}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {isTeamMemberSelected && (
                                                    <div className="relative flex-grow mt-4">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                                                                placeholder="Select Team Member"
                                                                onClick={toggleDropdownTeamMember}
                                                                readOnly
                                                            />
                                                            {showTeamMemberDropdown && (
                                                                <div className="flex gap-5 mb-5 relative w-full">
                                                                    <div className="relative flex-grow">
                                                                        <div className="relative bg-white border cursor-pointer p-1 shadow">
                                                                            <p className="p-1 font-medium">Recent Team Members</p>
                                                                            <div>
                                                                                {teamData.map((team) => (
                                                                                    <div
                                                                                        key={team._id}
                                                                                        className="hover:bg-gray-100 w-full cursor-pointer"
                                                                                        onClick={() => handleTeamMemberSelect(team)}
                                                                                    >
                                                                                        <div className="text-black flex p-1">
                                                                                            {team.LastName}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <p
                                                                                className="flex bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                                                                onClick={handleAddNewTeamMemberClick}
                                                                            >
                                                                                <IoIosAddCircle className="text-2xl" />
                                                                                <span>Add New Team Member</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <MdArrowDropDown
                                                                className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer"
                                                                style={{ right: '75px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {showConfirmation && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50">
                                                        <div className="relative bg-white rounded-lg p-6">
                                                            {/* Cancel icon */}
                                                            <button
                                                                className="absolute top-2 right-2 rounded-full"
                                                                onClick={() => setShowConfirmation(false)}
                                                            >
                                                                <MdOutlineCancel className="text-2xl" />
                                                            </button>
                                                            <p className="text-lg mt-3 ">
                                                                Do you want only outsourced interviewers?
                                                            </p>
                                                            <div className="mt-4 flex justify-center">
                                                                <button
                                                                    className="bg-gray-300 text-gray-700 rounded px-8 py-2 mr-2"
                                                                    onClick={() => setShowConfirmation(false)}
                                                                >
                                                                    No
                                                                </button>
                                                                <button
                                                                    className="bg-gray-300 text-gray-700 rounded px-8 py-2 ml-11"
                                                                    onClick={handleAddInterviewClick}
                                                                >
                                                                    Yes
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Duration */}
                                        <div className="flex gap-5 mb-5">
                                            <div>
                                                <label
                                                    htmlFor="duration"
                                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36"
                                                >
                                                    Duration <span className="text-red-500">*</span>
                                                </label>
                                            </div>
                                            <div className="flex-grow">
                                                <input
                                                    name="duration"
                                                    type="text"
                                                    id="duration"
                                                    readOnly
                                                    onChange={handleChange}
                                                    className="border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full"
                                                />
                                            </div>
                                        </div>
                                        {/* job description */}
                                        <div className="flex gap-5 mb-5">
                                            <div>
                                                <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">Description</label>
                                            </div>
                                            <div className="flex-grow">
                                                <textarea
                                                    rows={1}
                                                    value={textareaValue}
                                                    onChange={handleChangedescription}
                                                    name="jobdescription"
                                                    id="jobdescription"
                                                    className={`border-b focus:outline-none mb-5 w-full ${errors.Description ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
                                                ></textarea>
                                                {errors.Description && <p className="text-red-500 text-sm -mt-4">{errors.Description}</p>}
                                                {textareaValue.length > 0 && (
                                                    <p className="text-gray-600 text-sm float-right -mt-4">{textareaValue.length}/1000</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="footer-buttons flex justify-end">
                                            <button type="submit" className="footer-button">
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <>
                                {showNewCandidateContent && (
                                    <AddCandidateForm onClose={handleclose} />
                                )}
                                {showNewPositionContent && (
                                    <AddPositionForm onClose={handleclose} />
                                )}
                                {showNewTeamMemberContent && (
                                    <AddTeamMemberForm onClose={handleclose} />
                                )}
                            </>
                        )}
                    </div>
                </div >
            </div >
            {showPopup && <PopupComponent onClose={handlePopupClose} />}
        </>
    )
}

export default Schedulenow;