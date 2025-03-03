import React, { useState, useEffect } from 'react';
import { MdArrowDropDown } from 'react-icons/md';

const ruleTypes = ["Rule 1", "Rule 2", "Rule 3"];
const objectNames = ["Object A", "Object B", "Object C"];
const accessLevels = ["Read-Only", "Read/Write"];
const roles = ["Role 1", "Role 2", "Role 3"];
const users = ["User 1", "User 2", "User 3"];
const categories = ["Roles", "Users"];

const EditSharingRule = ({ rule, onClose }) => {
    const [showDropdownRuleType, setShowDropdownRuleType] = useState(false);
    const [selectedRuleType, setSelectedRuleType] = useState(rule.ruleType);
    const [showDropdownObjectName, setShowDropdownObjectName] = useState(false);
    const [selectedObjectName, setSelectedObjectName] = useState(rule.objectName);
    const [showDropdownAccess, setShowDropdownAccess] = useState(false);
    const [selectedAccess, setSelectedAccess] = useState(rule.access);
    const [showDropdownCategoryOwnedBy, setShowDropdownCategoryOwnedBy] = useState(false);
    const [selectedCategoryOwnedBy, setSelectedCategoryOwnedBy] = useState("");
    const [showDropdownOptionsOwnedBy, setShowDropdownOptionsOwnedBy] = useState(false);
    const [selectedOptionOwnedBy, setSelectedOptionOwnedBy] = useState(rule.recordsOwnedBy);
    const [showDropdownCategoryShareWith, setShowDropdownCategoryShareWith] = useState(false);
    const [selectedCategoryShareWith, setSelectedCategoryShareWith] = useState("");
    const [showDropdownOptionsShareWith, setShowDropdownOptionsShareWith] = useState(false);
    const [selectedOptionShareWith, setSelectedOptionShareWith] = useState(rule.sharedWith);

    useEffect(() => {
        if (roles.includes(rule.recordsOwnedBy)) {
            setSelectedCategoryOwnedBy("Roles");
        } else if (users.includes(rule.recordsOwnedBy)) {
            setSelectedCategoryOwnedBy("Users");
        }

        if (roles.includes(rule.sharedWith)) {
            setSelectedCategoryShareWith("Roles");
        } else if (users.includes(rule.sharedWith)) {
            setSelectedCategoryShareWith("Users");
        }
    }, [rule]);

    const toggleDropdownRuleType = () => setShowDropdownRuleType(!showDropdownRuleType);
    const toggleDropdownObjectName = () => setShowDropdownObjectName(!showDropdownObjectName);
    const toggleDropdownAccess = () => setShowDropdownAccess(!showDropdownAccess);
    const toggleDropdownCategoryOwnedBy = () => setShowDropdownCategoryOwnedBy(!showDropdownCategoryOwnedBy);
    const toggleDropdownOptionsOwnedBy = () => setShowDropdownOptionsOwnedBy(!showDropdownOptionsOwnedBy);
    const toggleDropdownCategoryShareWith = () => setShowDropdownCategoryShareWith(!showDropdownCategoryShareWith);
    const toggleDropdownOptionsShareWith = () => setShowDropdownOptionsShareWith(!showDropdownOptionsShareWith);

    const handleRuleTypeSelect = (type) => {
        setSelectedRuleType(type);
        setShowDropdownRuleType(false);
    };

    const handleObjectNameSelect = (name) => {
        setSelectedObjectName(name);
        setShowDropdownObjectName(false);
    };

    const handleAccessSelect = (access) => {
        setSelectedAccess(access);
        setShowDropdownAccess(false);
    };

    const handleCategorySelectOwnedBy = (category) => {
        setSelectedCategoryOwnedBy(category);
        setSelectedOptionOwnedBy("");
        setShowDropdownCategoryOwnedBy(false);
    };

    const handleOptionSelectOwnedBy = (option) => {
        setSelectedOptionOwnedBy(option);
        setShowDropdownOptionsOwnedBy(false);
    };

    const handleCategorySelectShareWith = (category) => {
        setSelectedCategoryShareWith(category);
        setSelectedOptionShareWith("");
        setShowDropdownCategoryShareWith(false);
    };

    const handleOptionSelectShareWith = (option) => {
        setSelectedOptionShareWith(option);
        setShowDropdownOptionsShareWith(false);
    };

    const optionsOwnedBy = selectedCategoryOwnedBy === "Roles" ? roles : users;
    const optionsShareWith = selectedCategoryShareWith === "Roles" ? roles : users;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50">
            <div className="bg-white shadow-lg " style={{ width: "50%", height: "100%" }}>
                <div className="border-b p-2">
                    <div className="flex justify-between items-center p-4">
                        <h2 className="text-lg font-bold">Edit Sharing Rule</h2>
                        <button onClick={onClose} className="focus:outline-none">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-5 w-full text-sm">
                    <form className="space-y-8 overflow-auto"  onSubmit={handleSubmit}>
                        <div className="flex items-center mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Label <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow">
                                <input type="text" className="w-full border-b border-gray-300 focus:border-black focus:outline-none" defaultValue={rule.label} />
                            </div>
                        </div>

                        <div className="flex items-center mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Rule Name <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow">
                                <input type="text" className="w-full border-b border-gray-300 focus:border-black focus:outline-none" defaultValue={rule.ruleName} />
                            </div>
                        </div>

                        <div className="flex items-center mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Object Name <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                    value={selectedObjectName}
                                    onClick={toggleDropdownObjectName}
                                    readOnly
                                />
                                <MdArrowDropDown
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    onClick={toggleDropdownObjectName}
                                />
                                {showDropdownObjectName && (
                                    <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                        {objectNames.map((name) => (
                                            <div
                                                key={name}
                                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleObjectNameSelect(name)}
                                            >
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Rule Type <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                    value={selectedRuleType}
                                    onClick={toggleDropdownRuleType}
                                    readOnly
                                />
                                <MdArrowDropDown
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    onClick={toggleDropdownRuleType}
                                />
                                {showDropdownRuleType && (
                                    <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                        {ruleTypes.map((type) => (
                                            <div
                                                key={type}
                                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleRuleTypeSelect(type)}
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Records Owned By <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow flex gap-4">
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                        value={selectedCategoryOwnedBy}
                                        onClick={toggleDropdownCategoryOwnedBy}
                                        readOnly
                                    />
                                    <MdArrowDropDown
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                        onClick={toggleDropdownCategoryOwnedBy}
                                    />
                                    {showDropdownCategoryOwnedBy && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                            {categories.map((category) => (
                                                <div
                                                    key={category}
                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleCategorySelectOwnedBy(category)}
                                                >
                                                    {category}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                        value={selectedOptionOwnedBy}
                                        onClick={toggleDropdownOptionsOwnedBy}
                                        readOnly
                                    />
                                    <MdArrowDropDown
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                        onClick={toggleDropdownOptionsOwnedBy}
                                    />
                                    {showDropdownOptionsOwnedBy && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                            {optionsOwnedBy.map((option) => (
                                                <div
                                                    key={option}
                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleOptionSelectOwnedBy(option)}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Share With <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow flex gap-4">
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                        value={selectedCategoryShareWith}
                                        onClick={toggleDropdownCategoryShareWith}
                                        readOnly
                                    />
                                    <MdArrowDropDown
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                        onClick={toggleDropdownCategoryShareWith}
                                    />
                                    {showDropdownCategoryShareWith && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                            {categories.map((category) => (
                                                <div
                                                    key={category}
                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleCategorySelectShareWith(category)}
                                                >
                                                    {category}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                        value={selectedOptionShareWith}
                                        onClick={toggleDropdownOptionsShareWith}
                                        readOnly
                                    />
                                    <MdArrowDropDown
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                        onClick={toggleDropdownOptionsShareWith}
                                    />
                                    {showDropdownOptionsShareWith && (
                                        <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                            {optionsShareWith.map((option) => (
                                                <div
                                                    key={option}
                                                    className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => handleOptionSelectShareWith(option)}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mb-8">
                            <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                                Access <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-grow relative">
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-300 focus:border-black focus:outline-none"
                                    value={selectedAccess}
                                    onClick={toggleDropdownAccess}
                                    readOnly
                                />
                                <MdArrowDropDown
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                    onClick={toggleDropdownAccess}
                                />
                                {showDropdownAccess && (
                                    <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg">
                                        {accessLevels.map((access) => (
                                            <div
                                                key={access}
                                                className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleAccessSelect(access)}
                                            >
                                                {access}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-5 mb-5">
                            <label className="block text-sm font-medium text-gray-700 w-1/3">
                                Description
                            </label>
                            <div className="flex-grow">
                                <textarea
                                    rows={5}
                                    name="description"
                                    id="description"
                                    className="border p-2 border-gray-300 focus:border-black focus:outline-none mb-5 w-full rounded-md"
                                    defaultValue={rule.description}
                                ></textarea>
                            </div>
                        </div>

                        <div className="footer-buttons flex justify-end p-4 border-t">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSharingRule;