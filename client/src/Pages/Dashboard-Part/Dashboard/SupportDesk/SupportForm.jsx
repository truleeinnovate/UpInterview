/* eslint-disable react/prop-types */
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";

const maxDescriptionLen = 500;

const SupportForm = ({
  reOpen,
  setOpenForm,
  setSupportForm,
  getTickets,
  ticketFromView,
}) => {
  const issuesData = useMemo(() => [
    { id: 0, issue: "Payment" },
    { id: 1, issue: "Technical" },
    { id: 2, issue: "Account" },
  ], []);

  const initialFormState = useMemo(() => ({
    otherIssueFlag: false,
    otherIssue: "",
    selectedIssue: "",
    file: "No file selected",
    description: ""
  }), []);

  const [formState, setFormState] = useState(initialFormState);
  const { otherIssueFlag, otherIssue, selectedIssue, file, description } = formState;
  const fileRef = useRef(null);

  useEffect(() => {
    if (reOpen && ticketFromView) {
      setFormState(prev => ({
        ...prev,
        description: ticketFromView.description,
        file: ticketFromView.fileName,
        selectedIssue: ticketFromView.issueType,
        otherIssue: ticketFromView.issueType
      }));
    }
  }, [reOpen, ticketFromView]);

  const handleClose = useCallback(() => {
    reOpen ? setOpenForm(false) : setSupportForm(false);
    setFormState(initialFormState);
  }, [reOpen, setOpenForm, setSupportForm, initialFormState]);

  const onChangeIssue = useCallback((e) => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      otherIssueFlag: value === "Other",
      selectedIssue: value === "Other" ? "Other" : value,
      otherIssue: value === "Other" ? "" : prev.otherIssue
    }));
  }, []);

  const onChangeFileInput = useCallback((e) => {
    const file = e.target.files[0];
    setFormState(prev => ({
      ...prev,
      file: file ? file.name : "No file selected"
    }));
  }, []);

  const onChangeOtherIssue = useCallback((e) => {
    const value = e.target.value.slice(0, 100);
    setFormState(prev => ({
      ...prev,
      otherIssue: value
    }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    const value = e.target.value.slice(0, maxDescriptionLen);
    setFormState(prev => ({
      ...prev,
      description: value
    }));
  }, []);

  const createFormData = useCallback(() => ({
    issueType: selectedIssue || otherIssue,
    description,
    file: file !== "No file selected" ? file : null,
    ...(reOpen ? {} : {
      contact: "Anu",
      organization: "IBM"
    })
  }), [selectedIssue, otherIssue, description, file, reOpen]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const formData = createFormData();
    
    try {
      const url = reOpen 
        ? `${process.env.REACT_APP_API_URL}/api/update-ticket/${ticketFromView._id}`
        : `${process.env.REACT_APP_API_URL}/api/create-ticket`;
      
      const response = await axios[reOpen ? 'put' : 'post'](url, formData);
      
      alert(response.data.message);
      
      if ((!reOpen && response.data.success) || reOpen) {
        setFormState(initialFormState);
        getTickets();
        handleClose();
      }
    } catch (error) {
      console.error(error);
      alert(reOpen 
        ? "Failed to update ticket. Please try again."
        : "Something went wrong while sending the ticket."
      );
    }
  }, [reOpen, ticketFromView, createFormData, getTickets, handleClose, initialFormState]);

  const renderIssueOptions = useCallback(() => (
    issuesData.map(each => (
      <option className="text-gray-700" key={each.id} value={`${each.issue} Issue`}>
        {each.issue} Issue
      </option>
    ))
  ), [issuesData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full md:w-2/3 lg:w-1/2 h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-teal-700 text-white">
          <h3 className="text-2xl text-teal-50 font-semibold">
            {reOpen ? "Edit Request" : "Support Request"}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-screen">
          <div className="flex-grow p-6 space-y-6">
            {/* Issue Type Section */}
            <div className="grid grid-cols-[auto_1fr] gap-x-[10ch]">
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type <span className="text-red-500">*</span>
              </label>
              {!otherIssueFlag ? (
                <select
                  id="issueType"
                  required
                  value={selectedIssue || otherIssue}
                  onChange={onChangeIssue}
                  className={`w-full border-b-2 focus:outline-none focus:border-teal-500 ${
                    selectedIssue || otherIssue ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  <option value="" className="text-gray-500" hidden>Select issue</option>
                  {renderIssueOptions()}
                  <option className="text-gray-700" value="Other">Other</option>
                </select>
              ) : (
                <div className="relative">
                  <input
                    id="otherIssue"
                    required
                    placeholder="Enter issue"
                    value={otherIssue}
                    onChange={onChangeOtherIssue}
                    className="w-full border-b-2 focus:outline-none focus:border-teal-500"
                  />
                  <p className="absolute right-0 text-gray-700">
                    {otherIssue.length}/100
                  </p>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="grid grid-cols-[auto_1fr] gap-x-[10ch] gap-y-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <div>
                <textarea
                  id="description"
                  rows={10}
                  required
                  value={description}
                  onChange={handleDescriptionChange}
                  className="w-full p-2 text-gray-700 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-right text-gray-500">
                  {description.length}/{maxDescriptionLen}
                </p>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-[auto_1fr] gap-x-[10ch] gap-y-4">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Choose File
              </label>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className={`w-full text-left border-b-2 focus:outline-none focus:border-teal-500 ${
                  file === "No file selected" ? "text-gray-500" : "text-blue-500"
                }`}
              >
                {file}
              </button>
              <input
                id="file"
                ref={fileRef}
                type="file"
                onChange={onChangeFileInput}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end p-5 border-t border-gray-400 space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-teal-600 border-teal-600 border-2 rounded hover:bg-teal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-teal-700 rounded hover:bg-teal-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportForm;
