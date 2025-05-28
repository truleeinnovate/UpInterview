/* eslint-disable react/prop-types */
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineFullscreen, MdOutlineFullscreenExit } from "react-icons/md";
import { toast } from "react-toastify";
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from 'js-cookie';
import { config } from "../../../../config";

const maxDescriptionLen = 500;

const SupportForm = () => {
      const tokenPayload = decodeJwt(Cookies.get('authToken'));
      const ownerId = tokenPayload?.userId;
      const tenantId = tokenPayload?.tenantId;
  const navigate = useNavigate();
  const location = useLocation();
  const initialTicketData = location.state?.ticketData;
  const editMode = location.pathname.includes('/edit-ticket');
  const [isFullWidth, setIsFullWidth] = useState(false);

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
  
  // eslint-disable-next-line no-unused-vars
  const [contact, setContact] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [organization, setOrganization] = useState('');
  
  // this useEffect is used to fetch the contact and organization details
  // while getting users we will get roleid from roleid we will get rolename
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/api/auth/users/${ownerId}`);
        setContact(response.data.Name);

        const response2 = await axios.get(`${config.REACT_APP_API_URL}/organization/${response.data.tenantId}`);
        setOrganization(response2.data.Organization);
        
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);


  useEffect(() => {
    if (editMode && initialTicketData) {
      setFormState(prev => ({
        ...prev,
        description: initialTicketData.description || "",
        file: initialTicketData.fileName || "No file selected",
        selectedIssue: initialTicketData.issueType || "",
        otherIssue: initialTicketData.issueType || "",
        otherIssueFlag: !issuesData.some(item => `${item.issue} Issue` === initialTicketData.issueType)
      }));
    }
  }, [editMode, initialTicketData, issuesData]);

  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

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
    ...(editMode ? {} : {
      contact: "Anu",//this is the contact of the current user
      tenantId,//this is the organization of the current user
      ownerId,
    })
  }), [selectedIssue, otherIssue, description, file, editMode]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const formData = createFormData();
    
    try {
      const url = editMode 
        ? `${config.REACT_APP_API_URL}/update-ticket/${initialTicketData._id}`
        : `${config.REACT_APP_API_URL}/create-ticket`;
      
      const response = await axios[editMode ? 'patch' : 'post'](url, formData);
      
      toast.success(response.data.message);
      
      if (response.data.success) {
        setFormState(initialFormState);
        navigate('/support-desk');
      }
    } catch (error) {
      console.error(error);
      toast.error(editMode 
        ? "Failed to update ticket. Please try again."
        : "Something went wrong while sending the ticket."
      );
    }
  }, [editMode, initialTicketData, createFormData, navigate, initialFormState]);

  const renderIssueOptions = useCallback(() => (
    issuesData.map(each => (
      <option className="text-gray-700" key={each.id} value={`${each.issue} Issue`}>
        {each.issue} Issue
      </option>
    ))
  ), [issuesData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50">
      <div 
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-lg transform transition-all duration-500 ease-in-out ${isFullWidth ? 'w-full' : 'w-1/2'}`}
      >
        {/* Header */}
        <div className=" border-b">
          <div className="flex justify-between items-center p-4">
            <button onClick={() => navigate('/support-desk')} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
              <IoArrowBack className="text-2xl" />
            </button>
            <h2 className="text-lg font-medium">{editMode ? "Edit Support Ticket" : "New Support Ticket"}</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFullWidth} 
                className="focus:outline-none hover:bg-opacity-10 hover:bg-white rounded-full p-1 transition-all duration-200"
                title={isFullWidth ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullWidth ? (
                  <MdOutlineFullscreenExit className="text-2xl" />
                ) : (
                  <MdOutlineFullscreen className="text-2xl" />
                )}
              </button>
              <button onClick={() => navigate('/support-desk')} className="focus:outline-none sm:hidden">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-56px)]">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <form onSubmit={handleSubmit}>
              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                {/* Issue Type Section */}
                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  {!otherIssueFlag ? (
                    <select
                      id="issueType"
                      required
                      value={selectedIssue || otherIssue}
                      onChange={onChangeIssue}
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
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
                        className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                      />
                      <p className="text-right text-gray-500 text-xs mt-1">
                        {otherIssue.length}/100
                      </p>
                    </div>
                  )}
                </div>

                {/* Description Section */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div>
                    <textarea
                      id="description"
                      rows={8}
                      required
                      value={description}
                      onChange={handleDescriptionChange}
                      className="w-full border rounded-md px-2 py-1.5 border-gray-300 focus:border-custom-blue focus:outline-none transition-colors duration-200"
                    />
                    <p className="text-right text-gray-500 text-xs mt-1">
                      {description.length}/{maxDescriptionLen}
                    </p>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Choose File
                    </button>
                    <span className="ml-3 text-sm text-gray-500">
                      {file}
                    </span>
                  </div>
                  <input
                    id="file"
                    ref={fileRef}
                    type="file"
                    onChange={onChangeFileInput}
                    className="hidden"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 bg-white border-t">
            <button
              type="button"
              onClick={() => navigate('/support-desk')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors duration-200 text-sm font-medium"
            >
              {editMode ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportForm;
