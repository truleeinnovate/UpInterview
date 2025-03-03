import React, { useState, useEffect } from "react";
import axios from "axios";
import { validateTaskForm, getErrorMessage } from '../../../utils/AppTaskValidation';
// import { MdArrowDropDown } from "react-icons/md";
// import { IoArrowBack } from "react-icons/io5";

const EditTask = ({ onClose, taskData, onTaskUpdated }) => {
    const [formData, setFormData] = useState({
        title: taskData.title || "",
        assignedTo: taskData.assignedTo || "",
        priority: taskData.priority || "Normal",
        status: taskData.status || "New",
        dueDate: taskData.dueDate || "",
        comments: taskData.comments || "",
    });

    const [errors, setErrors] = useState({});
    const [showDropdownPriority, setShowDropdownPriority] = useState(false);
    const [showDropdownStatus, setShowDropdownStatus] = useState(false);

    const priorities = ["High", "Normal"];
    const statuses = ["New", "In Progress", "Completed", "No Response"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        const errorMessage = getErrorMessage(name, value);
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: errorMessage });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { formIsValid, newErrors } = validateTaskForm(formData, errors);
        setErrors(newErrors);

        if (!formIsValid) {
            return;
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/task/${taskData._id}`, formData);
            if (response.data) {
                onTaskUpdated(response.data);
                onClose();
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-15 z-50" >
            <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
                <div className="fixed top-0 w-full bg-white border-b">
                    <div className="flex justify-between sm:justify-start items-center p-4">
                        <button onClick={onClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
                            {/* <IoArrowBack className="text-2xl" /> */}
                        </button>
                        <h2 className="text-lg font-bold">Edit Task</h2>
                        <button onClick={onClose} className="focus:outline-none sm:hidden">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="fixed top-16 bottom-16 overflow-auto p-4 w-full text-sm right-0">
                    <form className="group" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3">
                            <div className="sm:col-span-3 md:col-span-3 lg:col-span-3 xl:col-span-2 2xl:col-span-2 sm:mt-44">
                                {/* Title */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Title
                                    </label>
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className={`border-b focus:outline-none mb-5 w-full ${errors.title ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm -mt-4">{errors.title}</p>}
                                    </div>
                                </div>

                                {/* Assigned To */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="assignedTo" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Assigned To
                                    </label>
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            name="assignedTo"
                                            id="assignedTo"
                                            value={formData.assignedTo}
                                            onChange={handleChange}
                                            className={`border-b focus:outline-none mb-5 w-full ${errors.assignedTo ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                        />
                                        {errors.assignedTo && <p className="text-red-500 text-sm -mt-4">{errors.assignedTo}</p>}
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="priority" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Priority
                                    </label>
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            name="priority"
                                            id="priority"
                                            value={formData.priority}
                                            onClick={() => setShowDropdownPriority(!showDropdownPriority)}
                                            readOnly
                                            className={`border-b focus:outline-none mb-5 w-full ${errors.priority ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                        />
                                        {/* <MdArrowDropDown className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2" onClick={() => setShowDropdownPriority(!showDropdownPriority)} /> */}
                                        {showDropdownPriority && (
                                            <div className="absolute top-full -mt-4 w-full rounded-md bg-white shadow-lg z-50">
                                                {priorities.map((priority) => (
                                                    <div key={priority} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => setFormData({ ...formData, priority })}>
                                                        {priority}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.priority && <p className="text-red-500 text-sm -mt-4">{errors.priority}</p>}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Status
                                    </label>
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            name="status"
                                            id="status"
                                            value={formData.status}
                                            onClick={() => setShowDropdownStatus(!showDropdownStatus)}
                                            readOnly
                                            className={`border-b focus:outline-none mb-5 w-full ${errors.status ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                        />
                                        {/* <MdArrowDropDown className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2" onClick={() => setShowDropdownStatus(!showDropdownStatus)} /> */}
                                        {showDropdownStatus && (
                                            <div className="absolute top-full -mt-4 w-full rounded-md bg-white shadow-lg z-50">
                                                {statuses.map((status) => (
                                                    <div key={status} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => setFormData({ ...formData, status })}>
                                                        {status}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.status && <p className="text-red-500 text-sm -mt-4">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="dueDate" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Due Date
                                    </label>
                                    <div className="relative flex-grow">
                                        <input
                                            type="date"
                                            name="dueDate"
                                            id="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                            className={`border-b focus:outline-none mb-5 w-full ${errors.dueDate ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                        />
                                        {errors.dueDate && <p className="text-red-500 text-sm -mt-4">{errors.dueDate}</p>}
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="flex gap-5 mb-5">
                                    <label htmlFor="comments" className="block text-sm font-medium leading-6 text-gray-900 w-36">
                                        Comments
                                    </label>
                                    <div className="relative flex-grow">
                                        <textarea
                                            name="comments"
                                            id="comments"
                                            rows="5"
                                            value={formData.comments}
                                            onChange={handleChange}
                                            className={`border focus:outline-none mb-5 w-full ${errors.comments ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                                        />
                                        {errors.comments && <p className="text-red-500 text-sm -mt-4">{errors.comments}</p>}
                                    </div>
                                </div>


                            </div>
                        </div>
                        {/* Footer */}
                        <div className="footer-buttons flex justify-end">
                            <button type="submit" className="footer-button bg-custom-blue" >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTask; 