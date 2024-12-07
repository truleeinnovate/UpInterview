import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoArrowBack } from "react-icons/io5";
import { validateUrl } from '../../../../utils/CandidateValidation';

const Connected_apps_form = ({ onClose, initialData }) => {
    const [formData, setFormData] = useState({
        appName: '',
        description: '',
        redirectUrls: '',
        originUrls: '',
        scope: []
    });
    const [showDropdown, setShowDropdown] = useState(false);

    const predefinedScopes = [
        'read:candidate',
        'read/write:candidate',
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                appName: initialData.appName || '',
                description: initialData.description || '',
                redirectUrls: initialData.redirectUrls || '',
                originUrls: initialData.originUrls || '',
                scope: initialData.scope || []
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const addScope = (scope) => {
        if (!formData.scope.includes(scope)) {
            setFormData((prevState) => ({
                ...prevState,
                scope: [...prevState.scope, scope]
            }));
        }
        setShowDropdown(false);
    };

    const removeScope = (scopeToRemove) => {
        setFormData((prevState) => ({
            ...prevState,
            scope: prevState.scope.filter(scope => scope !== scopeToRemove)
        }));
    };

    const clearAllScopes = () => {
        setFormData((prevState) => ({
            ...prevState,
            scope: []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate URLs
        if (!validateUrl(formData.redirectUrls)) {
            alert('Invalid Redirect URL format');
            return;
        }
        if (!validateUrl(formData.originUrls)) {
            alert('Invalid Origin URL format');
            return;
        }

        try {
            if (initialData && initialData._id) {
                // Update existing app
                const response = await axios.put(`${process.env.REACT_APP_API_URL}/connected-apps/${initialData._id}`, formData);
                console.log('App updated:', response.data);
            } else {
                // Add new app
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/connected-apps`, formData);
                console.log('App saved:', response.data);
            }
            // Clear the form
            setFormData({
                appName: '',
                description: '',
                redirectUrls: '',
                originUrls: '',
                scope: []
            });
            // Close the form
            onClose();
        } catch (error) {
            console.error('Error saving app:', error);
        }
    };

    return (
        <div>
            <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between sm:justify-start items-center p-4">
            <button onClick={onClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                  <IoArrowBack className="text-2xl" />
                </button>
            <h2 className="text-lg font-bold">Connected Apps</h2>
                    <button onClick={onClose} className="focus:outline-none sm:hidden">
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
            <div className="fixed top-16 bottom-16 overflow-auto p-5 w-full text-sm right-0">
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="flex items-center mb-10">
                        <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                            App Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-grow border-b border-gray-300">
                            <input
                                type="text"
                                name="appName"
                                value={formData.appName}
                                onChange={handleChange}
                                className="w-full focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex items-center mb-5">
                        <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                            Origin URLs <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-grow border-b border-gray-300">
                            <input
                                type="text"
                                name="originUrls"
                                value={formData.originUrls}
                                onChange={handleChange}
                                className="w-full focus:outline-none"
                                required
                                placeholder="https://example.com/origin"
                            />
                        </div>
                    </div>
                    <div className="flex items-center mb-5">
                        <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                            Redirect URLs <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-grow border-b border-gray-300">
                            <input
                                type="text"
                                name="redirectUrls"
                                value={formData.redirectUrls}
                                onChange={handleChange}
                                className="w-full focus:outline-none"
                                required
                                placeholder="https://example.com/redirect"
                            />
                        </div>
                    </div>
                    <div className="flex mb-5">
                        <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                            Scopes <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-grow border-b border-gray-300 relative w-1/2">
                            <div className="flex flex-wrap items-center">
                                {formData.scope.map((scope, index) => (
                                    <div key={index} className="flex items-center bg-gray-200 p-2 rounded mr-2 mb-2">
                                        <span>{scope}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeScope(scope)}
                                            className="ml-2 text-gray-500 focus:outline-none"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    className="focus:outline-none border-none flex-grow"
                                    readOnly
                                />
                                {formData.scope.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAllScopes}
                                        className="ml-2 text-gray-500 focus:outline-none absolute top-0 right-0"
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                            {showDropdown && (
                                <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10">
                                    {predefinedScopes.map((scope, index) => (
                                        <div
                                            key={index}
                                            className="p-2 cursor-pointer hover:bg-gray-200"
                                            onClick={() => addScope(scope)}
                                        >
                                            {scope}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex mb-5">
                        <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                            Description
                        </label>
                        <div className="flex-grow">
                            <textarea
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="border p-2 focus:outline-none w-full rounded-md"
                            ></textarea>
                        </div>
                    </div>
                    <div className="footer-buttons flex justify-end">
                        <button
                            type="submit"
                            className="footer-button"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Connected_apps_form;
