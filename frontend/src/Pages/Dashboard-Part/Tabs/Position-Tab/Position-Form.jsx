/* eslint-disable react/prop-types */

// v1.0.0 - Venkatesh - added custom location
// v1.0.1 - Ashok - added scroll to error functionality

import { useEffect, useState, useRef } from 'react';
import AssessmentDetails from './AssessmentType';
import TechnicalType from './TechnicalType';
import Cookies from 'js-cookie';
import { validateForm, } from "../../../../utils/PositionValidation.js";
import { ChevronDown, Search } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import SkillsField from '../CommonCode-AllTabs/SkillsInput.jsx';
import { usePositions } from '../../../../apiHooks/usePositions';
import LoadingButton from '../../../../Components/LoadingButton';
import { useMasterData } from '../../../../apiHooks/useMasterData';
import { useInterviewTemplates } from '../../../../apiHooks/useInterviewTemplates.js';
// v1.0.1 <----------------------------------------------------------------------------
import { scrollToFirstError } from '../../../../utils/ScrollToFirstError/scrollToFirstError.js';
// v1.0.1 ---------------------------------------------------------------------------->

// Reusable CustomDropdown Component
const CustomDropdown = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  placeholder,
  optionKey,
  optionValue,
  disableSearch = false,
  hideLabel = false,
  disabledError = false,
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
    return displayValue?.toString().toLowerCase().includes(searchTerm.toLowerCase());
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
          {label} {disabledError && <span className="text-red-500">*</span>}
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
          <ChevronDown className="text-lg" onClick={toggleDropdown} />
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

// const RoundModal = ({ isOpen, onClose, onNext, currentRoundNumber }) => {
//   const [formData, setFormData] = useState({
//     roundName: '',
//     interviewType: ''
//   });
//   const [errors, setErrors] = useState({});
//   if (!isOpen) return null;

//   const handleNext = () => {
//     const validationErrors = validateRoundPopup(formData);

//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     setErrors({});
//     onNext(formData.interviewType, formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg w-[500px] border-2">
//         <div className="flex justify-between items-center p-4">
//           <h2 className="text-lg font-semibold"> {currentRoundNumber === 0 ? "Add Round" : `Add Round ${currentRoundNumber}`}</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//             </svg>
//           </button>
//         </div>

//         <div className="p-4">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Round Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.roundName}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 setFormData(prev => ({ ...prev, roundName: value }));
//                 setErrors(prev => ({ ...prev, roundName: value ? '' : prev.roundName }));
//               }}
//               className={`w-full border px-2 py-1.5 rounded focus:outline-none ${errors.roundName ? 'border-red-500' : ''}`}
//               placeholder='Enter name'
//             />

//             {errors.roundName && <p className="text-red-500 text-sm mt-1">{errors.roundName}</p>}
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Interview Type <span className="text-red-500">*</span>
//             </label>
//             <div className={`px-2 py-1.5 border rounded ${errors.interviewType ? 'border-red-500' : ''}`}>
//               <select
//                 value={formData.interviewType}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setFormData(prev => ({ ...prev, interviewType: value }));
//                   setErrors(prev => ({ ...prev, interviewType: value ? '' : prev.interviewType }));
//                 }}
//                 className='w-full focus:outline-none'
//               >
//                 <option value="">Select Type</option>
//                 <option value="Technical">Technical</option>
//                 <option value="Assessment">Assessment</option>
//               </select>
//             </div>
//             {errors.interviewType && <p className="text-red-500 text-sm mt-1">{errors.interviewType}</p>}
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 p-4">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleNext}
//             className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
//           // disabled={!formData.roundName || !formData.interviewType}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };



// const DeleteConfirmationModal = ({ isOpen, roundNumber, onConfirm, onCancel }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg border p-6 w-[400px]">
//         <h3 className="text-lg font-semibold mb-4">Delete Round {roundNumber}?</h3>
//         <p className="text-gray-600 mb-6">Are you sure you want to delete this round? This action cannot be undone.</p>
//         <div className="flex justify-end space-x-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
//           >
//             No
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//           >
//             Yes, Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const PositionForm = ({ mode, onClose, isModal = false }) => {
  const { positionData, isMutationLoading, addOrUpdatePosition } = usePositions();

  const { templatesData } = useInterviewTemplates();
  const {
    companies,
    locations,
    skills,
  } = useMasterData();

  const { id, } = useParams();
  const location = useLocation();
  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;
  // Determine the correct path to return to based on current location and state
  const fromPath = location.state?.from || (location.pathname.includes('/position/new-position') ? '/position' : '/position');


  // v1.0.1 <----------------------------------------------------------------------
  const fieldRefs = {
    title: useRef(null),
    companyname: useRef(null),
    minexperience: useRef(null),
    maxexperience: useRef(null),
    noOfPositions: useRef(null),
    location: useRef(null),
    jobdescription: useRef(null),
    skills: useRef(null),
    // Add more if needed
  };

  // v1.0.1 ---------------------------------------------------------------------->



  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    minexperience: "",
    maxexperience: "",
    maxSalary: "",
    minSalary: "",
    jobDescription: "",
    additionalNotes: "",
    skills: [],
    template: {},
    NoofPositions: "",
    Location: ""
  });
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();


  const [errors, setErrors] = useState("");
  const [showDropdownCompany, setShowDropdownCompany] = useState(false);
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const companyDropdownRef = useRef(null);

  const handleCompanySelect = (company) => {
    if (company === 'others') {
      setIsCustomCompany(true);
      setFormData((prev) => ({ ...prev, companyName: "" }));
    } else {
      setIsCustomCompany(false);
      setFormData((prev) => ({ ...prev, companyName: company.CompanyName }));
    }
    setShowDropdownCompany(false);
    setCompanySearchTerm('');
    if (errors.companyname) {
      setErrors((prevErrors) => ({ ...prevErrors, companyname: "" }))
    }
  };

  // Handle click outside company dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setShowDropdownCompany(false);
        setCompanySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCompanies = companies?.filter(company =>
    company.CompanyName?.toString().toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const [showDropdownTemplate, setShowDropdownTemplate] = useState(false);


  // const handleTemplateSelect = (template) => {
  //   setFormData((prev) => ({ ...prev, template: template })); // Store entire template object
  //   setShowDropdownTemplate(false);
  // };


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectTemplete, setselectTemplete] = useState(true);
  const [selectedExp, setSelectedExp] = useState("");
  const [positionId, setPositionId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);




  const [deleteIndex, setDeleteIndex] = useState(null);



  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  }
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [hasMovedToRounds, setHasMovedToRounds] = useState(false);
  const [currentStage, setCurrentStage] = useState('basic');

  useEffect(() => {
    if (currentStage !== 'basic') {
      setHasMovedToRounds(true);
    }
  }, [currentStage]);

  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
  const [allSelectedExperiences, setAllSelectedExperiences] = useState([]);
  const [allSelectedExpertises, setAllSelectedExpertises] = useState([]);
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


  const isNextEnabled = () => {
    if (currentStep === 0) {
      if (editingIndex !== null) {
        const currentSkill = entries[editingIndex]?.skill;

        return (
          selectedSkill !== "" &&
          selectedExp !== "" &&
          selectedLevel !== "" &&
          (selectedSkill === currentSkill ||
            !allSelectedSkills.includes(selectedSkill))
        );
      } else {
        return (
          selectedSkill !== "" &&
          selectedExp !== "" &&
          selectedLevel !== "" &&
          !allSelectedSkills.includes(selectedSkill)
        );
      }
    } else if (currentStep === 1) {
      return selectedExp !== "";
    } else if (currentStep === 2) {
      return selectedLevel !== "";
    }
    return false;
  };

  const expertiseOptions = ["Basic", "Medium", "Expert"];

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
      experience: "",
      expertise: "",
    }));

    resetSkillForm();
  };

  const resetSkillForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
    // setEditingIndex(null); 
    // setAllSelectedSkills(entries.map(e => e.skill)); 
  };





  useEffect(() => {
    if (id) {

      const selectedPosition = positionData.find(pos => pos._id === id);
      setIsEdit(true)
      const matchingTemplate = templatesData.find(
        (template) => template.templateName === selectedPosition?.selectedTemplete
      );
      setPositionId(id);

      const companyName = selectedPosition?.companyname || "";

      // Check if the company name exists in the companies list
      const companyExists = companies?.some(company => company.CompanyName === companyName);
      if (companyName && !companyExists) {
        setIsCustomCompany(true);
      }

      setFormData({
        title: selectedPosition?.title || "",
        companyName: companyName,
        minexperience: selectedPosition?.minexperience || 0,
        maxexperience: selectedPosition?.maxexperience || 0,
        minSalary: selectedPosition?.minSalary || "",
        maxSalary: selectedPosition?.maxSalary || "",
        jobDescription: selectedPosition?.jobDescription || "",
        additionalNotes: selectedPosition?.additionalNotes || "",
        NoofPositions: selectedPosition?.NoofPositions?.toString() || "",
        Location: selectedPosition?.Location || "",
        template: matchingTemplate || {},
        // template: matchingTemplate
        //   ? {
        //     ...matchingTemplate
        //   }
        //   : {},
      });

      const formattedSkills = selectedPosition?.skills?.map(skill => ({
        skill: skill.skill || "",
        experience: skill.experience || "",
        expertise: skill.expertise || "",
        _id: skill._id || ""
      })) || [];

      setEntries(formattedSkills);
      // setAllSelectedSkills(formattedSkills)
      setAllSelectedSkills(selectedPosition.skills?.map(skill => skill.skill) || []);
      setAllSelectedExperiences(selectedPosition.skills?.map(skill => skill.experience) || []);
      setAllSelectedExpertises(selectedPosition.skills?.map(skill => skill.expertise) || []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionData, id, companies]);

  const handleSubmit = async (e, actionType = "", skipValidation = false, updatedData = null) => {
    if (e) {
      e.preventDefault();
    }

    // Function to check if two objects are equal
    const isEqual = (obj1, obj2) => {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    // Ensure updatedData is used correctly
    const shouldUseUpdatedData = updatedData && !isEqual(formData, updatedData);
    const shouldUseUpdatedDataForAction = [
      "RoundDetailsSave",
      "RoundDetailsSave&AddRound",
      "RoundDetailsSave&Next",
    ].includes(actionType);

    // Use updatedData when required
    const dataToSubmit = shouldUseUpdatedDataForAction && shouldUseUpdatedData
      ? updatedData
      : formData;


    if (!skipValidation) {
      const { formIsValid, newErrors } = validateForm(dataToSubmit, entries, dataToSubmit.rounds);
      if (!formIsValid) {
        setErrors(newErrors);
        // v1.0.1 <------------------------------------------------------
        scrollToFirstError(newErrors, fieldRefs); // 🔥 Add this line
        // v1.0.1 ------------------------------------------------------>
        return;
      }
    }

    setErrors({});


    let basicdetails = {
      ...dataToSubmit,
      companyname: dataToSubmit.companyName,
      ...(dataToSubmit.minexperience && { minexperience: parseInt(dataToSubmit.minexperience) }),
      ...(dataToSubmit.maxexperience && { maxexperience: parseInt(dataToSubmit.maxexperience) }),
      // minexperience: dataToSubmit.minexperience || "",
      // maxexperience: dataToSubmit.maxexperience || "",
      ownerId: userId,
      tenantId: orgId,
      skills: entries.map(entry => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      additionalNotes: dataToSubmit.additionalNotes,
      jobDescription: dataToSubmit.jobDescription.trim(),
      templateId: dataToSubmit.template?._id,
      // rounds: dataToSubmit.rounds || [],
    };


    try {
      // let response;
      // if (isEdit && positionId) {
      //   response = await axios.patch(
      //     `${config.REACT_APP_API_URL}/position/${positionId}`,
      //     basicdetails
      //   );


      // } else {
      //   response = await axios.post(
      //     `${config.REACT_APP_API_URL}/position`,
      //     basicdetails
      //   );
      //   setPositionId(response.data.data._id);
      // }
      const response = await addOrUpdatePosition({
        id: id || null,
        data: basicdetails
      });

      if (response.status === 'success') {
        // Handle navigation
        if (actionType === "BasicDetailsSave") {
          // If it's a modal, call the onClose function with the new position data
          if (isModal && onClose) {
            onClose(response.data);
            return;
          }

          // Check if we came from InterviewForm
          const fromPath = location.state?.from;
          const returnTo = location.state?.returnTo;

          if (fromPath === '/interviews/new' && returnTo) {
            navigate(returnTo);
          } else {
            // Navigate back to position main page
            navigate('/position');
          }
        }
        if (actionType === "BasicDetailsSave&AddRounds") {
          setIsRoundModalOpen(true);
        }
        if (actionType === "BasicDetailsSave&Next") {
          handleNextNavigation();
        }
        if (actionType === "RoundDetailsSave") {
          // onClose();
        }
        if (actionType === "RoundDetailsSave&AddRound") {
          setIsRoundModalOpen(true);
        }
        if (actionType === "RoundDetailsSave&Next") {
          handleNextNavigation();
        }
      }
    } catch (error) {
      console.error("Error saving position:", error);
    }
  };

  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  // const [insertIndex, setInsertIndex] = useState(-1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState('');
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
  // const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roundIndex: -1 });
  // const [hoveredRound, setHoveredRound] = useState(-1);
  // const [hasRounds, setHasRounds] = useState(false);

  // if (!isOpen) return null;
  // const maxRounds = 5;
  // const handleSave = (e) => {
  //   e.preventDefault();
  //   // onSubmit();
  // };

  // const handleRoundNext = (interviewType, roundData) => {
  //   setHasRounds(true);
  //   setSelectedInterviewType(interviewType);

  //   if (insertIndex !== -1) {
  //     // Insert at specific position
  //     const newRounds = [...rounds];
  //     newRounds.splice(insertIndex, 0, roundData);

  //     // Update round numbers in the titles
  //     newRounds.forEach((round, idx) => {
  //       round.roundName = round.roundName.replace(/Round \d+/, `Round ${idx + 1}`);
  //     });

  //     setRounds(newRounds);
  //     setCurrentRoundIndex(insertIndex);
  //   } else {
  //     // Add at the end
  //     setRounds(prev => [...prev, roundData]);
  //     setCurrentRoundIndex(rounds.length);
  //   }

  //   setShowAssessment(true);
  //   setIsRoundModalOpen(false);
  //   setCurrentStage(insertIndex !== -1 ? `round${insertIndex + 1}` : `round${rounds.length + 1}`);
  //   setInsertIndex(-1);
  // };

  // const handleAddRoundAtIndex = (index) => {
  //   setInsertIndex(index);
  //   setIsRoundModalOpen(true);
  // };

  // const handleRoundDelete = (index) => {
  //   setDeleteConfirmation({ isOpen: true, roundIndex: index });
  // };

  // const confirmDelete = () => {
  //   if (deleteIndex !== null) {
  //     const updatedEntries = entries.filter((_, index) => index !== deleteIndex);
  //     setEntries(updatedEntries);
  //     setAllSelectedSkills(updatedEntries.map(e => e.skill));
  //     setDeleteIndex(null);
  //   }
  // };

  // const confirmDelete = () => {
  //   if (deleteIndex !== null) {
  //     const entry = entries[deleteIndex];
  //     setAllSelectedSkills(
  //       allSelectedSkills.filter((skill) => skill !== entry.skill)
  //     );
  //     setEntries(entries.filter((_, i) => i !== deleteIndex));
  //     setDeleteIndex(null);
  //   }
  // };



  const handlePreviousNavigation = (stage) => {
    if (stage === 'basic') {
      setCurrentStage('basic');
      setShowAssessment(false);
      setSelectedInterviewType('');
      setCurrentRoundIndex(-1);
    } else {
      const roundNum = parseInt(stage.replace('round', ''));
      const prevIndex = roundNum - 1;
      setCurrentRoundIndex(prevIndex);
      setCurrentStage(`round${roundNum}`);
      setSelectedInterviewType(rounds[prevIndex].interviewType);
      setShowAssessment(true);
    }
  };

  const handleSaveRound = (roundData, actionType) => {
    setFormData((prevData) => {
      let updatedRounds = [...(prevData.rounds || [])];

      if (actionType === "RoundDetailsSave&AddRound") {
        updatedRounds.push(roundData);
      } else if (actionType === "RoundDetailsSave&Next") {
        updatedRounds[currentRoundIndex] = roundData;
      } else if (actionType === "RoundDetailsSave") {
        updatedRounds[currentRoundIndex] = roundData;
      }

      return {
        ...prevData,
        rounds: updatedRounds,
      };
    });

    // Call handleSubmit after the state has been updated
    setTimeout(() => {
      handleSubmit(null, actionType, true);
    }, 0);
  };

  

  const renderStageIndicator = () => {

    // Update flag when moving to rounds
    //const isBasicStage = currentStage === 'basic';
    // const currentRoundNumber = currentStage.startsWith('round') ? parseInt(currentStage.slice(5)) : 0;

    return (
      <div className="flex items-center justify-center mb-4 mt-1 w-full overflow-x-auto py-2">
        <div className="flex items-center min-w-fit px-2">
          {/* Basic Details */}
          {/* <div className="flex items-center">
            <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${isBasicStage
              ? 'bg-orange-500 text-white'
              : 'bg-teal-600 text-white'
              }`}>
              Basic Details
            </span>
          </div> */}

          {/* Rounds Section */}
          {/* {!hasMovedToRounds && isBasicStage ? (
            // When in Basic Details: Show just Round 1
            <>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>
              <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-teal-50 text-teal-600 border border-teal-100 sm:text-[12px] md:text-[14px]">
                Rounds
              </span>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>
            </>
          ) : ( */}
          {/* // When in Rounds: Show all rounds with plus icons */}
          {/* <>
              {rounds.map((_, index) => (
                <div key={index} className="flex items-center"> */}
          {/* Connector to Round with Plus Icon */}
          {/* <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div
                      onClick={() => handleAddRoundAtIndex(index)}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${index < currentRoundNumber
                        ? 'border-teal-600 bg-teal-600 hover:bg-teal-700'
                        : 'border-teal-200 bg-teal-50 hover:border-teal-600'
                        }`}
                    >
                      <FaPlus className={`h-3 w-3 ${index < currentRoundNumber ? 'text-white' : 'text-teal-600'
                        }`} />
                    </div>
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                  </div>

       
                  <div
                    className="relative group"
                    onMouseEnter={() => setHoveredRound(index)}
                    onMouseLeave={() => setHoveredRound(-1)}
                  >
                    <div
                    // <----------- i want this for future use ------------>
                    // onClick={() => handleRoundClick(index)}
                    >
                      <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${currentStage === 'round' + (index + 1)
                        ? 'bg-orange-500 text-white'
                        : currentStage.startsWith('round') && parseInt(currentStage.slice(5)) > index + 1
                          ? 'bg-teal-600 text-white'
                          : 'bg-teal-50 text-teal-600 border border-teal-100'
                        }`}>
                        Round {index + 1}
                      </span>
                    </div>
                    {hoveredRound === index && (
                      <button
                        onClick={() => handleRoundDelete(index)}
                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                      >
                        <FaTrash className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))} */}

          {/* Plus icon to add round after current round  */}
          {/* <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
                <div
                  onClick={() => handleAddRoundAtIndex(rounds.length)}
                  className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center cursor-pointer hover:border-teal-600"
                >
                  <FaPlus className="h-3 w-3 text-teal-600" />
                </div>
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div> */}

          {/* Next Future Round */}
          {/* {rounds.length < maxRounds && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-gray-50 text-gray-400 border border-gray-200 sm:text-[12px] md:text-[14px]">
                      Round {rounds.length + 1}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center">
                      <FaPlus className="h-3 w-3 text-teal-600" />
                    </div>
                    <div className="h-[1px] w-12 bg-teal-200"></div>
                  </div>
                </div>
              )}
            </>
          )} */}

          {/* <div className="flex items-center">
            <div className="h-8 w-8 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center" >
              <div className="h-5 w-5 rounded-full border-2 border-teal-200"></div>
            </div>
          </div> */}
        </div>
      </div>
    );
  };

  const renderInterviewComponent = () => {
    const roundDetails = rounds[currentRoundIndex];
    if (selectedInterviewType === 'Technical') {
      return (
        <TechnicalType
          roundDetails={roundDetails}
          onPrevious={(stage) => {
            if (stage) {
              handlePreviousNavigation(stage);
            } else {
              // onClose();
            }
          }}
          // onCancel={onClose}
          onSave={handleSaveRound}
          roundNumber={currentRoundIndex + 1}
          isLastRound={currentRoundIndex === rounds.length - 1}
        />
      );
    } else if (selectedInterviewType === 'Assessment') {
      return (
        <AssessmentDetails
          roundDetails={roundDetails}
          onPrevious={(stage) => {
            if (stage) {
              handlePreviousNavigation(stage);
            } else {
              // onClose();
            }
          }}
          // onCancel={onClose}
          onSave={handleSaveRound}
          roundNumber={currentRoundIndex + 1}
          isLastRound={currentRoundIndex === rounds.length - 1}
        />
      );
    }
    return null;
  };

  const handleNextNavigation = () => {
    if (currentRoundIndex + 1 < rounds.length) {
      const nextIndex = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIndex);
      setCurrentStage(`round${nextIndex + 1}`);
      setSelectedInterviewType(rounds[nextIndex].interviewType);
      setShowAssessment(true);
    }
  };

  // Location dropdown state - same pattern as company
  const [showDropdownLocation, setShowDropdownLocation] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const locationDropdownRef = useRef(null);

  const handleLocationSelect = (location) => {
    if (location === 'others') {
      setIsCustomLocation(true);
      setFormData((prev) => ({ ...prev, Location: "" }));
    } else {
      setIsCustomLocation(false);
      setFormData((prev) => ({ ...prev, Location: location.LocationName }));
    }
    setShowDropdownLocation(false);
    setLocationSearchTerm('');
    if (errors.location) {
      setErrors((prevErrors) => ({ ...prevErrors, location: "" }))
    }
  };

  // Handle click outside location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowDropdownLocation(false);
        setLocationSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredLocations = locations?.filter(location =>
    location.LocationName?.toString().toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-lg w-full flex flex-col">
        {/* Modal Header */}
        <div className="mt-4">
          <h2 className="text-2xl font-semibold px-[13%] sm:mt-5 sm:mb-2 sm:text-lg sm:px-[5%] md:mt-6 md:mb-2 md:text-xl md:px-[5%]">Position</h2>
          {/* NAVIGATION - PATH */}
          {renderStageIndicator()}
        </div>

        <div className="px-[13%] sm:px-[5%] md:px-[5%]">
          {showAssessment ? (
            <>
              {renderInterviewComponent()}
            </>
          ) : (
            <>
              {/* Modal Body */}
              <div className="bg-white rounded-lg shadow-md border">
                <div className="flex justify-between items-center px-5 pt-4">
                  <h2 className="text-lg font-semibold sm:text-md">Position Details:</h2>
                </div>

                <div className="px-6 pt-3">
                  <form className="space-y-5 mb-5">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        {/* v1.0.1 <------------------------------------------------------------ */}
                        <input
                          ref={fieldRefs.title}
                          type="text"
                          value={formData.title}
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) {
                              setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
                            }
                          }}
                          placeholder="UI/UX Designer"
                          className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {/* v1.0.1 -------------------------------------------------------------> */}
                        {errors.title && <p className="text-red-500 text-xs mt-1 ">{errors.title}</p>}
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        {/*  v1.0.1 <--------------------------------------------------------------------------- */}
                        {!isCustomCompany ? (
                          <div className="relative" ref={companyDropdownRef}>
                            <input
                              ref={fieldRefs.companyname}
                        
                              type="text"
                              value={formData.companyName}
                              onClick={() => setShowDropdownCompany(!showDropdownCompany)}
                              placeholder="Select a Company"
                              autoComplete="off"
                              className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.companyname ? 'border-red-500' : 'border-gray-300'}`}
                              readOnly
                            />
                            {/* v1.0.1 ------------------------------------------------------------------------> */}
                            <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                              <ChevronDown className="text-lg" onClick={() => setShowDropdownCompany(!showDropdownCompany)} />
                            </div>
                            {showDropdownCompany && (
                              <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10 text-xs">
                                <div className="border-b">
                                  <div className="flex items-center border rounded px-2 py-1 m-2">
                                    <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                                    <input
                                      type="text"
                                      placeholder="Search Company"
                                      value={companySearchTerm}
                                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                                      className="pl-8 focus:border-black focus:outline-none w-full"
                                    />
                                  </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {filteredCompanies?.length > 0 ? (
                                    filteredCompanies.map((company, index) => (
                                      <div
                                        key={company._id || index}
                                        onClick={() => handleCompanySelect(company)}
                                        className="cursor-pointer hover:bg-gray-200 p-2"
                                      >
                                        {company.CompanyName}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2 text-gray-500">No companies found</div>
                                  )}
                                </div>
                                <div className="border-t border-gray-200">
                                  <div
                                    onClick={() => handleCompanySelect('others')}
                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                  >
                                    <span className="text-gray-900 font-medium">+ Others</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                            // v1.0.1 <-------------------------------------------------------------------------------
                              ref={fieldRefs.companyname}
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => {
                                setFormData({ ...formData, companyName: e.target.value });
                                if (errors.companyname) {
                                  setErrors((prevErrors) => ({ ...prevErrors, companyname: "" }));
                                }
                              }}
                              className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.companyname ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Enter custom company name"
                            />
                            {/* v1.0.1 -------------------------------------------------------------------------------> */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomCompany(false);
                                setFormData({ ...formData, companyName: "" });
                              }}
                              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {errors.companyname && <p className="text-red-500 text-xs pt-1">{errors.companyname}</p>}
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 lg:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experience <span className="text-red-500">*</span>

                        </label>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Min Experience */}
                          <div>
                            <div className="flex flex-row items-center gap-3">
                              <label className="block text-xs text-gray-500 mb-1">Min</label>
                              {/* v1.0.1 <---------------------------------------------------------------------------- */}
                              <input
                                ref={fieldRefs.minexperience}
                                type="number"
                                min="1"
                                max="15"
                                value={formData.minexperience ?? ""}
                                onChange={(e) => {
                                  const minExp = e.target.value ? parseInt(e.target.value) : "";

                                  // Validate min experience is not greater than current max experience
                                  if (minExp !== "" && formData.maxexperience && minExp > formData.maxexperience) {
                                    setErrors(prev => ({
                                      ...prev,
                                      minexperience: "Min Experience cannot be greater than Max",
                                      maxexperience: "Max Experience cannot be less than Min"
                                    }));
                                  } else {
                                    setErrors(prev => ({ ...prev, minexperience: "", maxexperience: "" }));
                                  }

                                  // Update state
                                  setFormData({
                                    ...formData,
                                    minexperience: minExp,
                                    // Reset max experience if it's now less than min
                                    maxexperience: (minExp !== "" && formData.maxexperience && minExp > formData.maxexperience)
                                      ? ""
                                      : formData.maxexperience
                                  });
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${errors.minexperience ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}`}
                                placeholder="Enter Min Experience"
                              />
                            
                            </div>
                            {errors.minexperience && <p className="text-red-500 text-xs pl-8 mt-1 ">{errors.minexperience}</p>}
                          </div>
                          {/* v1.0.1 ----------------------------------------------------------------------------> */}

                          {/* Max Experience */}
                          <div>
                            <div className="flex flex-row items-center gap-3">
                              <label className="block text-xs text-gray-500 mb-1">Max</label>
                              {/* v1.0.1 <------------------------------------------------------------------------------------- */}
                              <input
                                ref={fieldRefs.maxexperience}
                                type="number"
                                min="1"
                                max="15"
                                value={formData.maxexperience ?? ""}
                                onChange={(e) => {
                                  const maxExp = e.target.value ? parseInt(e.target.value) : "";

                                  // Validate max experience is not less than current min experience
                                  if (maxExp !== "" && formData.minexperience && maxExp < formData.minexperience) {
                                    setErrors(prev => ({
                                      ...prev,
                                      maxexperience: "Max Experience cannot be less than Min",
                                      minexperience: "Min Experience cannot be greater than Max"
                                    }));
                                  } else {
                                    setErrors(prev => ({ ...prev, maxexperience: "", minexperience: "" }));
                                  }

                                  // Update state
                                  setFormData({
                                    ...formData,
                                    maxexperience: maxExp
                                  });
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${errors.maxexperience ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}`}
                                placeholder="Enter Max Experience"
                              />

                            </div>
                            {errors.maxexperience && <p className="text-red-500 text-xs pl-8 mt-1 ">{errors.maxexperience}</p>}
                          </div>
                          {/* v1.0.1 -------------------------------------------------------------------------------------> */}
                        </div>
                      </div>


                      {/* max and min salary  */}
                      <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Salary
                          {/* <span className="text-red-500">*</span> */}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Min Experience */}

                          <div className="flex flex-row items-center gap-3">
                            <label className="block text-xs text-gray-500 mb-1">Min</label>
                            <div className='flex-col'>
                              <div className="relative w-full">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={formData.minSalary ?? ""}
                                  placeholder="Enter Min Salary"
                                  onChange={(e) => {
                                    const minSalary = e.target.value;

                                    // Validate min salary is not greater than current max salary
                                    if (minSalary !== "" && formData.maxSalary && parseInt(minSalary) > parseInt(formData.maxSalary)) {
                                      setErrors(prev => ({
                                        ...prev,
                                        minsalary: "Min Salary cannot be greater than Max",
                                        maxsalary: "Max Salary cannot be less than Min"
                                      }));
                                    } else {
                                      setErrors(prev => ({ ...prev, minsalary: "", maxsalary: "" }));
                                    }

                                    // Update state
                                    setFormData(prev => ({
                                      ...prev,
                                      minSalary: minSalary === "" ? "" : parseInt(minSalary)
                                    }));
                                  }}
                                  className={`w-full pl-7 py-2 pr-3 border rounded-md focus:outline-none ${errors.salary ? "border-red-500" : "border-gray-300"}`}

                                // onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                                // className="w-full pl-7 py-2 pr-3 border rounded-md focus:outline-none"
                                />

                              </div>
                              {errors.minsalary && <p className="text-red-500 text-xs pl-1 mt-1 ">{errors.minsalary}</p>}
                            </div>

                          </div>

                          {/* Max Experience */}
                          <div className="flex flex-row items-center gap-3">
                            <label className="block text-xs text-gray-500 mb-1">Max</label>
                            <div className='flex-col'>
                              <div className="relative w-full">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={formData.maxSalary ?? ""}
                                  placeholder="Enter Max Salary"
                                  onChange={(e) => {
                                    const maxSalary = e.target.value;

                                    // Validate max salary is not less than current min salary
                                    if (maxSalary !== "" && formData.minSalary && parseInt(maxSalary) < parseInt(formData.minSalary)) {
                                      setErrors(prev => ({
                                        ...prev,
                                        maxsalary: "Max Salary cannot be less than Min",
                                        minsalary: "Min Salary cannot be greater than Max"
                                      }));
                                    } else {
                                      setErrors(prev => ({ ...prev, maxsalary: "", minsalary: "" }));
                                    }

                                    // Update state
                                    setFormData(prev => ({
                                      ...prev,
                                      maxSalary: maxSalary === "" ? "" : parseInt(maxSalary)
                                    }));
                                  }}
                                  className={`w-full pl-7 py-2 pr-3 border rounded-md focus:outline-none ${errors.salary ? "border-red-500" : "border-gray-300"}`}
                                // onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                                // className="w-full pl-7 py-2 pr-3 border rounded-md focus:outline-none"
                                />

                              </div>
                              {errors.maxsalary && <p className="text-red-500 text-xs pl-1 mt-1 ">{errors.maxsalary}</p>}
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* location  and no of positions  */}

                    {/* <div> */}

                    <div className="grid grid-cols-2 w-full sm:w-full md:w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. of Positions
                        </label>

                        <input
                        // v1.0.1 <------------------------------------------
                          ref={fieldRefs.noOfPositions}
                        // v1.0.1 ------------------------------------------>
                          type="number"
                          min={1}
                          value={formData.NoofPositions}
                          // onChange={(e) => {
                          //   setFormData({ ...formData, NoofPositions: e.target.value });
                          // }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, NoofPositions: value });

                            // Clear error if valid
                            if (value && parseInt(value) > 0) {
                              setErrors(prev => ({ ...prev, noOfPositions: "" }));
                            }
                          }}
                          // readOnly
                          // onClick={() => setShowDropdownCompany(!showDropdownCompany)}
                          placeholder="Select No. of Positions"
                          className={`w-full px-3 py-2 border rounded-md ${errors.noOfPositions ? "border-red-500" : "border-gray-300"}`}
                        // className="w-full px-3 py-2 border rounded-md focus:outline-none"
                        />
                        {errors.noOfPositions && <p className="text-red-500 text-xs mt-1 ">{errors.noOfPositions}</p>}
                      </div>

                      {/* location */}
                      {/*<-----v1.0.0------ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location <span className="text-red-500">*</span>
                        </label>
                        {!isCustomLocation ? (
                          <div className="relative" ref={locationDropdownRef}>
                            <input
                              // v1.0.1 <------------------------------------------
                              ref={fieldRefs.location}
                              // v1.0.1 ------------------------------------------>
                              type="text"
                              value={formData.Location}
                              onClick={() => setShowDropdownLocation(!showDropdownLocation)}
                              placeholder="Select a Location"
                              autoComplete="off"
                              className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                              readOnly
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                              <ChevronDown className="text-lg" onClick={() => setShowDropdownLocation(!showDropdownLocation)} />
                            </div>
                            {showDropdownLocation && (
                              <div className="absolute bg-white border border-gray-300 mt-1 w-full z-10 text-xs">
                                <div className="border-b">
                                  <div className="flex items-center border rounded px-2 py-1 m-2">
                                    <Search className="absolute ml-1 text-gray-500 w-4 h-4" />
                                    <input
                                      type="text"
                                      placeholder="Search Location"
                                      value={locationSearchTerm}
                                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                                      className="pl-8 focus:border-black focus:outline-none w-full"
                                    />
                                  </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {filteredLocations?.length > 0 ? (
                                    filteredLocations.map((location, index) => (
                                      <div
                                        key={location._id || index}
                                        onClick={() => handleLocationSelect(location)}
                                        className="cursor-pointer hover:bg-gray-200 p-2"
                                      >
                                        {location.LocationName}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2 text-gray-500">No locations found</div>
                                  )}
                                </div>
                                <div className="border-t border-gray-200">
                                  <div
                                    onClick={() => handleLocationSelect('others')}
                                    className="cursor-pointer hover:bg-gray-200 p-2"
                                  >
                                    <span className="text-gray-900 font-medium">+ Others</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              // v1.0.1 <------------------------------------------
                              ref={fieldRefs.location}
                              // v1.0.1 ------------------------------------------>
                              type="text"
                              value={formData.Location}
                              onChange={(e) => {
                                setFormData({ ...formData, Location: e.target.value });
                                if (errors.location) {
                                  setErrors((prevErrors) => ({ ...prevErrors, location: "" }));
                                }
                              }}
                              className={`block w-full px-3 py-2 h-10 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Enter custom location name"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomLocation(false);
                                setFormData({ ...formData, Location: "" });
                              }}
                              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        {errors.location && <p className="text-red-500 text-xs pt-1">{errors.location}</p>}
                      </div>
                      {/* -----v1.0.0-----> */}
                    </div>
                    {/* </div> */}

                    {/* Job Description */}
                    <div>
                      <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">Job Description <span className="text-red-500">*</span></label>
                      <textarea
                        ref={fieldRefs.jobdescription}
                        id="jobDescription"
                        name="jobDescription"
                        value={formData.jobDescription}

                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, jobDescription: value });
                          // Clear jobdescription error when user starts typing
                          if (errors.jobdescription) {
                            setErrors((prev) => ({ ...prev, jobdescription: "" }));
                          }
                        }}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3  sm:text-sm h-32 ${errors.jobdescription ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                        placeholder="This position is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                        rows={10}
                        minLength={50}
                        maxLength={1000}
                      />
                      <div >
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-500">
                            {errors.jobdescription ? (
                              <p className="text-red-500 text-xs pt-1">{errors.jobdescription}</p>
                            ) : formData.jobDescription.length > 0 && formData.jobDescription.length < 50 ? (
                              <p className="text-gray-500 text-xs">
                                Minimum {50 - formData.jobDescription.length} more characters needed
                              </p>
                            ) : null}
                          </span>
                          <p className="text-sm text-gray-500">{formData.jobDescription.length}/1000</p>
                        </div>
                      </div>

                    </div>

                    {/* skills */}
                    <div>

                      <SkillsField
                        ref={fieldRefs.skills}
                        entries={entries}
                        errors={errors}
                        onAddSkill={(setEditingIndex) => {
                          setEntries((prevEntries) => {
                            const newEntries = [...prevEntries, { skill: "", experience: "", expertise: "" }];
                            setEditingIndex(newEntries.length - 1);
                            return newEntries;
                          });
                          setSelectedSkill("");
                          setSelectedExp("");
                          setSelectedLevel("");
                        }}
                        onEditSkill={(index) => {
                          const entry = entries[index];
                          setSelectedSkill(entry.skill || "");
                          setSelectedExp(entry.experience);
                          setSelectedLevel(entry.expertise);
                        }}
                        onDeleteSkill={(index) => {
                          const entry = entries[index];
                          setAllSelectedSkills(
                            allSelectedSkills.filter((skill) => skill !== entry.skill)
                          );
                          setEntries(entries.filter((_, i) => i !== index));
                        }}
                        setIsModalOpen={setIsModalOpen}
                        setEditingIndex={setEditingIndex}
                        isModalOpen={isModalOpen}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        selectedSkill={selectedSkill}
                        setSelectedSkill={setSelectedSkill}
                        allSelectedSkills={allSelectedSkills}
                        selectedExp={selectedExp}
                        setSelectedExp={setSelectedExp}
                        selectedLevel={selectedLevel}
                        setSelectedLevel={setSelectedLevel}
                        skills={skills}
                        expertiseOptions={expertiseOptions}
                        experienceOptions={experienceOptions}
                        isNextEnabled={isNextEnabled}
                        handleAddEntry={handleAddEntry}
                        skillpopupcancelbutton={skillpopupcancelbutton}
                        editingIndex={editingIndex}
                      />
                    </div>

                    {/* template */}
                    <div className="grid grid-cols-2">
                      <CustomDropdown
                        label="Select Template"
                        name="template"
                        value={formData.template?.templateName || ""}
                        // options={templatesData}
                        options={templatesData.filter(template => template.rounds && template.rounds.length > 0
                          && template.status === 'active')}
                        onChange={(e) => {
                          const selectedTemplate = templatesData.find(t => t._id === e.target.value);
                          setFormData({ ...formData, template: selectedTemplate });
                        }}
                        disabledError={false}
                        placeholder="Select Template"
                        // optionKey="templateName"
                        // optionValue="templateName"
                        optionKey="templateName" // Display template name
                        optionValue="_id"
                      />
                      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Template
                      </label>
                      <div className="relative w-1/2 sm:w-full md:w-full">
                      <input
                            type="text"
                            value={formData.template?.templateName || ""}
                            readOnly
                            onClick={() => setShowDropdownTemplate(!showDropdownTemplate)}
                            placeholder="Select Template"
                            className='w-full px-3 py-2 border rounded-md focus:outline-none' 
                          />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Search size={20} className="text-gray-400" />
                        </div>
                        {showDropdownTemplate && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
                              {templates.map((template) => (
                                <div
                                  key={template._id}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleTemplateSelect(template)}
                                >
                                  {template.templateName}
                                </div>
                              ))}
                            </div>
                          )}
                        
                      </div> */}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                      />
                    </div>

                  </form>
                </div>

              </div>
              {/* footer */}
              <div className="flex justify-end mt-4 space-x-3 mb-5">
                <button className="px-3 py-1 border-custom-blue rounded border"
                  onClick={() => {
                    // If it's a modal, call the onClose function
                    if (isModal && onClose) {
                      onClose();
                      return;
                    }

                    // Check if we came from InterviewForm
                    const fromPath = location.state?.from;
                    const returnTo = location.state?.returnTo;

                    if (fromPath === '/interviews/new' && returnTo) {
                      navigate(returnTo);
                    } else {
                      // Navigate back to position main page
                      navigate('/position');
                    }
                  }}
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={(e) => handleSubmit(e, "BasicDetailsSave")}
                  isLoading={isMutationLoading}
                  loadingText={id ? "Updating..." : "Saving..."}
                >
                  {isEdit ? 'Update' : 'Save'}
                </LoadingButton>


              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionForm;
