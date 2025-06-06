
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { ReactComponent as IoIosAdd } from '../../../../icons/IoIosAdd.svg';
import axios from "axios";
import Cookies from "js-cookie";
import { X } from 'lucide-react';
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../config.js";


const MyQuestionsList1 = forwardRef(({ question, fromcreate, closeDropdown, fromform, onSelectList = () => { }, defaultTenantList, setSelectedLabelnew, setActionViewMoreSection }, ref) => {
    const {
        fetchMyQuestionsData,
        createdLists,
        setCreatedLists,
        fetchLists,
    } = useCustomContext();
    const [selectedListIds, setSelectedListIds] = useState([]);
    console.log("selectedListIds ", selectedListIds);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListNameForName, setNewListNameForName] = useState("");
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [inputError, setInputError] = useState("");

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
        if (!newListName.trim()) {
            setInputError("Label is required.");
            return;
        }
        if (!newListNameForName.trim()) {
            setInputError("Name is required.");
            return;
        }
        setInputError("");

        if (isEditing) {
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
            setSelectedLabelnew(savedLabel);
        }
    }, [setSelectedLabelnew]);

    const handleCreateNewList = () => {
        setShowNewListPopup(true);
    };
    const handleAddToList = async (listIds, questionId) => {
        console.log("listIds", listIds);
        console.log("questionId", questionId);
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
    // const popupRef = useRef(null);
    // const [showPopup, setShowPopup] = useState(false);

    // const handleClickOutside = (event) => {
    //     if (popupRef.current && !popupRef.current.contains(event.target)) {
    //         // setShowPopup(false);
    //     }
    // };
    // useEffect(() => {
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);
    useEffect(() => {
        onSelectList(selectedCandidates.map(candidate => candidate._id));
    }, [selectedCandidates]);

    return (
        <div>
            {!fromcreate && !fromform && (
                <div className="absolute right-3 mt-10 w-60 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="absolute -top-2 right-4 transform translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-300"></div>

                    {/* Header */}
                    <div className="flex justify-between border border-b border-gray-50 items-center px-4 py-2 bg-white rounded-t-lg">
                        <p className="text-base font-semibold text-custom-blue">Select List</p>
                        <button onClick={closeDropdown}>
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Create List */}
                    <div
                        className="flex items-center gap-2 text-sm px-3 py-1 border border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition rounded"
                        onClick={handleCreateNewList}
                    >
                        <IoIosAdd className="text-lg text-custom-blue" />
                        <span>Create New List</span>
                    </div>

                    {/* List Items */}
                    <div className="max-h-40 overflow-y-auto px-3 pt-1">
                        {createdLists.map((list) => (
                            <label
                                key={list._id}
                                className="flex items-center gap-2 py-1 text-sm hover:bg-gray-50 rounded px-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedListIds.includes(list._id)}
                                    onChange={(e) =>
                                        e.target.checked
                                            ? setSelectedListIds((prev) => [...prev, list._id])
                                            : setSelectedListIds((prev) => prev.filter(id => id !== list._id))
                                    }
                                />
                                {list.label}
                            </label>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-3 py-2 rounded-b-lg border border-t border-gray-100">
                        <button
                            className="bg-custom-blue text-white text-sm font-medium px-4 py-1 rounded"
                            onClick={() => handleAddToList(selectedListIds, question._id)}
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {/* New List Modal */}
            {showNewListPopup && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl w-[360px] max-w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-xl">
                            <h2 className="text-lg font-semibold text-custom-blue">
                                {isEditing ? "Edit List" : "New List"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowNewListPopup(false);
                                    setInputError("");
                                    setNewListName("");
                                    setNewListNameForName("");
                                }}
                            >
                                <X className="w-6 h-6 text-gray-500 hover:text-gray-800" />
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="px-5 py-2 space-y-4">
                            {/* Label */}
                            <div className="flex items-center">
                                <label className="text-sm font-medium w-20">Label <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newListName}
                                    onChange={(e) => {
                                        const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9_ ]/g, "");
                                        setNewListName(sanitizedValue);
                                        setInputError("");
                                    }}
                                    onBlur={() => setNewListNameForName(newListName.replace(/\s+/g, "_"))}
                                    className="flex-1 px-3 py-2 h-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-custom-blue"
                                    placeholder="Enter label"
                                />
                            </div>
                            {inputError && (
                                <div className="text-red-500 text-xs ml-20">{inputError}</div>
                            )}

                            {/* Name */}
                            <div className="flex items-center">
                                <label className="text-sm font-medium w-20">Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newListNameForName}
                                    readOnly
                                    className="flex-1 px-3 py-2 h-10 border border-gray-200 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-custom-blue"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-5 py-3 rounded-b-xl bg-white">
                            <button
                                className="bg-custom-blue text-white text-sm font-semibold px-5 py-2 rounded"
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