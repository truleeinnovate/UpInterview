import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import Cookies from "js-cookie";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import { ReactComponent as HiArrowsUpDown } from '../../../../icons/HiArrowsUpDown.svg';

const PositionViewMiniTab = ({ setPositionData1,fromcandidate }) => {
    const [positionData, setPositionData] = useState(setPositionData1);
    const [showDropdownuser, setShowDropdownuser] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const candidateRef = useRef(null);
    const [selectedCandidate, setSelectedCandidate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [userProfile, setUserProfile] = useState(null);
    const handleChangePositionOwner = async () => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/position/${positionData._id}`,
                { OwnerId: selectedCandidate }
            );
            console.log("Position owner updated successfully:", response.data);
            setShowDropdownuser(false);
        } catch (error) {
            console.error("Error updating position owner:", error);
        }
    };

    const handleCancel = () => {
        setSearchTerm("");
        setShowDropdownuser(false);
    };

    const [isArrowUp, setIsArrowUp] = useState(false);

    const toggleArrow = () => {
        setIsArrowUp(!isArrowUp);
    };

    const handleCandidateSelect = (candidate) => {
        setSelectedCandidate(candidate._id);
        console.log(candidate._id);
        setSearchTerm(candidate.Name);
        setShowDropdown(false);
    };

    const handleAddNewCandidateClick = () => {
        // Implement logic to add a new candidate
        console.log("Add new candidate clicked");
    };

    const [userData, setUserData] = useState([]);
    const organizationId = Cookies.get("organizationId");
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/users/organization/${organizationId}`
                );
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching users data:", error);
            }
            setLoading(false);
        };
        fetchUserData();
    }, [organizationId]);

    useEffect(() => {
        if (positionData?.ownerId) {
            fetchUserData();
        }
    }, [positionData?.ownerId]);
// this fetch used to display owner name using ownerid
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const matchedUser = await axios.get(
                `${process.env.REACT_APP_API_URL}/auth/users/${positionData.ownerId}`
            );
            setUserProfile(matchedUser.data);
        } catch (error) {
            console.error("Error fetching users data:", error);
        }
        setLoading(false);
    };

    const togglePopup = () => {
        setShowDropdownuser(!showDropdownuser);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setShowDropdown(true);
    };

    const handleInputClick = () => {
        setShowDropdown(true);
    };
    return (
        <div> {positionData && (
            <div className="mt-7">
                <div className="flex space-x-8 p-2 text-md justify-between items-center bg-gray-100 pr-5 border-b border-gray-300">
                    <p className="pr-4 ml-8 w-1/4 font-medium">
                        {positionData.title}
                    </p>
                    <p className="rounded px-2 ml-4 text-center font-medium">
                        {positionData.companyname}
                    </p>
                    <p
                        className="flex items-center text-3xl ml-3 mr-3"
                        onClick={toggleArrow}
                    >
                        {isArrowUp ? <ChevronUp /> : <ChevronDown />}
                    </p>
                </div>
                <div
                    className="p-4 bg-gray-100"
                    style={{ display: isArrowUp ? "block" : "none" }}
                >
                    <div className="border rounded-md border-gray-300 p-3 mb-2 bg-white">
                        <div className="mt-2 mb-2">
                            <div className="flex flex-col mt-1 mb-2">
                                <div className="">
                                    <p className="font-bold text-lg mb-5">
                                        Personal Details:
                                    </p>
                                    {/* first name */}

                                    <div className="flex mb-5">
                                        <div className="w-1/4 sm:w-1/2">
                                            <div className="font-medium">Title:</div>
                                        </div>
                                        <div className="w-1/4 sm:w-1/2">
                                            <p>
                                                <span className="font-normal text-gray-500">
                                                    {positionData.title}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="w-1/4 sm:w-1/2">
                                            <div className="font-medium">Owner</div>
                                        </div>
                                        <div className="sm:w-1/2 w-1/4 flex items-center relative">
                                            <p>
                                                <span className="font-normal text-gray-500 w-1/3 sm:w-1/2">
                                                    {userProfile ? userProfile.Firstname : "Loading..."}
                                                </span>
                                            </p>
                                            {fromcandidate && (
                                                <button
                                                className="ml-14 relative"
                                                type="button"
                                                onClick={togglePopup}
                                            >
                                                <HiArrowsUpDown className="text-custom-blue" />
                                            </button> 
                                            )}
                                           

                                            {/* Dropdown */}
                                            {showDropdownuser && (
                                                <>
                                                    <div className="border border-gray-300 w-72 rounded-md absolute top-10 shadow bg-white right-1 z-50">
                                                        <p className="p-2 font-medium border-b">Owner</p>
                                                        < div className="flex items-center relative p-2" ref={candidateRef}>
                                                            <label
                                                                htmlFor="Candidate"
                                                                className="block font-medium text-gray-900 dark:text-black w-16"
                                                            >
                                                                Users
                                                            </label>
                                                            <div className="relative flex-grow">
                                                                <input
                                                                    type="text"
                                                                    className={`border-b focus:outline-none w-full ${errors.Candidate ? "border-red-500" : "border-gray-300"}`}
                                                                    value={searchTerm}
                                                                    onChange={handleInputChange}
                                                                    onClick={handleInputClick}
                                                                    autoComplete="off"
                                                                />

                                                                <MdArrowDropDown
                                                                    onClick={() => setShowDropdown(!showDropdown)}
                                                                    className="absolute top-0 text-gray-500 text-lg mt-1 mr-2 cursor-pointer right-0"
                                                                />

                                                                {/* Dropdown */}
                                                                {showDropdown && (
                                                                    <div className="absolute z-50 border border-gray-200 mb-5 w-full rounded-md bg-white shadow">
                                                                        <p className="p-1 font-medium text-sm border-b"> Recent Users</p>
                                                                        <ul>
                                                                            {userData
                                                                                .filter(candidate => candidate.Name && candidate.Name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                                                .slice(0, 4)
                                                                                .map((candidate) => (
                                                                                    <li
                                                                                        key={userData._id}
                                                                                        className="bg-white border-b cursor-pointer p-2 hover:bg-gray-100"
                                                                                        onClick={() => {
                                                                                            handleCandidateSelect(candidate);
                                                                                        }}
                                                                                    >
                                                                                        {candidate.Name}
                                                                                    </li>
                                                                                ))}
                                                                            <li
                                                                                className="flex cursor-pointer shadow-md border-b p-1 rounded text-sm"
                                                                                onClick={handleAddNewCandidateClick}
                                                                            >
                                                                                <IoIosAddCircle className="text-xl" />
                                                                                <span>Add New User</span>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="border-t mt-10">
                                                            <div className="flex p-1 gap-2 float-end">
                                                                <button className="p-1 border text-xs text-white bg-gray-300 rounded-md" onClick={handleCancel}>Cancel</button>
                                                                <button className="p-1 border text-xs text-white bg-custom-blue rounded-md" onClick={handleChangePositionOwner}>Change</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>



                                    </div>
                                </div>

                                <div className="flex mb-5">
                                    <div className="w-1/4 sm:w-1/2">
                                        <p className="font-medium">Company Name</p>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                        <p className="font-normal text-gray-500">
                                            {positionData.companyname}
                                        </p>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                        <div className="font-medium">Experience</div>
                                    </div>
                                    <div>
                                        <p className="font-normal text-gray-500">
                                            {positionData.minexperience} to{" "}
                                            {positionData.maxexperience} years
                                        </p>
                                    </div>
                                </div>
                                <div className="flex mb-5">
                                    <div className="w-1/4 sm:w-1/2">
                                        <p className="font-medium">Job Description</p>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                        <p className="font-normal text-gray-500">
                                            {positionData.jobdescription}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mb-5">
                                    <div className="w-1/4 sm:w-1/2">
                                        <p className="font-medium">Additional Notes</p>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                        <p className="font-normal text-gray-500">
                                            {positionData.additionalnotes}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-bold text-lg mb-5">
                                    System Details:
                                </p>
                                <div className="flex mb-5">
                                    <div className="w-1/4 sm:w-1/2">
                                        <div className="font-medium">
                                            Created By
                                        </div>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                        <p>
                                            <span className="font-normal text-gray-500">
                                                {/* {candidate.CurrentExperience} */}
                                            </span>
                                        </p>
                                    </div>
                                    {/* position */}

                                    <div className="w-1/4 sm:w-1/2">
                                        <div className="font-medium">Modified By</div>
                                    </div>
                                    <div className="w-1/4 sm:w-1/2">
                                        <p>
                                            <span className="font-normal text-gray-500">
                                                {/* {candidate.Position} */}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                    <div className="mb-5">
                        <div className="mt-4 mx-3 sm:mx-5">
                            <div className="font-bold text-xl mb-5">
                                Skills Details:
                            </div>
                            {/* Skills */}
                            <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                                <div className="sm:mx-0">
                                    <div className="grid grid-cols-3 p-4">
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Skills
                                        </div>
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Experience
                                        </div>
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Expertise
                                        </div>
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <tbody>
                                                {positionData.skills.map(
                                                    (skillEntry, index) => (
                                                        <tr
                                                            key={index}
                                                            className="grid grid-cols-3 gap-4"
                                                        >
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {skillEntry.skill}
                                                            </td>
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {skillEntry.experience}
                                                            </td>
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {skillEntry.expertise}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="mt-4 mx-3 sm:mx-5">
                            <div className="font-bold text-xl mb-5">
                                Rounds Details:
                            </div>
                            {/* Skills */}
                            <div className="mb-5 text-sm rounded-lg border border-gray-300 bg-white">
                                <div className="sm:mx-0">
                                    <div className="grid grid-cols-4 p-4">
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Round Title
                                        </div>
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Interview Mode
                                        </div>
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Duration
                                        </div>
                                        <div className="block font-medium leading-6 text-gray-900">
                                            Interviewer
                                        </div>

                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-gray-400 border-t px-4">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <tbody>
                                                {positionData.rounds.map(
                                                    (roundEntry, index) => (
                                                        <tr
                                                            key={index}
                                                            className="grid grid-cols-4 gap-4"
                                                        >
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {roundEntry.round}
                                                            </td>
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {roundEntry.mode}
                                                            </td>
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {roundEntry.duration}
                                                            </td>
                                                            <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                                {roundEntry.interviewer}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}</div>
    )
}

export default PositionViewMiniTab