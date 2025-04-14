import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes, FaPlus, FaCamera, FaTrash, FaExpand, FaCompress, FaFileUpload, FaFile } from 'react-icons/fa';
import classNames from 'classnames';
import { format } from "date-fns";
import { FaEdit } from "react-icons/fa";
import axios from 'axios';
import { useCustomContext } from '../../../../Context/Contextfetch';
import CustomDatePicker from '../../../../utils/CustomDatePicker';
import { validateCandidateForm,getErrorMessage,countryCodes } from '../../../../utils/CandidateValidation';
import Cookies from 'js-cookie';
const experienceCurrentOptions = Array.from({ length: 16 }, (_, i) => i); 

Modal.setAppElement('#root');

// eslint-disable-next-line react/prop-types
const AddCandidateForm = ({ isOpen, onClose, selectedCandidate, isEdit  }) => {
  // onSave
  const {
    skills,
    college,
    qualification,
  } = useCustomContext ();
  // console.log("selectedCandidate ", selectedCandidate);
  
  const imageInputRef = useRef(null);
  const resumeInputRef = useRef(null);
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
    CountryCode:'',
    skills: [],
    // ImageData: null,
    resume: null,
    CurrentRole:'',
  });
  const [errors, setErrors] = useState({});
    const userId = Cookies.get("userId");
  // const [startDate, setStartDate] = useState(null);


  // console.log("startDate  ", startDate); 
  

  useEffect(() => {
    if (isEdit && selectedCandidate) {
      const dob = selectedCandidate.Date_Of_Birth
      const phone = selectedCandidate.Phone || '';
const countryCode = phone.startsWith('+') ? phone.split(' ')[0] : '';
const phoneNumber = phone.startsWith('+') ? phone.split(' ')[1] : phone;
  
      setFormData({
        FirstName: selectedCandidate.FirstName || '',
        LastName: selectedCandidate.LastName || '',
        Email: selectedCandidate.Email || '',
        Phone: phoneNumber || '',
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
        CountryCode:countryCode || '',
      });


      if (selectedCandidate.resume?.filename) {
        setSelectedResume({
          url: `/uploads/${selectedCandidate.resume.filename}`,
          name: selectedCandidate.resume.filename,
        });
      } else {
        setSelectedResume(null);
      }

      setEntries(selectedCandidate.skills || []);
    }
  }, [isEdit, selectedCandidate]);


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
  }


  const handleAddEntry = () => {
    if (editingIndex !== null) {
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
      setAllSelectedSkills([selectedSkill]);
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
        skills: updatedEntries, // Update skills in formData
      }));


      // setEntries([
      //   ...entries,
      //   {
      //     skill: selectedSkill,
      //     experience: selectedExp,
      //     expertise: selectedLevel,
      //   },
      // ]);
      // setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
      // setFormData((prevFormData) => ({
      //   ...prevFormData,
      //   skills: updatedEntries, // Update skills in formData
      // }));
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      skills: "",
    }));

    resetForm();
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    setSelectedSkill(entry.skill);
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
        return selectedSkill !== "";
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


  // Handle Image Upload & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsImageUploaded(true);
    }
  };

  // Handle Resume Upload
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setSelectedResume(file);
    }
  };

  // Remove Image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Remove Resume
  const removeResume = () => {
    setResumeFile(null);
    setSelectedResume(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

     // Validation Logic
  let errorMessage = getErrorMessage(name, value);

  // Restrict non-numeric input for experience fields
  if (name === "CurrentExperience" || name === "RelevantExperience") {
    if (!/^\d*$/.test(value)) {
      return; // Prevent updating state if input is not a number
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
    // setStartDate(date); 
  
    // setErrors((prevErrors) => ({
    //   ...prevErrors,
    //   Date_Of_Birth: getErrorMessage("Date_Of_Birth", date),
    // }));
  };

  const handleClose = () => {
    // Reset form data
    resetFormData()
      onClose();

  };

  const userName = Cookies.get("userName");

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    const orgId = Cookies.get("organizationId");
    const { formIsValid, newErrors } = validateCandidateForm (
      formData,
      entries || [],
      errors || {}
    );
  
    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }
    
      const fullPhoneNumber = `${formData.CountryCode} ${formData.Phone}`;
        const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");

        const data = {
          FirstName: formData.FirstName,
          LastName: formData.LastName,
          Email: formData.Email,
          Phone: fullPhoneNumber,
          CurrentExperience: formData.CurrentExperience,
          RelevantExperience:formData.RelevantExperience,
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
          CurrentRole:formData.CurrentRole,
      
          CreatedBy: `${userName} at ${currentDateTime}`,
          LastModifiedById: `${userName} at ${currentDateTime}`,
          ownerId: userId,
        };
    
        if (orgId) {
          data.tenantId = orgId;
        }
    

    // if (imageFile) data.append("ImageData", imageFile);
    // if (resumeFile) data.append("resume", resumeFile);
  
    try {
      console.log("Submitting new candidate...", formData);
      let candidateId;
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/candidate/`, data, {
        // headers: { "Content-Type": "multipart/form-data" },
      });

       candidateId = await response.data.data._id;
            if (file) {
              const imageData = new FormData();
              imageData.append("image", file);
              imageData.append("type", "candidate");
              imageData.append("id", candidateId);
      
              await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            } 
            // else if (!isImageUploaded && !filePreview && candidateEdit) {
            //   await axios.delete(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}/image`);
            // }
  
      if (response.status === 200 || response.status === 201) {
        console.log("Candidate added successfully:", response.data);

        resetFormData();
      }
    } catch (error) {
      console.error("Failed to add candidate:", error);
    }
  };



  const handleSubmit = async(e) => {
    e.preventDefault();
    const orgId = Cookies.get("organizationId");
    const { formIsValid, newErrors } = validateCandidateForm(
      formData,
      entries || [],
      // selectedPosition || "", 
      errors || {}
    );

    if (!formIsValid) {
      setErrors(newErrors);
      return;
    }

    console.log("before form data", formData);
    

 
    const fullPhoneNumber = `${formData.CountryCode} ${formData.Phone}`;
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");

    const data = {
      FirstName: formData.FirstName,
      LastName: formData.LastName,
      Email: formData.Email,
      Phone: fullPhoneNumber,
      CurrentExperience: formData.CurrentExperience,
      RelevantExperience:formData.RelevantExperience,
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
      CurrentRole:formData.CurrentRole,
  
      CreatedBy: `${userName} at ${currentDateTime}`,
      LastModifiedById: `${userName} at ${currentDateTime}`,
      ownerId: userId,
    };

    if (orgId) {
      data.tenantId = orgId;
    }

    try {

      console.log("before update api", formData);
      let candidateId;
      let response; 

      if (isEdit && selectedCandidate?._id) {
        // **PATCH request for editing**
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/candidate/${selectedCandidate._id}`,
          data,
          // {
          //   headers: { "Content-Type": "multipart/form-data" },
          // }
        );
        console.log("Candidate updated:", response.data);
      } else {
        // **POST request for adding new candidate**
        response = await axios.post(`${process.env.REACT_APP_API_URL}/candidate`, data, {
          // headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Candidate added:", response.data);
      }

      candidateId = await response.data.data._id;
      if (file) {
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "candidate");
        imageData.append("id", candidateId);

        await axios.post(`${process.env.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    
      } else if (!isImageUploaded && !filePreview && isEdit) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}/image`);
      }
  
      if (response.status === 200 || response.status === 201) {
        onClose();
        resetFormData();
      }

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
  };
  
  


  // 'sm': {'max': '639px'},
  // 'md': {'min': '640px', 'max': '1023px'},
  // 'lg': {'min': '1024px', 'max': '1279px'},
  // 'xl': {'min': '1280px', 'max': '1535px'},
  // '2xl': {'min': '1536px'},

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-custom-blue">
              Add New Candidate
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <FaCompress className="w-5 h-5 text-gray-500" />
                ) : (
                  <FaExpand className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
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
                  ) : isEdit && formData?.ImageData?.path ? (
                  <img 
                  src={`http://localhost:5000/${formData.ImageData.path}`} 
                  alt={formData.FirstName || "Candidate"} 
                  onError={(e) => { e.target.src = "/default-profile.png"; }} // Fallback image if error
                />
              ): (
                    <>
                      <FaCamera className="w-8 h-8 text-gray-300 mb-1" />
                      <p className="text-xs text-gray-400">Upload Photo</p>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                    <FaCamera className="w-6 h-6 text-white" />
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
                    <FaTrash className="w-3 h-3" />
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
                      <FaFile className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                      <p className="text-sm text-gray-700 font-medium truncate max-w-[180px]">
                        {selectedResume.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedResume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <FaFileUpload className="w-8 h-8 text-gray-300 mb-1" />
                      <p className="text-xs text-gray-400">Upload Resume</p>
                      <p className="text-xs text-gray-400">PDF or Word document</p>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl">
                    <FaFileUpload className="w-6 h-6 text-white" />
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
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">Resume</p>
              <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
            </div>
          </div>

          <form  className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name 
                </label>
                <input
                  type="text"
                  name="FirstName"
                  // required
                  value={formData.FirstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  "
                  placeholder="Enter First Name"
                />
                {/* {errors.FirstName && <p className="text-red-500 text-xs pt-1">{errors.FirstName}</p>} */}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="LastName"
                  // required
                  value={formData.LastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent ${errors.LastName && 'border border-red-500'}`}
                  placeholder="Enter Last Name"
                />
                {errors.LastName && <p className="text-red-500 text-xs pt-1">{errors.LastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent  ${errors.Email && 'border border-red-500'}`}
                  placeholder="Enter email address"
                />
                {errors.Email && <p className="text-red-500 text-xs pt-1">{errors.Email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <div className="flex gap-2 ">
                  <select name="CountryCode" value={formData.CountryCode} onChange={handleChange} className="px-1 py-2 md:w-16 border rounded-lg ">
                    {countryCodes.map(code => (
                      <option key={code.value} value={code.value}>{code.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent  ${errors.Phone && 'border border-red-500'}`}
                    placeholder="Enter Phone number"
                  />
                </div>
                {errors.Phone && <p className="text-red-500 text-xs pt-1 ">{errors.Phone}</p>}
              </div>
              <div >
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth 
                </label>
                <CustomDatePicker
                selectedDate={formData.Date_Of_Birth ? new Date(formData.Date_Of_Birth) : null}
                  // selectedDate={startDate instanceof Date && !isNaN(startDate) ? startDate : null}
                  // selectedDate={startDate}
                  onChange={handleDateChange}
                  // errors={errors.Date_Of_Birth}
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="Gender"
                  // required
                  value={formData.Gender}
                  onChange={handleChange}
                  className= {`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent  ${errors.Gender && 'border border-red-500'}`}
                >
                  <option value="">Select Gender</option>
                  <option value="Engineering">Male</option>
                  <option value="Product">Female</option>
                </select>
                {errors.Gender && <p className="text-red-500 text-xs pt-1">{errors.Gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Role 
                </label>
                <input
                  type="text"
                  name="CurrentRole"
                  value={formData.CurrentRole}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-black rounded-lg "
                  placeholder="Enter current role"
                />
                {errors.CurrentRole && <p className="text-red-500 text-xs pt-1">{errors.CurrentRole}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Higher Qualification *
                </label>
                <select
                  name="HigherQualification"
                  // required
                  value={formData.HigherQualification}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.HigherQualification && 'border border-red-500'}`}
                >
                  <option value="">Select Higher Qualification</option>
                  {qualification.map((qualification) => (
                    <option key={qualification._id} value={qualification.QualificationName}>
                      {qualification.QualificationName}
                    </option>
                  ))}
                </select>
                {errors.HigherQualification && <p className="text-red-500 text-xs pt-1">{errors.HigherQualification}</p>}

              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University College *
                </label>
                <select
                  name="UniversityCollege"
                  // required
                  value={formData.UniversityCollege}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg   ${errors.UniversityCollege && 'border border-red-500'}`}
                >
                  <option value="">Select University College</option>

                  {/* Dynamically populate dropdown with university/college names */}
                  {college.map((university) => (
                    <option key={university._id} value={university.University_CollegeName}>
                      {university.University_CollegeName}
                    </option>
                  ))}
                </select>
                {errors.UniversityCollege && <p className="text-red-500 text-xs pt-1">{errors.UniversityCollege}</p>}

              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Experience *
                </label>
                <select
    name="CurrentExperience"
    value={formData.CurrentExperience}
    onChange={handleChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg     ${errors.CurrentExperience && 'border border-red-500'}`}
  >
    <option value="">Select Current Experience</option>
    {experienceCurrentOptions.map((exp) => (
      <option key={exp} value={exp}>
        {exp} {exp === 1 ? 'Year' : 'Years'}
      </option>
    ))}
  </select>
                {errors.CurrentExperience && <p className="text-red-500 text-xs pt-1">{errors.CurrentExperience}</p>}

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience 
                </label>
                <select
    name="RelevantExperience"
    value={formData.RelevantExperience}
    onChange={handleChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent  ${errors.RelevantExperience && 'border border-red-500'}`}
  >
    <option value="">Select Relevant Experience</option>
    {experienceCurrentOptions.map((exp) => (
      <option key={exp} value={exp}>
        {exp} {exp === 1 ? 'Year' : 'Years'}
      </option>
    ))}
  </select>
                {/* {errors.RelevantExperience && <p className="text-red-500 text-xs pt-1">{errors.RelevantExperience}</p>} */}

              </div>

            </div>

              <div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center mb-2">
                    <label htmlFor="Skills" className="text-sm font-medium text-gray-900" >
                      Skills <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center text-sm bg-custom-blue text-white px-4 py-2  rounded w-28"
                  >
                    {/* <FaPlus className="text-md mr-2" /> */}
                    <span className='text-xl'>+ </span> Add Skills
                  </button>
                </div>
                {errors.skills && (
                  <p className="text-red-500 text-sm">{errors.skills}</p>
                )}
                <div>
                  <div className="space-y-2 mb-4 mt-5">
                    {entries.map((entry, index,) => (
                      <div key={index} className="flex flex-wrap -mx-2 border p-3 rounded-lg items-center bg-blue-100">
                        <div className="w-1/3 px-2">{entry.skill}</div>
                        <div className="w-1/3 px-2">{entry.experience}</div>
                        <div className="w-1/3 px-2">{entry.expertise}</div>
                        <div className="w-full flex justify-end space-x-2 -mt-5">
                          <button onClick={() => handleEdit(index)} className="text-custom-blue text-md">
                            <FaEdit />
                          </button>
                          <button type="button" onClick={() => handleDelete(index)} className="text-red-500 text-md">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isModalOpen && (
                    <div className="w-[100%] h-[130%] right-0 top-0  absolute bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
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
                                      {skills.length > 0 ? (
                                        skills.map(skill => (
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

                  {deleteIndex !== null && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                      <div className="bg-white p-5 rounded shadow-lg">
                        <p>Are you sure you want to delete this Skill?</p>
                        <div className="flex justify-end space-x-2 mt-4">
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
                className="px-4 py-2  text-custom-blue border border-custom-blue  rounded-lg transition-colors"
              >
                Cancel
              </button>
               <button
                // type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg  transition-colors flex items-center gap-2"
              >
                {/* <FaPlus className="w-4 h-4" /> */}
                save
              </button>
            
             {!isEdit && <button
                type="button"
                onClick={handleAddCandidate}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg  transition-colors flex items-center gap-2"
              >
                {/* <FaPlus className="w-4 h-4" /> */}
                <span className='text-xl'>+ </span> Add Candidate
              </button> }
            </div>
            


          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AddCandidateForm;