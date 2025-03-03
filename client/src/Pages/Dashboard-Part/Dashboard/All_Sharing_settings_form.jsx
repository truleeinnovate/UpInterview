import React, { useState, useEffect } from "react";
import axios from "axios";
// import { IoArrowBack } from "react-icons/io5";
 

const Sharing_settings_form = ({ onClose }) => {
    const [errors, setErrors] = useState("");
    const [formData, setFormData] = useState({
        Name: "",
        organizationId: "",
        accessBody: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleChangeDescription = (event) => {
        const value = event.target.value;
        setFormData({ ...formData, accessBody: value });
        try {
            JSON.parse(value);
            setErrors({ ...errors, accessBody: "" });
        } catch (error) {
            setErrors({ ...errors, accessBody: "Invalid JSON format" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const parsedAccessBody = JSON.parse(formData.accessBody);
            const dataToSubmit = {
                ...formData,
                accessBody: parsedAccessBody
            };

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/sharing-settings`, dataToSubmit);
            console.log('Saved successfully:', response.data);
            onClose();
        } catch (error) {
            console.error('Error saving sharing settings:', error);
            setErrors({ ...errors, accessBody: "Invalid JSON format" });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="fixed top-0 w-full bg-white border-b">
                <div className="flex justify-between sm:justify-start items-center p-4">
                    <button onClick={onClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                       {/* <IoArrowBack className="text-2xl" />*/}
                    </button>
                    <h2 className="text-lg font-bold">Sharing Settings </h2>
                    <button type="button" onClick={onClose} className="focus:outline-none sm:hidden">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="fixed top-16 bottom-16 overflow-auto p-4 w-full text-sm">
                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="flex gap-5 mb-5">
                        <div>
                            <label htmlFor="Name" className="block mb-2 text-sm font-medium text-gray-900 w-36">
                                Name <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className="flex-grow">
                            <input
                                value={formData.Name}
                                onChange={handleChange}
                                name="Name"
                                type="text"
                                id="Name"
                                className={`border-b focus:outline-none mb-5 w-full ${errors.Name ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                            />
                            {errors.Name && (
                                <p className="text-red-500 text-sm -mt-4">
                                    {errors.Name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Organization ID */}
                    <div className="flex gap-5 mb-5 text-sm">
                        <div>
                            <label htmlFor="organizationId" className="block mb-2 font-medium text-gray-900 w-36">
                                Organization ID <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                className={`border-b focus:outline-none mb-5 w-full ${errors.organizationId ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                value={formData.organizationId}
                                onChange={handleChange}
                                name="organizationId"
                                id="organizationId"
                            />
                            {errors.organizationId && (
                                <p className="text-red-500 text-sm -mt-4">
                                    {errors.organizationId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Access Body */}
                    <div className="flex gap-5 mb-5">
                        <div>
                            <label htmlFor="accessBody" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                                Access Body <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className="flex-grow">
                            <textarea
                                rows={8}
                                onChange={handleChangeDescription}
                                value={formData.accessBody}
                                name="accessBody"
                                id="accessBody"
                                className={`border p-2 focus:outline-none mb-5 w-full rounded-md ${errors.accessBody ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                            ></textarea>
                            {errors.accessBody && (
                                <p className="text-red-500 text-sm -mt-4">
                                    {errors.accessBody}
                                </p>
                            )}
                            {formData.accessBody && (
                                <p className="text-gray-600 text-sm float-right -mt-4">
                                    {formData.accessBody.length}/1000
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="footer-buttons flex justify-end">
                        <button
                            type="submit"
                            className="footer-button bg-custom-blue"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Sharing_settings_form;
