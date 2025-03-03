import { useEffect, useState } from 'react';
import AssessmentDetails from './AssessmentType';
import TechnicalType from './TechnicalType';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { validateForm, validateRoundPopup } from "../../../../utils/PositionValidation.js";
import { Search } from "lucide-react";
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import axios from 'axios';

const RoundModal = ({ isOpen, onClose, onNext, currentRoundNumber }) => {
  const [formData, setFormData] = useState({
    roundName: '',
    interviewType: ''
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleNext = () => {
    const validationErrors = validateRoundPopup(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onNext(formData.interviewType, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] border-2">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold"> {currentRoundNumber === 0 ? "Add Round" : `Add Round ${currentRoundNumber}`}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Round Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roundName}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, roundName: value }));
                setErrors(prev => ({ ...prev, roundName: value ? '' : prev.roundName }));
              }}
              className={`w-full border px-2 py-1.5 rounded focus:outline-none ${errors.roundName ? 'border-red-500' : ''}`}
              placeholder='Enter name'
            />

            {errors.roundName && <p className="text-red-500 text-sm mt-1">{errors.roundName}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <div className={`px-2 py-1.5 border rounded ${errors.interviewType ? 'border-red-500' : ''}`}>
              <select
                value={formData.interviewType}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, interviewType: value }));
                  setErrors(prev => ({ ...prev, interviewType: value ? '' : prev.interviewType }));
                }}
                className='w-full focus:outline-none'
              >
                <option value="">Select Type</option>
                <option value="Technical">Technical</option>
                <option value="Assessment">Assessment</option>
              </select>
            </div>
            {errors.interviewType && <p className="text-red-500 text-sm mt-1">{errors.interviewType}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          // disabled={!formData.roundName || !formData.interviewType}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};



const DeleteConfirmationModal = ({ isOpen, roundNumber, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border p-6 w-[400px]">
        <h3 className="text-lg font-semibold mb-4">Delete Round {roundNumber}?</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this round? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PositionForm = ({ isOpen, onClose, onSubmit }) => {

  // position details states
  const {
    companies,
    skills
  } = useCustomContext();
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    minexperience: "",
    maxexperience: "",
    jobDescription: "",
    additionalNotes: "",
    skills: [],
    template: "",
  });
  const [errors, setErrors] = useState("");
  const [showDropdownCompany, setShowDropdownCompany] = useState(false);
  const handleCompanySelect = (company) => {
    setFormData((prev) => ({ ...prev, companyName: company.CompanyName }));
    setShowDropdownCompany(false);
    if (errors.companyname) {
      setErrors((prevErrors) => ({ ...prevErrors, companyname: "" }))
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectTemplete, setselectTemplete] = useState(true);
  const [selectedExp, setSelectedExp] = useState("");
  const [positionId, setPositionId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const handleEdit = (index) => {
    const entry = entries[index];
    setSelectedSkill(entry.skill);
    setSelectedExp(entry.experience);
    setSelectedLevel(entry.expertise);
    setEditingIndex(index);
    setIsModalOpen(true);
  };
  const [deleteIndex, setDeleteIndex] = useState(null);
  const handleDelete = (index) => {
    setDeleteIndex(index);
  };
  const skillpopupcancelbutton = () => {
    setIsModalOpen(false);
    setSearchTerm("");
  }
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredSkills = skills.filter(skill =>
    skill.SkillName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [hasMovedToRounds, setHasMovedToRounds] = useState(false);
  const [currentStage, setCurrentStage] = useState('basic');

  useEffect(() => {
    if (currentStage !== 'basic') {
      setHasMovedToRounds(true);
    }
  }, [currentStage]);

  const [allSelectedSkills, setAllSelectedSkills] = useState([]);
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
  ]; const isNextEnabled = () => {
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
  const expertiseOptions = ["Basic", "Medium", "Expert"];
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
    } else {
      const newEntries = [
        ...entries,
        {
          skill: selectedSkill,
          experience: selectedExp,
          expertise: selectedLevel,
        },
      ];
      setEntries(newEntries);
    }
    setAllSelectedSkills([...allSelectedSkills, selectedSkill]);
    // Clear errors if a skill is added
    setErrors((prevErrors) => ({ ...prevErrors, skills: "" }));
    resetSkillForm();
  };
  const resetSkillForm = () => {
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setCurrentStep(0);
    setIsModalOpen(false);
  };
  const cancelDelete = () => {
    setDeleteIndex(null);
  };




  // const handleSubmit = async (e, actionType = "", skipValidation = false) => {
  //   if (e) {
  //     e.preventDefault();
  //   }

  //   if (!skipValidation) {
  //     const { formIsValid, newErrors } = validateForm(formData, entries, formData.rounds);
  //     if (!formIsValid) {
  //       setErrors(newErrors);
  //       return;
  //     }
  //   }

  //   setErrors({});
  //   const userId = Cookies.get("userId");
  //   const userName = Cookies.get("userName");
  //   const orgId = Cookies.get("organizationId");
  //   const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");

  //   const basicdetails = {
  //     ...formData,
  //     companyname: formData.companyName,
  //     minexperience: parseInt(formData.experienceMin) || 0,
  //     maxexperience: parseInt(formData.experienceMax) || 0,
  //     ownerId: userId,
  //     tenantId: orgId,
  //     CreatedBy: `${userName} at ${currentDateTime}`,
  //     LastModifiedById: userId,
  //     skills: entries.map(entry => ({
  //       skill: entry.skill,
  //       experience: entry.experience,
  //       expertise: entry.expertise
  //     })),
  //     additionalNotes: formData.additionalNotes,
  //     jobDescription: formData.jobDescription.trim(),
  //     // rounds: formData.rounds?.map(round => ({
  //     //   roundName: round.roundName,
  //     //   interviewType: round.interviewType,
  //     //   interviewMode: round.interviewMode || "Virtual",
  //     //   duration: round.duration || "30",
  //     //   instructions: round.instructions || "",
  //     //   selectedTemplate: round.selectedTemplate || "",
  //     // })) || [],
  //   };

  //   try {
  //     let response;
  //     if (positionId) {
  //       console.log("Updating existing position with ID:", positionId);
  //       response = await axios.patch(
  //         `${process.env.REACT_APP_API_URL}/position/${positionId}`,
  //         basicdetails
  //       );
  //       console.log("Updated response:", response.data);
  //       console.log("Updated Position Data:", response.data.data);
  //     } else {
  //       console.log("Creating new position...");
  //       response = await axios.post(
  //         `${process.env.REACT_APP_API_URL}/position`,
  //         basicdetails
  //       );
  //       console.log("New position response:", response.data.data);
  //       setPositionId(response.data.data._id);
  //     }

  //     // if (response.status === 201 || response.status === 200) {
  //     //   if (openRoundModal) {
  //     //     // console.log("Opening Round Modal...");
  //     //     setIsRoundModalOpen(true);
  //     //     setInsertIndex(0);
  //     //   } else if (positionId) {
  //     //     // console.log("Skipping Round Modal, Moving to Next Step...");
  //     //     handleNextNavigation();
  //     //   } else {
  //     //     // console.log("Closing form...");
  //     //     onClose();
  //     //   }
  //     // }

  //     if (response.status === 201 || response.status === 200) {
  //       if (actionType === "BasicDetailsSave") {
  //         onClose();
  //       }
  //       // if (openRoundModal) {
  //       //   console.log("Opening Round Modal...");
  //       //   setIsRoundModalOpen(true);
  //       //   setInsertIndex(0);
  //       // } else {
  //       //   console.log("Skipping Round Modal, Moving to Next Step...");
  //       //   handleNextNavigation();
  //       // }
  //     }

  //   } catch (error) {
  //     console.error("Error saving position:", error);
  //   }
  // };

  // const handleSubmit = async (e, actionType = "", skipValidation = false) => {
  //   if (e) {
  //     e.preventDefault();
  //   }

  //   if (!skipValidation) {
  //     const { formIsValid, newErrors } = validateForm(formData, entries, formData.rounds);
  //     if (!formIsValid) {
  //       setErrors(newErrors);
  //       return;
  //     }
  //   }

  //   setErrors({});
  //   const userId = Cookies.get("userId");
  //   const userName = Cookies.get("userName");
  //   const orgId = Cookies.get("organizationId");
  //   const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");

  //   let basicdetails = {
  //     ...formData,
  //     companyname: formData.companyName,
  //     minexperience: parseInt(formData.experienceMin) || 0,
  //     maxexperience: parseInt(formData.experienceMax) || 0,
  //     ownerId: userId,
  //     tenantId: orgId,
  //     CreatedBy: `${userName} at ${currentDateTime}`,
  //     LastModifiedById: userId,
  //     skills: entries.map(entry => ({
  //       skill: entry.skill,
  //       experience: entry.experience,
  //       expertise: entry.expertise,
  //     })),
  //     additionalNotes: formData.additionalNotes,
  //     jobDescription: formData.jobDescription.trim(),
  //     rounds: formData.rounds
  //   };

  //   console.log('basic details in the handle submit before submit :', basicdetails);

  //   try {
  //     let response;
  //     if (positionId) {
  //       console.log("Updating existing position with ID:", positionId);
  //       response = await axios.patch(
  //         `${process.env.REACT_APP_API_URL}/position/${positionId}`,
  //         basicdetails
  //       );
  //       console.log("Updated response:", response.data);
  //     } else {
  //       console.log("Creating new position...");
  //       response = await axios.post(
  //         `${process.env.REACT_APP_API_URL}/position`,
  //         basicdetails
  //       );
  //       console.log("New position response:", response.data.data);
  //       setPositionId(response.data.data._id);
  //     }

  //     if (response.status === 201 || response.status === 200) {
  //       if (actionType === "BasicDetailsSave") {
  //         onClose();
  //       }
  //       if (actionType === "BasicDetailsSave&AddRounds") {
  //         setIsRoundModalOpen(true);
  //       }
  //       if (actionType === "BasicDetailsSave&Next") {
  //         handleNextNavigation();
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error saving position:", error);
  //   }
  // };

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

    console.log("Data to Submit:", dataToSubmit);

    if (!skipValidation) {
      const { formIsValid, newErrors } = validateForm(dataToSubmit, entries, dataToSubmit.rounds);
      if (!formIsValid) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    const userId = Cookies.get("userId");
    const userName = Cookies.get("userName");
    const orgId = Cookies.get("organizationId");
    const currentDateTime = format(new Date(), "dd MMM, yyyy - hh:mm a");

    let basicdetails = {
      ...dataToSubmit,
      companyname: dataToSubmit.companyName,
      minexperience: parseInt(dataToSubmit.experienceMin) || 0,
      maxexperience: parseInt(dataToSubmit.experienceMax) || 0,
      ownerId: userId,
      tenantId: orgId,
      CreatedBy: `${userName} at ${currentDateTime}`,
      LastModifiedById: userId,
      skills: entries.map(entry => ({
        skill: entry.skill,
        experience: entry.experience,
        expertise: entry.expertise,
      })),
      additionalNotes: dataToSubmit.additionalNotes,
      jobDescription: dataToSubmit.jobDescription.trim(),
      rounds: dataToSubmit.rounds || [],
    };

    console.log('basicdetails:', basicdetails);

    try {
      let response;
      if (positionId) {
        console.log("Updating existing position with ID:", positionId);
        response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/position/${positionId}`,
          basicdetails
        );
        console.log("Updated response:", response.data);
      } else {
        console.log("Creating new position...");
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/position`,
          basicdetails
        );
        console.log("New position response:", response.data.data);
        setPositionId(response.data.data._id);
      }

      if (response.status === 201 || response.status === 200) {
        // Handle navigation
        if (actionType === "BasicDetailsSave") {
          onClose();
        }
        if (actionType === "BasicDetailsSave&AddRounds") {
          setIsRoundModalOpen(true);
        }
        if (actionType === "BasicDetailsSave&Next") {
          handleNextNavigation();
        }
        if (actionType === "RoundDetailsSave") {
          onClose();
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
  const [insertIndex, setInsertIndex] = useState(-1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState('');
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roundIndex: -1 });
  const [hoveredRound, setHoveredRound] = useState(-1);
  const [hasRounds, setHasRounds] = useState(false);

  if (!isOpen) return null;
  const maxRounds = 5;
  const handleSave = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleRoundNext = (interviewType, roundData) => {
    setHasRounds(true);
    setSelectedInterviewType(interviewType);

    if (insertIndex !== -1) {
      // Insert at specific position
      const newRounds = [...rounds];
      newRounds.splice(insertIndex, 0, roundData);

      // Update round numbers in the titles
      newRounds.forEach((round, idx) => {
        round.roundName = round.roundName.replace(/Round \d+/, `Round ${idx + 1}`);
      });

      setRounds(newRounds);
      setCurrentRoundIndex(insertIndex);
    } else {
      // Add at the end
      setRounds(prev => [...prev, roundData]);
      setCurrentRoundIndex(rounds.length);
    }

    setShowAssessment(true);
    setIsRoundModalOpen(false);
    setCurrentStage(insertIndex !== -1 ? `round${insertIndex + 1}` : `round${rounds.length + 1}`);
    setInsertIndex(-1);
  };

  const handleAddRoundAtIndex = (index) => {
    setInsertIndex(index);
    setIsRoundModalOpen(true);
  };

  const handleRoundDelete = (index) => {
    setDeleteConfirmation({ isOpen: true, roundIndex: index });
  };

  const confirmDelete = () => {
    const index = deleteConfirmation.roundIndex;
    const newRounds = [...rounds];
    newRounds.splice(index, 1);

    // Update round numbers in the titles
    newRounds.forEach((round, idx) => {
      round.roundName = round.roundName.replace(/Round \d+/, `Round ${idx + 1}`);
    });

    setRounds(newRounds);

    // Navigate logic after deletion
    if (newRounds.length === 0) {
      // If no rounds left, go to basic state
      setCurrentStage('basic');
      setShowAssessment(false);
      setSelectedInterviewType('');
      setCurrentRoundIndex(-1);
    } else {
      // Navigate to the nearest available round
      let newIndex;
      if (index >= newRounds.length) {
        // If deleted last round, go to new last round
        newIndex = newRounds.length - 1;
      } else {
        // Stay on same index (which now has next round)
        newIndex = index;
      }

      // Update state with new round's details
      setCurrentStage(`round${newIndex + 1}`);
      setCurrentRoundIndex(newIndex);
      setSelectedInterviewType(newRounds[newIndex].interviewType || '');
      setShowAssessment(true);
    }

    setDeleteConfirmation({ isOpen: false, roundIndex: -1 });
  };

  // const handleRoundClick = (index) => {
  //   setCurrentRoundIndex(index);
  //   setSelectedInterviewType(rounds[index].interviewType);
  //   setShowAssessment(true);
  //   setCurrentStage('round' + (index + 1));
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
    console.log('Before updating formData:', formData);
    console.log('Received roundData:', roundData, "Action Type:", actionType);

    setFormData((prevData) => {
      let updatedRounds = [...(prevData.rounds || [])];

      if (actionType === "RoundDetailsSave&AddRound") {
        // Add new round
        updatedRounds.push(roundData);
      } else if (actionType === "RoundDetailsSave&Next") {
        // Update the current round instead of adding a new one
        updatedRounds[currentRoundIndex] = roundData;
      } else if (actionType === "RoundDetailsSave") {
        // Save current round and close
        updatedRounds[currentRoundIndex] = roundData;
      }

      const updatedFormData = {
        ...prevData,
        rounds: updatedRounds,
      };

      console.log('After updating formData:', updatedFormData);

      // Call handleSubmit with updated data
      handleSubmit(null, actionType, true, updatedFormData);

      return updatedFormData;
    });
  };

  const renderStageIndicator = () => {

    // Update flag when moving to rounds
    const isBasicStage = currentStage === 'basic';
    const currentRoundNumber = currentStage.startsWith('round') ? parseInt(currentStage.slice(5)) : 0;

    return (
      <div className="flex items-center justify-center mb-4 mt-1 w-full overflow-x-auto py-2">
        <div className="flex items-center min-w-fit px-2">
          {/* Basic Details */}
          <div className="flex items-center">
            <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${isBasicStage
              ? 'bg-orange-500 text-white'
              : 'bg-teal-600 text-white'
              }`}>
              Basic Details
            </span>
          </div>

          {/* Rounds Section */}
          {!hasMovedToRounds && isBasicStage ? (
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
          ) : (
            // When in Rounds: Show all rounds with plus icons
            <>
              {rounds.map((_, index) => (
                <div key={index} className="flex items-center">
                  {/* Connector to Round with Plus Icon */}
                  <div className="flex items-center">
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

                  {/* Round Button with Hover Delete */}
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
              ))}

              {/* Plus icon to add round after current round */}
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
                <div
                  onClick={() => handleAddRoundAtIndex(rounds.length)}
                  className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center cursor-pointer hover:border-teal-600"
                >
                  <FaPlus className="h-3 w-3 text-teal-600" />
                </div>
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>

              {/* Next Future Round */}
              {rounds.length < maxRounds && (
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
          )}

          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center" >
              <div className="h-5 w-5 rounded-full border-2 border-teal-200"></div>
            </div>
          </div>
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
              onClose();
            }
          }}
          onCancel={onClose}
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
              onClose();
            }
          }}
          onCancel={onClose}
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
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) {
                              setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
                            }
                          }}
                          placeholder="UI/UX Designer"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                            }`}
                        />
                        {errors.title && <p className="text-red-500">{errors.title}</p>}
                      </div>

                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.companyName}
                            readOnly
                            onClick={() => setShowDropdownCompany(!showDropdownCompany)}
                            placeholder="Select a company"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.companyname ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                              }`}
                          />
                          {errors.companyname && <p className="text-red-500">{errors.companyname}</p>}
                          {showDropdownCompany && (
                            <div className="absolute z-50 w-full bg-white shadow-md rounded-md mt-1 max-h-40 overflow-y-auto">
                              {companies.map((company) => (
                                <div
                                  key={company._id}
                                  className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleCompanySelect(company)}
                                >
                                  {company.CompanyName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experience <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Min Experience */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Min</label>
                            <select
                              value={formData.experienceMin ?? ""}
                              onChange={(e) => {
                                const minExp = e.target.value ? parseInt(e.target.value) : null;

                                // Update state
                                setFormData({
                                  ...formData,
                                  experienceMin: minExp,
                                  experienceMax: null, // Reset max when min changes
                                });

                                // Remove error only if a valid option is selected
                                if (minExp) {
                                  setErrors((prevErrors) => ({ ...prevErrors, minexperience: "" }));
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.minexperience ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                }`}
                            >
                              <option value="">Select min exp</option>
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                            {errors.minexperience && <p className="text-red-500">{errors.minexperience}</p>}
                          </div>

                          {/* Max Experience */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Max</label>
                            <select
                              value={formData.experienceMax ?? ""}
                              onChange={(e) => {
                                const maxExp = e.target.value ? parseInt(e.target.value) : null;

                                // Update state
                                setFormData({ ...formData, experienceMax: maxExp });

                                // Remove error only if a valid option is selected
                                if (maxExp) {
                                  setErrors((prevErrors) => ({ ...prevErrors, maxexperience: "" }));
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.maxexperience ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                }`}
                              disabled={!formData.experienceMin} // Disable until Min is selected
                            >
                              <option value="">Select max exp</option>
                              {[...Array(10)]
                                .map((_, i) => i + 1)
                                .filter((num) => num > formData.experienceMin)
                                .map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                            </select>
                            {errors.maxexperience && <p className="text-red-500">{errors.maxexperience}</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.jobDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, jobDescription: value });

                          // Remove validation error when user starts typing
                          if (value.trim() !== "") {
                            setErrors((prevErrors) => ({ ...prevErrors, jobdescription: "" }));
                          }
                        }}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.jobdescription ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                          }`}
                        placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple choice questions, coding challenges, and scenario-based problems relevant to the job role."
                      />
                      {errors.jobdescription && <p className="text-red-500">{errors.jobdescription}</p>}
                    </div>

                    {/* skills */}
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
                          className="flex items-center justify-center text-sm bg-custom-blue text-white py-1 rounded w-28"
                        >
                          <FaPlus className="text-md mr-2" />
                          Add Skills
                        </button>
                      </div>
                      {errors.skills && (
                        <p className="text-red-500 text-sm">{errors.skills}</p>
                      )}

                      <div className="space-y-2 mb-4 mt-5">
                        {entries.map((entry, index,) => (
                          <div key={index} className="border p-2 rounded-lg bg-gray-100 w-[75%] sm:w-full md:w-full flex">
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

                      {isModalOpen && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
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
                      {deleteIndex !== null && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                          <div className="bg-white p-5 rounded shadow-lg">
                            <p>Are you sure you want to delete this Skill?</p>
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                type="button"
                                onClick={confirmDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
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

                    {/* template */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Template <span className="text-red-500">*</span>
                      </label>
                      <div className="relative w-1/2 sm:w-full md:w-full">
                        <input
                          type="text"
                          placeholder="Select Template"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Search size={20} className="text-gray-400" />
                        </div>
                      </div>
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
                <button className="px-3 py-1 border-custom-blue rounded border" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, "BasicDetailsSave")}
                  className="px-3 py-1 border bg-custom-blue text-white rounded hover:bg-custom-blue font-medium"
                >
                  Save
                </button>

                {/* Show 'Save & Add Round' if no rounds are added */}
                {!hasRounds && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "BasicDetailsSave&AddRounds")}
                    className="px-3 py-1 border bg-custom-blue text-white rounded hover:bg-custom-blue font-medium"
                  >
                    Save & Add Round
                  </button>
                )}

                {/* Show 'Save & Next' only when positionId exists & at least one round is added */}
                {positionId && hasRounds && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "BasicDetailsSave&Next")}
                    className="px-3 py-1 border bg-custom-blue text-white rounded hover:bg-custom-blue font-medium"
                  >
                    Save & Next
                  </button>
                )}

              </div>
            </>
          )}
        </div>
        {/* Round Modal */}
        {isRoundModalOpen && (
          <RoundModal
            isOpen={true}
            onClose={() => {
              setIsRoundModalOpen(false);
              setInsertIndex(-1);
            }}
            onNext={handleRoundNext}
            currentRoundNumber={insertIndex + 1}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          roundNumber={deleteConfirmation.roundIndex + 1}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation({ isOpen: false, roundIndex: -1 })}
        />
      </div>
    </div>
  );
};

export default PositionForm;
