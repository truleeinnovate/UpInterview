import React, { useState, useRef, useEffect } from 'react';

import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as HiArrowsUpDown } from '../../../../icons/HiArrowsUpDown.svg';
import { ReactComponent as MdArrowDropDown } from '../../../../icons/MdArrowDropDown.svg';
import Cookies from "js-cookie";
import { format } from "date-fns";
import axios from "axios";
import EditCandidateForm from "../Candidate-Tab/CreateCandidate.jsx";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";

const CandidateViewMiniTab = ({ CandidatedataId, frominternal }) => {
    const {
        candidateData,
    } = useCustomContext();
    const candidate = candidateData.find((data) => data._id === CandidatedataId);

    // const [candidate, setCandidatesData] = useState([]);
    // const [candidate1, setCandidatesData1] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState("");
    const [showNewCandidateContent, setShowNewCandidateContent] = useState(false);
    // useEffect(() => {
    //     const fetchCandidate = async () => {
    //         try {
    //             setLoading(true);
    //             const response = await fetch(`${process.env.REACT_APP_API_URL}/candidate/${Candidatedata}`);
    //             if (!response.ok) {
    //                 throw new Error(`Error: ${response.status} - ${response.statusText}`);
    //             }
    //             const data = await response.json();
    //             setCandidatesData(data);
    //             console.log(data, "candidatefrom view");
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     if (Candidatedata) {
    //         fetchCandidate();
    //     }
    // }, [Candidatedata]);


    const [userProfile, setUserProfile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);


    useEffect(() => {
        fetchUserData();
    }, [candidate.ownerId]);
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const matchedUser = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/${candidate.ownerId}`);
            setUserProfile(matchedUser.data);
        } catch (error) {
            console.error("Error fetching users data:", error);
        }
        setLoading(false);
    };

    const handleChangeOwner = async () => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/candidate/${candidate._id}`,
                { OwnerId: selectedCandidate }
            );
            console.log("Owner updated successfully:", response.data);
            fetchUserData();
            setShowDropdownuser(false);

        } catch (error) {
            console.error("Error updating owner:", error);
        }
    };

    const [showDropdownuser, setShowDropdownuser] = useState(false);
    const candidateRef = useRef(null);

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

    const [userData, setUserData] = useState([]);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);

    const organizationId = tokenPayload.organizationId;

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

    const handleCancel = () => {
        setSearchTerm("");
        setShowDropdownuser(false);
    };

    const formattedDateOfBirth = candidate.Date_Of_Birth
        ? format(new Date(candidate.Date_Of_Birth), "dd-MM-yyyy")
        : "";

    const handleEditClick = (candidate) => {
        setShowNewCandidateContent({ state: { candidate } });
    };
    const handleclose = () => {
        setShowNewCandidateContent(false);
    };

    return (
        <>
            {frominternal && (
                <div className="flex float-end -mt-7">
                    <button
                        className="bg-custom-blue text-white px-3 py-1 rounded-md mr-2"
                        onClick={handleEditClick}
                    >
                        Edit
                    </button>
                    <button className="bg-custom-blue text-white px-3 py-1 rounded-md mr-3">Schedule</button>
                </div>
            )}


            <div className="mx-3 sm:mx-5 mt-7 sm:mt-5 border rounded-lg ">
                {/* candidate image only for mobile */}
                {/* <div className="col-span-4 md:hidden lg:hidden xl:hidden 2xl:hidden sm:flex sm:justify-center">
      <div>
        <div className="flex justify-end text-center">
          <div>
            {candidate.imageUrl ? (
              <img src={candidate.imageUrl} alt="Candidate" className="w-32 h-32 rounded" />
            ) : (
              candidate.Gender === "Male" ? (
                <img src={maleImage} alt="Male Avatar" className="w-32 h-32 rounded" />
              ) : candidate.Gender === "Female" ? (
                <img src={femaleImage} alt="Female Avatar" className="w-32 h-32 rounded" />
              ) : (
                <img src={genderlessImage} alt="Other Avatar" className="w-32 h-32 rounded" />
              )
            )}
          </div>
        </div>
      </div>
    </div> */}
                <div className="p-3">
                    <p className="font-bold text-lg mb-5">
                        Personal Details:
                    </p>
                    {/* first name */}
                    <div className="flex mb-5">
                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">First Name</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.FirstName}
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
                            {frominternal && (
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
                                                <button className="p-1 border text-xs text-white bg-custom-blue rounded-md" onClick={handleChangeOwner}>Change</button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                    <div className="flex mb-5">
                        <div className="w-1/4 sm:w-1/2">
                            <p className="font-medium">LastName</p>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <p className="font-normal text-gray-500">
                                {candidate.LastName}
                            </p>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Gender</div>
                        </div>
                        <div>
                            <p className="font-normal text-gray-500">
                                {candidate.Gender}
                            </p>
                        </div>
                    </div>
                    {/* date of birth */}
                    <div className="flex mb-5">
                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Date-of-Birth</div>
                        </div>
                        <div className="w-1/3 sm:w-1/2">
                            <p className="font-normal text-gray-500">
                                {formattedDateOfBirth}
                            </p>
                        </div>
                    </div>
                    <p className="font-bold text-lg mb-5">
                        Contact Details:
                    </p>

                    <div className="flex mb-5">
                        <div className="w-1/3 sm:w-1/2">
                            <div className="font-medium">Email</div>
                        </div>
                        <div className="w-1/3 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.Email}
                                </span>
                            </p>
                        </div>
                        <div className="w-1/3 sm:w-1/2">
                            <div className="font-medium">Phone</div>
                        </div>
                        <div className="w-1/3 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.Phone}
                                </span>
                            </p>
                        </div>
                    </div>

                    <p className="font-bold text-lg mb-5">
                        Education Details:
                    </p>
                    {/* higher qualification */}
                    <div className="flex mb-5">
                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">
                                Higher Qualification
                            </div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.HigherQualification}
                                </span>
                            </p>
                        </div>


                        {/* university/college */}

                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">
                                University/College
                            </div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.UniversityCollege}
                                </span>
                            </p>
                        </div>

                    </div>

                    <p className="font-bold text-lg mb-5">
                        Experience Details:
                    </p>
                    {/* current experience */}
                    <div className="flex mb-5">
                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">
                                Total Experience
                            </div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.CurrentExperience}
                                </span>
                            </p>
                        </div>


                        {/* position */}

                        <div className="w-1/4 sm:w-1/2">
                            <div className="font-medium">Relevant Experience</div>
                        </div>
                        <div className="w-1/4 sm:w-1/2">
                            <p>
                                <span className="font-normal text-gray-500">
                                    {candidate.Position}
                                </span>
                            </p>
                        </div>
                    </div>
                    <p className="font-bold text-lg mb-5">
                        System Details:
                    </p>
                    <div className="flex mb-5">

                        {/* mansoor, i changed the width of the created by and modified by to 1/2 */}
                        <div className='w-1/2 flex'>
                            <div className="w-1/2 sm:w-1/2">
                                <div className="font-medium">
                                    Created By
                                </div>
                            </div>
                            <div className="w-[12rem] sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">
                                        {candidate.CreatedBy}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className='w-1/2 flex'>
                            {/* position */}

                            <div className="w-1/2 sm:w-1/2">
                                <div className="font-medium">Modified By</div>
                            </div>
                            <div className="w-1/2 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">
                                        {candidate.Position}
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
                    <div className="mb-5 text-sm rounded-lg border border-gray-300">
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

                                        {candidate?.skills?.map((skillEntry, index) => (
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
                                        )) || (
                                                <tr>
                                                    <td colSpan="3" className="py-4 text-center text-gray-500">
                                                        No skills available.
                                                    </td>
                                                </tr>
                                            )}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showNewCandidateContent && (
                <div
                    className={"fixed inset-0 bg-black bg-opacity-15 z-50"}
                >
                    <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
                        <EditCandidateForm onClose={handleclose} candidateEditData={candidate} candidateEdit={true} />
                    </div>
                </div>
            )}
        </>
    )
}

export default CandidateViewMiniTab