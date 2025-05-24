/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { format } from "date-fns";
import axios from 'axios';
import { Search } from 'lucide-react';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { useCustomContext } from '../../../../Context/Contextfetch';
import CustomDatePicker from '../../../../utils/CustomDatePicker';
import { validateCandidateForm, getErrorMessage, countryCodes } from '../../../../utils/CandidateValidation';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { Minimize, Expand, ChevronDown, X } from 'lucide-react';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import { useCandidates } from '../../../../apiHooks/useCandidates';

// Reusable CustomDropdown Component
const CustomDropdown = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  placeholder,
  optionKey, // For objects, e.g., 'QualificationName' or 'University_CollegeName'
  optionValue, // For objects, e.g., 'QualificationName' or number for simple arrays
  disableSearch = false,
  hideLabel = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSelect = (option) => {
    const selectedValue = optionValue ? option[optionValue] : option;
    onChange({ target: { name, value: selectedValue } });
    setShowDropdown(false);
    setSearchTerm('');
  };

  const filteredOptions = options?.filter(option => {
    const displayValue = optionKey ? option[optionKey] : option;
    return displayValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef}>
      {!hideLabel && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
      )}
      <div className="relative">
        <input
          name={name}
          type="text"
          id={name}
          value={value}
          onClick={toggleDropdown}
          placeholder={placeholder}
          autoComplete="off"
          className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
          readOnly
        />
        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
          <ChevronDown className="text-lg w-5 h-5" onClick={toggleDropdown} />
        </div>
        {showDropdown && (
          <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
            {!disableSearch && (
              <div className="border-b">
                <div className="flex items-center border rounded px-2 py-1 m-2">
                  <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${label}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 focus:border-black focus:outline-none w-full"
                  />
                </div>
              </div>
            )}
            {filteredOptions?.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option._id || index}
                  onClick={() => handleSelect(option)}
                  className="cursor-pointer hover:bg-gray-200 p-2"
                >
                  {optionKey ? option[optionKey] : option}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

// Main AddCandidateForm Component
const AddCandidateForm = ({ mode }) => {
  const {
    skills,
    college,
    qualification,
    currentRole,
    // candidateData,
    // addOrUpdateCandidate
  } = useCustomContext();

  const { addOrUpdateCandidate, candidateData } = useCandidates();

  console.log("currentRole", currentRole);


  const { id } = useParams();
  const navigate = useNavigate();

  const imageInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const currentRoleDropdownRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const expertiseOptions = ["Basic", "Medium", "Expert"];
  const [filePreview, setFilePreview] = useState(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [showDropdownCurrentRole, setShowDropdownCurrentRole] = useState(false);
  const [searchTermCurrentRole, setSearchTermCurrentRole] = useState('');

  const experienceCurrentOptions = Array.from({ length: 16 }, (_, i) => i);
  const genderOptions = ["Male", "Female"];
  const experienceOptions = [
    "0-1 Years",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5-6 years",
    "6-7 years",
    "7-8 years",
    "8-9 years",
    "9-10 years",
    "10+ years",
  ];

  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Date_Of_Birth: '',
    Gender: '',
    HigherQualification: '',
    UniversityCollege: '',
    CurrentExperience: '',
    RelevantExperience: '',
    CountryCode: '+91',
    skills: [],
    resume: null,
    CurrentRole: '',
  });
  const [errors, setErrors] = useState({});

  // const authToken = Cookies.get("authToken");
  // const tokenPayload = decodeJwt(authToken);
  // const userId = tokenPayload?.userId;

  useEffect(() => {

    const selectedCandidate = candidateData.find(candidate => candidate._id === id);

    if (id && selectedCandidate) {
      const dob = selectedCandidate.Date_Of_Birth;

      setFormData({
        FirstName: selectedCandidate.FirstName || '',
        LastName: selectedCandidate.LastName || '',
        Email: selectedCandidate.Email || '',
        Phone: selectedCandidate.Phone || '',
        Date_Of_Birth: dob ? format(dob, 'MMMM dd, yyyy') : '',
        Gender: selectedCandidate.Gender || '',
        HigherQualification: selectedCandidate.HigherQualification || '',
        UniversityCollege: selectedCandidate.UniversityCollege || '',
        CurrentExperience: selectedCandidate.CurrentExperience || '',
        RelevantExperience: selectedCandidate.RelevantExperience || '',
        skills: selectedCandidate.skills || [],
        ImageData: selectedCandidate.imageUrl || null,
        resume: selectedCandidate.resume || null,
        CurrentRole: selectedCandidate.CurrentRole || '',
        CountryCode: selectedCandidate.CountryCode || '',
      });

      if (selectedCandidate.resume?.filename) {
        setSelectedResume({
          url: `/Uploads/${selectedCandidate.resume.filename}`,
          name: selectedCandidate.resume.filename,
        });
      } else {
        setSelectedResume(null);
      }

      setEntries(selectedCandidate.skills || []);
      // Initialize allSelectedSkills with the skills from the candidate being edited
      setAllSelectedSkills(selectedCandidate.skills?.map(skill => skill.skill) || []);
    }
  }, [id, candidateData]);

  const toggleCurrentRole = () => {
    setShowDropdownCurrentRole(!showDropdownCurrentRole);
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, CurrentRole: role }));
    setShowDropdownCurrentRole(false);
    setSearchTermCurrentRole(''); // Clear the search term
  };


  const filteredCurrentRoles = currentRole?.filter(role =>
    role.RoleName.toLowerCase().includes(searchTermCurrentRole.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currentRoleDropdownRef.current && !currentRoleDropdownRef.current.contains(event.target)) {
        setShowDropdownCurrentRole(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = (index) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const entry = entries[deleteIndex];
      setAllSelectedSkills(
        allSelectedSkills.filter((skill) => skill !== entry.skill)
      );
      setEntries(entries.filter((_, i) => i !== deleteIndex));
      setDeleteIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
    setSelectedSkill("");
  };


  const filteredSkills = skills.filter(skill =>
    skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEntry = () => {
    if (editingIndex !== null) {
      const oldSkill = entries[editingIndex].skill;
      const updatedEntries = entries.map((entry, index) =>
        index === editingIndex
          ? {
            skill: selectedSkill,
            experience: selectedExp,
            expertise: selectedLevel,
          }
          : entry
      );
      setEntries(updatedEntries);
      setEditingIndex(null);
      setAllSelectedSkills(prev => {
        const newSkills = prev.filter(skill => skill !== oldSkill);
        newSkills.push(selectedSkill);
        return newSkills;
      });

      setEditingIndex(null);

      // setAllSelectedSkills([selectedSkill]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: updatedEntries,
      }));
    } else {
      const newEntry = {
        skill: selectedSkill,
        experience: selectedExp,
        expertise: selectedLevel,
      };

      const updatedEntries = [...entries, newEntry];

      setEntries(updatedEntries);
      setAllSelectedSkills([...allSelectedSkills, selectedSkill]);

      setFormData((prevFormData) => ({
        ...prevFormData,
        skills: updatedEntries,
      }));
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: "",
    }));

    resetForm();
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    // setSelectedSkill(entry.skill);
    setSelectedSkill(entry.skill || "");
    setSelectedExp(entry.experience);
    setSelectedLevel(entry.expertise);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
  };

  const isNextEnabled = () => {
    if (currentStep === 0) {
      if (editingIndex !== null) {
        const currentSkill = entries[editingIndex]?.skill;
        return selectedSkill !== "" &&
          (selectedSkill === currentSkill ||
            !allSelectedSkills.includes(selectedSkill));
      } else {
        return (
          selectedSkill !== "" && !allSelectedSkills.includes(selectedSkill)
        );
      }
    } else if (currentStep === 1) {
      return selectedExp !== "";
    } else if (currentStep === 2) {
      return selectedLevel !== "";
    }
    return false;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsImageUploaded(true);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setSelectedResume(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const removeResume = () => {
    setResumeFile(null);
    setSelectedResume(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let errorMessage = getErrorMessage(name, value);

    if (name === "CurrentExperience" || name === "RelevantExperience") {
      if (!/^\d*$/.test(value)) {
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      Date_Of_Birth: date ? new Date(date).toISOString() : "",
    }));
  };

  const handleClose = () => {
    resetFormData();
    // onClose();
    // navigate('/candidate');

    switch (mode) {
      case 'Edit':
        navigate(`/candidate`);
        break;
      case 'Candidate Edit':
        navigate(`/candidate/${id}`);
        break;
      default: // Create mode
        navigate('/candidate');
    }

  };

  // const userName = tokenPayload?.userName;

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    console.log('Starting add candidate process...');

    // Get user token information
    // const tokenPayload = decodeJwt(Cookies.get('authToken'));
    // const userId = tokenPayload?.userId;
    // const userName = tokenPayload?.userName;
    // const orgId = tokenPayload?.orgId;

    const userId = Cookies.get('userId');
    const userName = Cookies.get('userName')
    const orgId = Cookies.get('organizationId')

    console.log('User info:', { userId, userName, orgId });

    // Validate form data
    const { formIsValid, newErrors } = validateCandidateForm(
      formData,
      entries || [],
      errors || {}
    );

    if (!formIsValid) {
      console.log('Form validation failed:', newErrors);
      setErrors(newErrors);
      return;
    }

    // Prepare candidate data
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");
    console.log('Current date and time:', currentDateTime);

    const data = {
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      Phone: formData.Phone,
      CountryCode: formData.CountryCode,
      CurrentExperience: formData.CurrentExperience,
      RelevantExperience: formData.RelevantExperience,
      HigherQualification: formData.HigherQualification,
      Gender: formData.Gender,
      UniversityCollege: formData.UniversityCollege,
      Date_Of_Birth: formData.Date_Of_Birth,
      skills: entries.map((entry) => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      resume: null,
      CurrentRole: formData.CurrentRole,
      CreatedBy: `${userName} at ${currentDateTime}`,
      LastModifiedById: `${userName} at ${currentDateTime}`,
      ownerId: userId,
      tenantId: orgId
    };

    console.log('Submitting candidate data:', data);

    try {
      // getting the API from the apihooks for add or update candidate (post or patch)
      await addOrUpdateCandidate.mutateAsync({ id, data, file });
      // Reset form and close
      resetFormData();
      console.log('Form reset completed');

      console.log('Navigation to candidate list completed');
    } catch (error) {
      console.error('Failed to add candidate:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting submit process...');

    // Get user token information
    const tokenPayload = decodeJwt(Cookies.get('authToken'));
    const userId = tokenPayload?.userId;
    const userName = tokenPayload?.userName;
    const orgId = tokenPayload?.tenantId;


    // Validate form data
    const { formIsValid, newErrors } = validateCandidateForm(
      formData,
      entries || [],
      errors || {}
    );

    if (!formIsValid) {
      console.log('Form validation failed:', newErrors);
      setErrors(newErrors);
      return;
    }

    // Prepare candidate data
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");
    console.log('Current date and time:', currentDateTime);

    const data = {
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      Phone: formData.Phone,
      CountryCode: formData.CountryCode,
      CurrentExperience: formData.CurrentExperience,
      RelevantExperience: formData.RelevantExperience,
      HigherQualification: formData.HigherQualification,
      Gender: formData.Gender,
      UniversityCollege: formData.UniversityCollege,
      Date_Of_Birth: formData.Date_Of_Birth,
      skills: entries.map((entry) => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      resume: null,
      CurrentRole: formData.CurrentRole,
      ownerId: userId,
      tenantId: orgId
    };

    console.log('Submitting candidate data:', data);

    try {
      let candidateId;
      // getting the API from the apihooks for add or update candidate (post or patch)

      await addOrUpdateCandidate.mutateAsync({ id, data, file });

      // Handle navigation based on mode
      switch (mode) {
        case 'Edit':
          navigate(`/candidate`);
          break;
        case 'Candidate Edit':
          navigate(`/candidate/${id || candidateId}`);


          break;
        default: // Create mode
          navigate('/candidate');
      }

      resetFormData();
    } catch (error) {
      console.error("Error adding candidate:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      FirstName: '',
      LastName: '',
      Email: '',
      Phone: '',
      Date_Of_Birth: '',
      Gender: '',
      HigherQualification: '',
      UniversityCollege: '',
      CurrentExperience: '',
      RelevantExperience: '',
      skills: [],
      CurrentRole: '',
      CountryCode: ''
    });

    setErrors({});
    setEntries([]);
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setEditingIndex(null);
    setCurrentStep(0);
    removeImage();
    removeResume();
    setAllSelectedSkills([])
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200',
    {
      'overflow-y-auto': !isModalOpen,
      'overflow-hidden': isModalOpen,
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <>
      <Modal
        isOpen={true}
        // onRequestClose={onClose}
        className={modalClass}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-custom-blue">
                {id ? "Update Candidate" : "Add New Candidate"}

              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isFullScreen ? (
                    <Minimize className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Expand className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {/* <FaTimes className="text-gray-400 border rounded-full p-1 text-2xl" /> */}
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-6 mb-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden transition-all duration-200 hover:border-blue-400 hover:shadow-lg">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Candidate"
                        className="w-full h-full object-cover"
                      />
                    ) : id && formData?.ImageData?.path ? (
                      <img
                        src={`http://localhost:5000/${formData.ImageData.path}`}
                        alt={formData.FirstName || "Candidate"}
                        onError={(e) => { e.target.src = "/default-profile.png"; }}
                      />
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">Upload Photo</p>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                      {/* Icon placeholder */}
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      {/* Icon placeholder */}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">Profile Photo</p>
                <p className="text-xs text-gray-500">Click to upload</p>
              </div>

              {/* Resume Upload */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => resumeInputRef.current?.click()}
                  className="relative group cursor-pointer w-full max-w-sm"
                >
                  <div className="h-32 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-all duration-200 hover:border-blue-400 hover:shadow-lg">
                    {selectedResume ? (
                      <div className="text-center px-4">
                        <p className="text-sm text-gray-700 font-medium truncate max-w-[180px]">
                          {selectedResume.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedResume.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">Upload Resume</p>
                        <p className="text-xs text-gray-400">PDF or Word document</p>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl">
                      {/* Icon placeholder */}
                    </div>
                  </div>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeChange}
                  />
                  {selectedResume && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeResume();
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      {/* Icon placeholder */}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">Resume</p>
                <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                <p className='text-lg font-semibold col-span-2'>Personal Details</p>
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border sm:text-sm rounded-md border-gray-300 "
                    placeholder="Enter First Name"
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="LastName"
                    value={formData.LastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.LastName && 'border-red-500'}`}
                    placeholder="Enter Last Name"
                  />
                  {errors.LastName && <p className="text-red-500 text-xs pt-1">{errors.LastName}</p>}
                </div>
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" >
                    Date of Birth
                  </label>
                  <CustomDatePicker
                    selectedDate={formData.Date_Of_Birth ? new Date(formData.Date_Of_Birth) : null}
                    onChange={handleDateChange}
                    placeholder="Select date of birth"
                  />
                </div>
                {/* Gender */}

                <CustomDropdown
                  label="Gender"
                  name="Gender"
                  value={formData.Gender}
                  options={genderOptions}
                  onChange={handleChange}
                  error={errors.Gender}
                  placeholder="Select Gender"
                  disableSearch={true}
                />
                <p className='text-lg font-semibold col-span-2'>Contact Details</p>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.Email && 'border-red-500'}`}
                    placeholder="Enter email address"
                  />
                  {errors.Email && <p className="text-red-500 text-xs pt-1">{errors.Email}</p>}
                </div>
                {/* Phone */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex  gap-2">

                    <div className="w-20">
                      <CustomDropdown
                        hideLabel
                        name="CountryCode"
                        value={formData.CountryCode}
                        options={countryCodes}
                        onChange={handleChange}
                        placeholder="+91"
                        error={errors.CountryCode}
                        optionKey="label"
                        optionValue="value"
                        selectedValue={+91}
                        disableSearch={true}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        name="Phone"
                        value={formData.Phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // remove non-digits
                          if (value.length <= 10) {
                            handleChange({ target: { name: 'Phone', value } });
                          }
                        }}
                        maxLength={10}
                        className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.Phone && 'border-red-500'}`}
                        placeholder="Enter Phone number"
                      />

                      {errors.Phone && <p className="text-red-500 text-xs pt-1">{errors.Phone}</p>}
                    </div>
                  </div>
                </div>
                <p className='text-lg font-semibold col-span-2'>Education Details</p>


                {/* higher qualification */}
                <CustomDropdown
                  label="Higher Qualification"
                  name="HigherQualification"
                  value={formData.HigherQualification}
                  options={qualification}
                  onChange={handleChange}
                  error={errors.HigherQualification}
                  placeholder="Select Higher Qualification"
                  optionKey="QualificationName"
                  optionValue="QualificationName"
                />

                {/* University/College */}
                <CustomDropdown
                  label="University College"
                  name="UniversityCollege"
                  value={formData.UniversityCollege}
                  options={college}
                  onChange={handleChange}
                  error={errors.UniversityCollege}
                  placeholder="Select University College"
                  optionKey="University_CollegeName"
                  optionValue="University_CollegeName"
                />
                <p className='text-lg font-semibold col-span-2'>Experience Details</p>
                {/* current experience */}
                <div>
                  <label htmlFor="CurrentExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="CurrentExperience"
                    id="CurrentExperience"
                    min="1"
                    max="15"
                    value={formData.CurrentExperience}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-md shadow-sm focus:ring-2 sm:text-sm ${errors.CurrentExperience ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter current experience"
                  />
                  {errors.CurrentExperience && <p className="text-red-500 text-xs pt-1">{errors.CurrentExperience}</p>}
                </div>
                {/* Relevant Experience */}
                <div>
                  <label htmlFor="CurrentExperience" className="block text-sm font-medium text-gray-700 mb-1">
                    Relevant Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="RelevantExperience"
                    id="RelevantExperience"
                    min="1"
                    max="15"
                    value={formData.RelevantExperience}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-md shadow-sm focus:ring-2 sm:text-sm ${errors.RelevantExperience ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter relevant experience"
                  />
                  {errors.RelevantExperience && <p className="text-red-500 text-xs pt-1">{errors.RelevantExperience}</p>}
                </div>

                {/* Current Role */}

                <div ref={currentRoleDropdownRef}>
                  <label htmlFor="CurrentRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="CurrentRole"
                      type="text"
                      id="CurrentRole"
                      value={formData.CurrentRole}
                      onClick={toggleCurrentRole}
                      placeholder="Select Current Role"
                      autoComplete="off"
                      className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-md shadow-sm focus:ring-2 sm:text-sm ${errors.CurrentRole ? 'border-red-500' : 'border-gray-300'}`}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                      <ChevronDown className="text-lg w-5 h-5" onClick={toggleCurrentRole} />
                    </div>
                    {showDropdownCurrentRole && (
                      <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-60 overflow-y-auto z-10 text-xs">
                        <div className="border-b">
                          <div className="flex items-center border rounded px-2 py-1 m-2">
                            <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search Current Role"
                              value={searchTermCurrentRole}
                              onChange={(e) => setSearchTermCurrentRole(e.target.value)}
                              className="pl-8 focus:border-black focus:outline-none w-full"
                            />
                          </div>
                        </div>
                        {filteredCurrentRoles?.length > 0 ? (
                          filteredCurrentRoles.map((role) => (
                            <div
                              key={role._id}
                              onClick={() => handleRoleSelect(role.RoleName)}
                              className="cursor-pointer hover:bg-gray-200 p-2"
                            >
                              {role.RoleName}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">No roles found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.CurrentRole && <p className="text-red-500 text-xs pt-1">{errors.CurrentRole}</p>}
                </div>







              </div>
              <p className='text-lg font-semibold col-span-2'>Skills Details</p>

              <div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center mb-2">
                    <label htmlFor="Skills" className="text-sm font-medium text-gray-900">
                      Skills <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(true)
                      if (editingIndex === null) {
                        setSelectedSkill(""); // Reset selection when adding new skill
                        setSelectedExp("");
                        setSelectedLevel("");
                      }

                    }}
                    className="flex items-center justify-center text-sm bg-custom-blue text-white px-2 py-1 rounded"
                  >
                    <FaPlus className="mr-1 w-5 h-5" /> Add Skills
                  </button>
                </div>
                {errors.skills && (
                  <p className="text-red-500 text-sm">{errors.skills}</p>
                )}
                <div>
                  <div className="space-y-2 mb-4 mt-5">
                    {entries.map((entry, index) => (
                      <div key={index} className="border p-2 rounded-lg bg-gray-100 w-[100%] sm:w-full md:w-full flex">
                        <div className="flex justify-between border bg-white rounded w-full mr-3">
                          <div className="w-1/3 px-2 py-1 text-center">{entry.skill}</div>
                          <div className="w-1/3 px-2 py-1 text-center">{entry.experience}</div>
                          <div className="w-1/3 px-2 py-1 text-center">{entry.expertise}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button type="button" onClick={() => handleEdit(index)} className="text-custom-blue text-md">
                            <FaEdit />
                          </button>
                          <button type="button" onClick={() => handleDelete(index)} className="text-md">
                            <FaTrash fill='red' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {deleteIndex !== null && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-end items-center right-0 pr-44 z-50">
                      <div className="bg-white p-5 rounded shadow-lg">
                        <p>Are you sure you want to delete this Skill?</p>
                        <div className="flex justify-center space-x-2 mt-4">
                          <button
                            onClick={confirmDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Yes
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-300 text-black px-4 py-2 rounded"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-custom-blue text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {id ? "Update" : "Save"}
                </button>

                {!id && (
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    className="px-4 py-2 bg-custom-blue text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaPlus className="w-5 h-5" /> Add Candidate
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-end items-center right-0 pr-44 z-50">
            <div className="bg-white rounded-lg shadow-lg w-80 relative">
              <header className="flex justify-between items-center w-full border-b py-3 px-4">
                <h2 className="text-lg font-bold">Select Skills</h2>
                <button type="button" className="text-gray-700" onClick={skillpopupcancelbutton}>
                  <FaTimes className="text-gray-400 border rounded-full p-1 text-2xl" />
                </button>
              </header>
              <div>
                {currentStep === 0 && (
                  <div>
                    <div className="max-h-56 overflow-y-auto">
                      <div className="mt-3 ml-4 mb-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Search skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border p-2 mb-3 w-[96%] rounded focus:outline-none"
                          />
                          <div className="min-h-56">
                            {filteredSkills.length > 0 ? (
                              filteredSkills.map(skill => (
                                <label key={skill._id} className="block mb-1">
                                  <input
                                    type="radio"
                                    value={skill.SkillName}
                                    checked={selectedSkill === skill.SkillName}
                                    disabled={allSelectedSkills.includes(skill.SkillName) && selectedSkill !== skill.SkillName}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    className="mr-3"
                                  />
                                  {skill.SkillName}
                                </label>
                              ))
                            ) : (
                              <p className="text-gray-500">No skills available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 1 && (
                  <div>
                    <div className="max-h-56 overflow-y-auto">
                      <div className="mt-3 ml-4 mb-3">
                        {experienceOptions.map(exp => (
                          <label key={exp} className="block mb-1">
                            <input
                              type="radio"
                              name="experience"
                              value={exp}
                              checked={selectedExp === exp}
                              onChange={(e) => setSelectedExp(e.target.value)}
                              className="mr-3"
                            />
                            {exp}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div>
                    <div className="min-h-56 overflow-y-auto">
                      <div className="mt-3 ml-4 mb-3">
                        {expertiseOptions.map(exp => (
                          <label key={exp} className="block mb-1">
                            <input
                              type="radio"
                              name="expertise"
                              value={exp}
                              checked={selectedLevel === exp}
                              onChange={(e) => setSelectedLevel(e.target.value)}
                              className="mr-3"
                            />
                            {exp}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <footer className="flex justify-end border-t py-2 px-4">
                {currentStep === 0 && (
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setSearchTerm("");
                    }}
                    className={`bg-custom-blue text-white px-4 py-2 rounded block float-right ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isNextEnabled()}
                  >
                    Next
                  </button>
                )}
                {currentStep === 1 && (
                  <div className="flex justify-between gap-4">
                    <button type="button" onClick={() => setCurrentStep(0)} className="bg-gray-300 text-black px-4 py-2 rounded">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isNextEnabled()}
                    >
                      Next
                    </button>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="flex justify-between gap-4">
                    <button type="button" onClick={() => setCurrentStep(1)} className="bg-gray-300 text-black px-4 py-2 rounded">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleAddEntry}
                      className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isNextEnabled()}
                    >
                      {editingIndex !== null ? 'Update' : 'Add'}
                    </button>
                  </div>
                )}
              </footer>
            </div>
          </div>
        )}
      </Modal>

    </>
  );
};

export default AddCandidateForm;