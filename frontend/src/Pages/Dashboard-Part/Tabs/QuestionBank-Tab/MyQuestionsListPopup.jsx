
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { ReactComponent as IoIosAdd } from '../../../../icons/IoIosAdd.svg';
import axios from "axios";
import Cookies from "js-cookie";
import { Search ,Trash2, X,User,BookOpen} from 'lucide-react';
import { ReactComponent as IoIosAddCircle } from '../../../../icons/IoIosAddCircle.svg';
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../config.js";

const MyQuestionsList1 = forwardRef(({ question, fromcreate, closeDropdown, fromform, onSelectList = () => { }, error, onErrorClear, defaultTenantList, setSelectedLabelnew ,setActionViewMoreSection}, ref) => {
    const {
        fetchMyQuestionsData,
        createdLists,
        setCreatedLists,
        fetchLists,
    } = useCustomContext();
    const [selectedListIds, setSelectedListIds] = useState([]);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListNameForName, setNewListNameForName] = useState("");
    const [searchTermTechnology, setSearchTermTechnology] = useState('');
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    useEffect(() => {
        if (Array.isArray(defaultTenantList)) {
            setSelectedCandidates(defaultTenantList);
        }
    }, [defaultTenantList]);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);

    const userId = tokenPayload?.userId;
    const orgId = tokenPayload?.tenantId;

    const [isEditing, setIsEditing] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState(null);

    useImperativeHandle(ref, () => ({
        openPopup: ({ isEditingMode = false, sectionId = null, label = "" } = {}) => {
            setIsEditing(isEditingMode);
            setEditingSectionId(sectionId);
            setNewListName(label);
            setNewListNameForName(label.replace(/\s+/g, "_"));
            setShowNewListPopup(true);
        },
        clearSelection: () => {
            setSelectedCandidates([]);
            setSelectedListIds([]);
        },
        closePopup: () => setShowNewListPopup(false),
    }));

    const handleSave = async (listIds = []) => {
        if (isEditing) {
            // PUT request for updating the list (no need for questionId)
            if (editingSectionId) {
                const response = await fetch(`${config.REACT_APP_API_URL}/tenant-list/lists/${editingSectionId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        label: newListName,
                        name: newListNameForName,
                        ownerId: userId,
                        tenantId: orgId,
                    }),
                });

                console.log('List updated successfully');
                if (response.ok) {
                    console.log('List updated successfully');
                    setSelectedLabelnew(newListName);
                    Cookies.set("lastSelectedLabel", newListName);
                } else {
                    console.error("Failed to update the list");
                }
            } else {
                console.error("No editingSectionId provided for updating the list");
            }
        } else {
            if (newListName.trim()) {
                try {
                    const response = await axios.post(`${config.REACT_APP_API_URL}/tenant-list/lists`, {
                        label: newListName,
                        name: newListNameForName,
                        ownerId: userId,
                        tenantId: orgId,
                    });
                    console.log('New list created:', response.data);

                    setCreatedLists((prev) => [...prev, response.data]);
                    setNewListName('');
                    setNewListNameForName('');
                } catch (error) {
                    console.error('Error creating new list:', error);
                }
            }
        }
        // callmaindata();
        setShowNewListPopup(false);
        await fetchLists();
        await fetchMyQuestionsData();
    };

    useEffect(() => {
        const savedLabel = Cookies.get("lastSelectedLabel");

        if (savedLabel && typeof setSelectedLabelnew === "function") {
            setSelectedLabelnew(savedLabel); // Call only if the function exists
        }
    }, [setSelectedLabelnew]);

    const handleCreateNewList = () => {
        setShowNewListPopup(true);
    };
    const handleAddToList = async (listIds, questionId) => {
        const questionData = {
            tenantListId: listIds,
            suggestedQuestionId: questionId,
            ownerId: userId,
        };
        console.log("questionData:", questionData);
        if (orgId) {
            questionData.tenentId = orgId;
        }
        try {
            const questionResponse = await axios.post(
                `${config.REACT_APP_API_URL}/newquestion`,
                questionData
            );
            console.log('Question added successfully:', questionResponse.data);
            setSelectedListIds([]);
            closeDropdown();
            console.log('Question added to selected lists successfully');
        } catch (error) {
            console.error('Error adding question to lists:', error);
        }
        await fetchLists();
        await fetchMyQuestionsData();
    };
    const popupRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);
    const togglePopup = () => {
        setShowPopup((prev) => !prev);
    };
    const handleRemoveCandidate = (index) => {
        setSelectedCandidates(selectedCandidates.filter((_, i) => i !== index));
    };
    const clearRemoveCandidate = () => {
        setSelectedCandidates([]);
    };
    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setShowPopup(false);
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleSelectCandidate = (service) => {
        const isSelected = selectedCandidates.some(candidate => candidate._id === service._id);
        if (!isSelected) {
            setSelectedCandidates(prevState => [
                ...prevState,
                { label: service.label, _id: service._id }
            ]);
        } else {
            console.log("Candidate already selected.");
        }
        if (error) {
            onErrorClear();
        }
        setShowPopup(false);
    };
    useEffect(() => {
        onSelectList(selectedCandidates.map(candidate => candidate._id));
    }, [selectedCandidates]);
    return (
        <div>
            {!fromcreate && !fromform && (

                <div className="absolute right-3 mt-10 w-48 bg-white border rounded shadow-lg z-50">
                    <div className="absolute -top-2 right-4 transform translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-300"></div>
                    <div className="flex justify-between items-center mb-2 border-b p-1">
                        <p className="font-semibold">Select List</p>
                        <button onClick={() => closeDropdown()} className="text-gray-500 text-lg font-semibold">
                            &times;
                        </button>
                    </div>
                    <div className="flex items-center cursor-pointer hover:bg-gray-200 p-1 -mt-2 rounded" onClick={handleCreateNewList}>
                        <span><IoIosAdd /></span>
                        <span className="ml-2">Create New List</span>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                        {createdLists.map((list) => (
                            <label key={list._id} className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={selectedListIds.includes(list._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedListIds((prev) => [...prev, list._id]);
                                        } else {
                                            setSelectedListIds((prev) => prev.filter(id => id !== list._id));
                                        }
                                    }}
                                />
                                {list.label}
                            </label>
                        ))}
                    </div>
                    <div className="border-t mt-2 pt-2 flex justify-end p-2">
                        <button
                            className="bg-custom-blue text-white px-4 py-1 rounded mb-1"
                            onClick={() => {
                                handleAddToList(selectedListIds, question._id);
                            }}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
            {fromform && (

                <>                
                <div className="flex flex-col gap-2 mb-5 relative">
                    <div>
                        <label htmlFor="technology" className="block text-sm font-medium text-gray-700 mb-1">
                            Question List <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <div className=" relative" ref={popupRef}>
                       
                        <input
                            className={`w-full px-3 py-2 border sm:text-sm rounded-md border-gray-300  ${error
                                ? "border-red-500"
                                : "border-gray-300 focus:border-black"
                                }`}
                            onClick={togglePopup}

                        />
                     <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                        <MdArrowDropDown className="absolute top-3 text-gray-500 text-lg mt-1 cursor-pointer right-1" onClick={togglePopup} />
                           </div>
                        {showPopup && (
                            <div className="absolute w-full mt-1 z-10 rounded-md bg-white shadow-md max-h-60 overflow-y-auto">
                                <div className="border-b">
                                    <div className="flex items-center border rounded px-2 py-1 m-2">
                                        <Search className="absolute ml-1 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search list"
                                            value={searchTermTechnology}
                                            onChange={(e) => setSearchTermTechnology(e.target.value)}
                                            className="pl-8 focus:border-black focus:outline-none w-full"
                                        />
                                    </div>
                                </div>
                                <ul>
                                    {createdLists
                                        .filter((service) =>
                                            service.label && service.label.toLowerCase().includes(searchTermTechnology.toLowerCase())
                                        )
                                        .slice(0, 4)
                                        .map((service) => (
                                            <li
                                                key={service._id}
                                                className="bg-white border-b cursor-pointer p-1 hover:bg-gray-100"
                                                onClick={() => handleSelectCandidate(service)}
                                            >
                                                {service.label}
                                            </li>
                                        ))}
                                </ul>

                                {/* Create New List Button */}
                                <ul>
                                    <li
                                        className="flex cursor-pointer border-b p-1 bottom-0"
                                        onClick={handleCreateNewList}
                                    >
                                        <IoIosAddCircle className="text-2xl" />
                                        <span>Create New List</span>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* {selectedCandidates.map((candidate, index) => (
                            <div key={index} className="bg-slate-200 rounded px-2 m-1 py-1 inline-block mr-2 text-sm">
                                {candidate.label}
                                <button type="button" onClick={() => handleRemoveCandidate(index)} className="ml-2 bg-gray-300 rounded px-2">x</button>
                            </div>
                        ))}
                        {selectedCandidates.length > 0 && (
                            <button type="button" onClick={clearRemoveCandidate} className="bg-slate-300 rounded px-2 absolute top-0 text-sm float-end right-4">X</button>
                        )} */}


                        {error && <p className="text-red-500 text-sm ">{error}</p>}
                    </div>

                </div>

                 <div className=" px-4 py-3 rounded-md border border-gray-200 -mt-3">
                {selectedCandidates.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">No Question List selected</p>
                ) :(
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-700">
                                        {selectedCandidates.length} Question List{selectedCandidates.length !== 1 ? "s" : ""} selected
                                    </span>
                                </div>
                                {selectedCandidates.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearRemoveCandidate}
                                        className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Selected Skills */}
                            <div className="flex flex-wrap gap-2">
                                {selectedCandidates.map((candidate, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2"
                                        style={{ minWidth: '150px', maxWidth: '250px' }}
                                    >
                                        <div className="flex-1 overflow-hidden">
                                            <span className="ml-2 text-sm text-blue-800 truncate whitespace-nowrap">
                                                {candidate.label}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCandidate(index)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 ml-2"
                                            title="Remove skill"
                                        >
                                            <X className="h-4 w-4 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                        </div>


                </>

            )}


            {showNewListPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white flex flex-col rounded-md">
                        <div className="border-b p-2 flex justify-between bg-custom-blue items-center rounded-t-md">
                            <h2 className="text-lg text-white font-semibold">
                                {isEditing ? "Edit List" : "New List"}
                            </h2>
                        </div>
                        <div className="p-2">
                            <div className="flex items-center gap-5">
                                <label className="text-sm font-semibold mr-2 mt-2 w-20">
                                    Label <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => {
                                        const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_ ]/g, ""); // Allow letters, numbers, underscores, and spaces
                                        setNewListName(sanitizedValue);
                                    }}
                                    onBlur={() => setNewListNameForName(newListName.replace(/\s+/g, "_"))} // Replace spaces with underscores when the input loses focus
                                    className="border-b flex-grow p-2 mt-2 focus:outline-none"
                                    placeholder="Enter label"
                                />
                            </div>
                        </div>
                        <div className="p-2">
                            <div className="flex items-center mb-2 gap-5">
                                <label className="text-sm font-semibold mr-2 mt-2 w-20">
                                    {/* List Name <span className="text-red-500">*</span> */}
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newListNameForName}
                                    readOnly
                                    className="border-b flex-grow p-2 mt-2 focus:outline-none"
                                    placeholder="List name"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end border-t p-2 rounded-b-md text-sm">
                            <button
                                className="border border-custom-blue px-4 py-2 rounded mr-2"
                                onClick={() =>{ 
                                    setShowNewListPopup(false)
                                setActionViewMoreSection(false)
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-custom-blue text-white px-4 py-2 rounded"
                                onClick={handleSave}
                            >
                                {isEditing ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
});

export default MyQuestionsList1