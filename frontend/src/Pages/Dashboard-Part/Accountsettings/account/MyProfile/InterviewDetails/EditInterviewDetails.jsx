import { useEffect, useRef, useState } from 'react'

import { Maximize, Minimize, Search, X, ChevronDown } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import axios from 'axios';
import { fetchMasterData } from '../../../../../../utils/fetchMasterData';
import { isEmptyObject, validateInterviewForm } from '../../../../../../utils/MyProfileValidations';

import { ReactComponent as Technology } from '../../../../../../icons/technology.svg';
import { ReactComponent as SkillIcon } from '../../../../../../icons/Skills.svg';
import { useCustomContext } from '../../../../../../Context/Contextfetch';
import { redirect, useNavigate, useParams } from 'react-router-dom';
import { config } from '../../../../../../config';
import { useMasterData } from '../../../../../../apiHooks/useMasterData';
import { useUpdateContactDetail, useUserProfile } from '../../../../../../apiHooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';



const EditInterviewDetails = ({ from, usersId, setInterviewEditOpen, onSuccess }) => {

  // const {
  //   usersRes
  // } = useCustomContext();
  const {
    skills,
  } = useMasterData();
  const popupRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const resolvedId = usersId || id;

  const { userProfile, isLoading, isError, error } = useUserProfile(resolvedId)
  // const requestEmailChange = useRequestEmailChange();
  const updateContactDetail = useUpdateContactDetail();
  const queryClient = useQueryClient();

  const [searchTermSkills, setSearchTermSkills] = useState('');
  const skillsPopupRef = useRef(null);
  const [showSkillsPopup, setShowSkillsPopup] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([])

  const [searchTermTechnology, setSearchTermTechnology] = useState('');
  const [errors, setErrors] = useState({});
  const [isReady, setIsReady] = useState(null);
  const [expertiseLevel, setExpertiseLevel] = useState('');
  const [showTechPopup, setTechpopup] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [InterviewPreviousExperience, setInterviewPreviousExperience] = useState('');
  const [services, setServices] = useState([])

  const [formData, setFormData] = useState({
    PreviousExperienceConductingInterviews: '',
    PreviousExperienceConductingInterviewsYears: '',
    ExpertiseLevel_ConductingInterviews: '',
    hourlyRate: "",
    expectedRatePerMockInterview: "",
    // IsReadyForMockInterviews: '',
    // ExpectedRatePerMockInterviewMin: '',
    // ExpectedRatePerMockInterviewMax: '',
    Technology: [],
    skills: [],
    NoShowPolicy: '',
    // ExpectedRateMin: '', 
    // ExpectedRateMax: '',
    professionalTitle: "",
    bio: "",
    interviewFormatWeOffer: []
  });
  const [isMockInterviewSelected, setIsMockInterviewSelected] = useState(false)

  const bioLength = formData.bio?.length || 0;

  // console.log("userId Interview Details", from);
  useEffect(() => {
    const fetchData = async () => {
      try {

        const technologyData = await fetchMasterData('technology');
        setServices(technologyData);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    fetchData();
  }, []);


  // Changed: Updated useEffect to properly map all backend fields
  useEffect(() => {

    // const contact = usersRes.find(user => user.contactId === resolvedId);


    // if (!contact) return;
    if (!userProfile || !userProfile._id) return;

    console.log("Edit Interview Details userProfile", userProfile);
    // console.log("user", user);
    setFormData({
      PreviousExperienceConductingInterviews: userProfile?.previousExperienceConductingInterviews || '',
      PreviousExperienceConductingInterviewsYears: userProfile?.previousExperienceConductingInterviewsYears || '',
      ExpertiseLevel_ConductingInterviews: userProfile?.expertiseLevelConductingInterviews || '',
      // IsReadyForMockInterviews: user.IsReadyForMockInterviews || '',
      // ExpectedRatePerMockInterviewMin: String(user.ExpectedRatePerMockInterviewMin || ''),
      // ExpectedRatePerMockInterviewMax: String(user.ExpectedRatePerMockInterviewMax || ''),
      Technology: Array.isArray(userProfile?.technologies) ? userProfile?.technologies : [],
      NoShowPolicy: userProfile?.noShowPolicy || '',
      // ExpectedRateMin: String(user.ExpectedRateMin || ''),
      // ExpectedRateMax: String(user.ExpectedRateMax || ''),
      skills: Array.isArray(userProfile?.skills) ? userProfile?.skills : [],
      interviewFormatWeOffer: Array.isArray(userProfile?.interviewFormatWeOffer) ? userProfile?.interviewFormatWeOffer : [],
      professionalTitle: userProfile?.professionalTitle || "",
      bio: userProfile?.bio || "",
      hourlyRate: userProfile?.hourlyRate,
      id: userProfile?._id,
      expectedRatePerMockInterview: userProfile?.expectedRatePerMockInterview || ""
    });
    setIsMockInterviewSelected(userProfile?.expectedRatePerMockInterview ? true : false);
    setSelectedSkills(Array.isArray(userProfile?.skills) ? userProfile?.skills : []);
    setInterviewPreviousExperience(userProfile?.previousExperienceConductingInterviews || '');
    setExpertiseLevel(userProfile?.expertiseLevelConductingInterviews || '');
    setIsReady(userProfile?.IsReadyForMockInterviews === 'yes');
    setSelectedCandidates(userProfile?.technologies.map(tech => ({ TechnologyMasterName: tech })) || []);
    setErrors({});


  }, [resolvedId, userProfile?._id]);

  const handleBioChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, bio: value });
    setErrors((prevErrors) => ({
      ...prevErrors,
      bio: "",
    }));
  };


  const toggleSkillsPopup = () => setShowSkillsPopup((prev) => !prev);

  const handleSelectSkill = (skill) => {
    if (skill && !selectedSkills.includes(skill.SkillName)) {
      const newSkill = skill.SkillName;
      setSelectedSkills(prev => [...prev, newSkill]);
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setErrors(prev => ({ ...prev, skills: '' }));
      // Note: Not updating `entries` here as it seems unused in this context
    }
    setShowSkillsPopup(false);
  };




  const handleRadioChange = (e) => {
    const value = e.target.value;
    setInterviewPreviousExperience(value);
    setFormData((prev) => ({
      ...prev,
      PreviousExperienceConductingInterviews: value,
      PreviousExperienceConductingInterviewsYears: value === "no" ? "" : prev.PreviousExperienceConductingInterviewsYears,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      PreviousExperienceConductingInterviews: "",
      PreviousExperienceConductingInterviewsYears: value === "no" ? "" : prevErrors.PreviousExperienceConductingInterviewsYears,
    }));
  };


  // level of expertice
  const handleRadioChange2 = (e) => {
    const value = e.target.value;
    setExpertiseLevel(value);
    setFormData((prev) => ({
      ...prev,
      ExpertiseLevel_ConductingInterviews: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      ExpertiseLevel_ConductingInterviews: "",
    }));
  };


  // const handleRadioChange3 = (event) => {
  //   const value = event.target.value;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     IsReadyForMockInterviews: value,
  //     ...(value === "no" ? {
  //       ExpectedRatePerMockInterviewMin: "",
  //       ExpectedRatePerMockInterviewMax: ""
  //     } : {}),
  //   }));
  //   setIsReady(value === "yes");
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     IsReadyForMockInterviews: value ? "" : "Please select an option",
  //     ...(value === "no" ? {
  //       ExpectedRatePerMockInterviewMin: "",
  //       ExpectedRatePerMockInterviewMax: ""
  //     } : {}),
  //   }));
  // };

  const handleChangeExperienceYears = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      PreviousExperienceConductingInterviewsYears: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      PreviousExperienceConductingInterviewsYears: "",
    }));
  };




  const handleSelectCandidate = (technologies) => {
    if (!selectedCandidates.some(c => c.TechnologyMasterName === technologies.TechnologyMasterName)) {
      setSelectedCandidates((prev) => [...prev, technologies]);
      setFormData((prev) => ({
        ...prev,
        Technology: [...prev.Technology, technologies.TechnologyMasterName],
      }));
    }
    setTechpopup(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      Technology: "",
    }));
  };

  // const clearRemoveCandidate = () => {
  //   setSelectedCandidates([]);
  //   setFormData(prev => ({
  //     ...prev,
  //     Technology: []
  //   }));
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     Technology: "At least one technology is required",
  //   }));
  // };

  const handleRemoveCandidate = (index) => {
    const newCandidates = selectedCandidates.filter((_, i) => i !== index);
    setSelectedCandidates(newCandidates);
    setFormData(prev => ({
      ...prev,
      Technology: newCandidates.map(c => c.TechnologyMasterName)
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      Technology: newCandidates.length === 0 ? "At least one technology is required" : "",
    }));
  };



  const handleNoShow = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      NoShowPolicy: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      NoShowPolicy: "",
    }));
  };





  const handleCloseModal = () => {
    if (from === 'users') {
      setInterviewEditOpen(false)
    } else {
      // navigate('/account-settings/my-profile/interview', { replace: true })
      navigate(-1) // Added by Ashok
    }

  }


  // API call to save all changes
  const handleSave = async (e) => {
    e.preventDefault();

    const validationErrors = validateInterviewForm(formData, isReady);
    setErrors(validationErrors);

    console.log("validationErrors", validationErrors);


    if (!isEmptyObject(validationErrors)) {
      return; // Prevent submission if there are errors
    }

    // console.log("form", formData , typeof Number(formData.hourlyRate));


    const cleanFormData = {
      PreviousExperienceConductingInterviews: String(formData.PreviousExperienceConductingInterviews?.trim() || '').trim(),
      PreviousExperienceConductingInterviewsYears: String(formData.PreviousExperienceConductingInterviewsYears || '').trim(),
      ExpertiseLevel_ConductingInterviews: String(formData.ExpertiseLevel_ConductingInterviews || '').trim(),
      hourlyRate: Number(formData.hourlyRate) || '',

      // IsReadyForMockInterviews: formData.IsReadyForMockInterviews?.trim() || '',
      // ExpectedRatePerMockInterviewMin: String(formData.ExpectedRatePerMockInterviewMin)?.trim() || '', // Changed: Convert to string before trim
      // ExpectedRatePerMockInterviewMax: String(formData.ExpectedRatePerMockInterviewMax)?.trim() || '', // Changed: Convert to string before trim
      technologies: Array.isArray(formData.Technology) ? formData.Technology : [],
      skills: Array.isArray(formData.skills) ? formData.skills : [],
      NoShowPolicy: String(formData.NoShowPolicy || '').trim(),
      // ExpectedRateMin: String(formData.ExpectedRateMin)?.trim() || '', // Changed: Convert to string before trim
      // ExpectedRateMax: String(formData.ExpectedRateMax)?.trim() || '',  // Changed: Convert to string before trim
      InterviewFormatWeOffer: formData.interviewFormatWeOffer || [],
      expectedRatePerMockInterview: formData.interviewFormatWeOffer.includes('mock') ? formData.expectedRatePerMockInterview : '',
      professionalTitle: String(formData.professionalTitle || "").trim(),
      bio: String(formData.bio || "").trim(),
      id: formData.id
    };

    try {


      // const response = await axios.patch(
      //   `${config.REACT_APP_API_URL}/contact-detail/${resolvedId}`,
      //   cleanFormData
      // );

      const response = await updateContactDetail.mutateAsync({
        resolvedId,
        data: cleanFormData,
      });
      await queryClient.invalidateQueries(["userProfile", resolvedId]);

      console.log("response cleanFormData", response);

      if (response.status === 200) {
        // setUserData((prev) => ({ ...prev, ...cleanFormData }));
        // setIsBasicModalOpen(false);
        handleCloseModal();
        // onSuccess();
        if (usersId) onSuccess();
      }
    } catch (error) {
      console.error('Error updating interview details:', error);
    }
  };


  const filteredSkills = Array.isArray(skills) ? skills.filter((skill) =>
    skill?.SkillName?.toLowerCase()?.includes(searchTermSkills.toLowerCase() || '')
  ) : [];


  const handleRemoveSkill = (index) => {
    const updatedSkills = selectedSkills.filter((_, i) => i !== index);
    setSelectedSkills(updatedSkills);
    setFormData(prev => ({ ...prev, skills: updatedSkills }));

    if (updatedSkills.length === 0) {
      setErrors(prev => ({ ...prev, skills: "At least one skill is required" }));
    } else {
      setErrors(prev => ({ ...prev, skills: '' }));
    }

  };


  // const modalClass = classNames(
  //   'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
  //   {
  //     'inset-0': isFullScreen,
  //     'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
  //   }
  // );
  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  const handleInterviewFormatChange = (event) => {
    const { value, checked } = event.target;

    setFormData(prevData => {
      let updatedFormats = [...(prevData.interviewFormatWeOffer || [])];

      if (checked) {
        if (!updatedFormats.includes(value)) {
          updatedFormats.push(value);
        }
      } else {
        updatedFormats = updatedFormats.filter(format => format !== value);
      }

      return {
        ...prevData,
        interviewFormatWeOffer: updatedFormats
      };
    });

    // Clear error when user selects an option
    if (errors.interviewFormatWeOffer) {
      setErrors(prev => ({
        ...prev,
        interviewFormatWeOffer: ''
      }));
    }

    if (value === "mock") {
      setIsMockInterviewSelected(checked);
    }
  };


  const handleChangeforExp = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      return {
        ...prev,
        expectedRatePerMockInterview: value,
      };
    });
    setErrors((prevErrors) => {
      const errorMessage =
        value >= 20 && value <= 500 ? "" : "Hourly rate must be between $20 and $500.";
      return { ...prevErrors, expectedRatePerMockInterview: errorMessage };
    });
  };


  const handleHourlyRateChange = (e) => {
    const value = e.target.value || "";
    setFormData((prev) => {
      return {
        ...prev,
        hourlyRate: value,
      };
    });
    setErrors((prevErrors) => {
      const errorMessage =
        value >= 20 && value <= 500 ? "" : "Hourly rate must be between $20 and $500.";
      console.log("Error Message:", errorMessage);
      return { ...prevErrors, hourlyRate: errorMessage };
    });
  };



  return (
    <Modal
      isOpen={true}
      onRequestClose={handleCloseModal}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // shouldCloseOnOverlayClick={false}
    >

      <div className={classNames('h-full flex flex-col', {
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': isFullScreen, // Centered with max-width in full-screen
        'p-4': !isFullScreen, // Padding for half-screen
      })}>

        <div >

          <div className="flex justify-between items-center mb-6 space-y-4">
            <h2 className="text-2xl font-bold text-custom-blue">Edit Interview Details</h2>
            <div className="flex items-center gap-2">
              <button

                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <form className="space-y-6 pb-2">

            <div className="grid grid-cols-1  gap-4">

              {/* technology */}
              <div className='space-y-4'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Comfortable Technologies <span className="text-red-500">*</span></label>

                <div className="space-y-2">
                  <div className="relative" ref={popupRef}>
                    <input
                      placeholder="Select Multiple Technologies"
                      readOnly // Prevent typing
                      onClick={() => setTechpopup((prev) => !prev)}
                      className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 `}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                      <ChevronDown className="text-lg" onClick={() => setTechpopup((prev) => !prev)} />
                    </div>
                    {showTechPopup && (
                      <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                        <div className="border-b">
                          <div className="flex items-center border rounded px-2 py-1 m-2">
                            <Search className="absolute ml-1 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Search Technology"
                              value={searchTermTechnology}
                              onChange={(e) => setSearchTermTechnology(e.target.value)}
                              className="pl-8 focus:border-black focus:outline-none w-full"
                            />
                          </div>
                        </div>
                        {services.filter(service =>
                          service.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
                        ).length > 0 ? (
                          services.filter(service =>
                            service.TechnologyMasterName.toLowerCase().includes(searchTermTechnology.toLowerCase())
                          ).map((service) => (
                            <div
                              key={service._id}
                              onClick={() => handleSelectCandidate(service)}
                              className="cursor-pointer hover:bg-gray-200 p-2"
                            >
                              {service.TechnologyMasterName}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">No technologies found</div>
                        )}
                      </div>
                    )}
                    {errors.Technology && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.Technology}</p>}
                  </div>


                  <div className=" mb-5 relative">
                    {selectedCandidates.map((candidate, index) => (
                      <div key={index} className="border border-custom-blue rounded px-2 py-1 inline-block mr-2 m-1 text-sm sm:text-xs sm:w-[90%]">
                        <div className="flex items-center justify-between gap-2 text-custom-blue">
                          <div className="flex">
                            <span className="sm:w-5 w-8"> <Technology className="pt-1 text-custom-blue h-6 w-6 " /></span>
                            {candidate.TechnologyMasterName}
                          </div>
                          <button type="button" onClick={() => handleRemoveCandidate(index)} className="ml-2 text-red-500 rounded px-2">X</button>
                        </div>

                      </div>
                    ))}

                  </div>



                </div>


              </div>

              {/* Skills */}
              <div className='space-y-4'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Skills <span className="text-red-500">*</span></label>
                <div className="space-y-2">

                  <div className="relative" ref={skillsPopupRef}>
                    <input
                      onClick={toggleSkillsPopup}
                      className={`block focus:outline-none border w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 `}
                      placeholder="Select Multiple Skills"

                    />
                    <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500">
                      <ChevronDown className="text-lg" onClick={toggleSkillsPopup} />
                    </div>
                    {showSkillsPopup && (
                      <div className="absolute bg-white border border-gray-300 w-full mt-1 max-h-60 overflow-y-auto z-10 text-xs">
                        <div className="border-b">
                          <div className="flex items-center border rounded px-2 py-1 m-2">
                            <Search className="absolute ml-1 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Search Skills"
                              value={searchTermSkills}
                              onChange={(e) => setSearchTermSkills(e.target.value)}
                              className="pl-8  focus:border-black focus:outline-none w-full"
                            />
                          </div>
                        </div>
                        {filteredSkills.length > 0 ? (
                          filteredSkills.map((skill) => (
                            <div
                              key={skill?._id}
                              onClick={() => handleSelectSkill(skill)}
                              className="cursor-pointer hover:bg-gray-200 p-2"
                            >
                              {skill?.SkillName}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">No skills found</div>
                        )}
                      </div>
                    )}
                    {/* {errors.Skills && <p className="text-red-500 text-sm sm:text-xs">{errors.Skills}</p>} */}
                  </div>
                  {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                  <div className="mt-4 mb-5 relative">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill, index) => (
                        <div key={index} className="border border-custom-blue rounded px-2 m-1 py-1 inline-block mr-2 text-sm sm:text-xs sm:w-[90%]">
                          <div className="flex items-center justify-between gap-2 text-custom-blue">
                            <div className="flex">
                              <span className="sm:w-5 w-8">
                                <SkillIcon className="pt-1 text-custom-blue h-6 w-6" />
                                {/* <SkillIcon className="pt-1 text-lg" /> */}
                              </span>
                              {skill}
                            </div>
                            <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-2 text-red-500 rounded px-2">X</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet</p>
                    )}


                  </div>
                  {/* <button
                    onClick={() => setIsModalOpen(true)}
                  className="text-custom-blue"
                >
                  + Add Expertise
                </button> */}
                </div>
              </div>


            </div>


            {/* <div className="space-y-4 grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2  xl:grid-cols-2  2xl:grid-cols-2 gap-10"> */}


            <div className="col-span-2 sm:col-span-6 space-y-6">
              {/* Previous Experience */}
              <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                <p >
                  Do you have any previous experience conducting interviews? <span className="text-red-500">*</span>
                </p>
                <div className="mt-3 mb-3 flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-gray-600"
                      name="InterviewPreviousExperience"
                      value="yes"
                      checked={InterviewPreviousExperience === "yes"}
                      onChange={handleRadioChange}
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-gray-600"
                      name="InterviewPreviousExperience"
                      value="no"
                      checked={InterviewPreviousExperience === "no"}
                      onChange={handleRadioChange}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
                {errors.PreviousExperienceConductingInterviews && <p className="text-red-500 text-sm sm:text-xs">{errors.PreviousExperienceConductingInterviews}</p>}
                {/* {errors.PreviousExperience && (
                    <p className="text-red-500 text-sm sm:text-xs">{errors.PreviousExperience}</p>
                  )} */}
              </div>

              {/* Conditional Experience Years */}
              {InterviewPreviousExperience === "yes" && (
                <div className='w-full'>
                  <label htmlFor="InterviewPreviousExperienceYears" className="block text-sm font-medium text-gray-900 mb-2">
                    How many years of experience do you have in conducting interviews? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="InterviewPreviousExperienceYears"
                    name="InterviewPreviousExperienceYears"
                    min="1"
                    max="15"
                    value={formData.PreviousExperienceConductingInterviewsYears}
                    onChange={handleChangeExperienceYears}
                    className={`block border rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 w-2/5 sm:w-1/2 focus:outline-none ${errors.InterviewPreviousExperienceYears ? "border-red-500" : "border-gray-400"
                      }`}
                  />
                  {errors.PreviousExperienceConductingInterviewsYears && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.PreviousExperienceConductingInterviewsYears}</p>}
                  {/* {errors.PreviousExperienceConductingInterviewsYears && (
                      <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.InterviewPreviousExperienceYears}</p>
                    )} */}
                </div>
              )}

              {/* Level of Expertise */}
              <div className="text-gray-900 text-sm font-medium leading-6 rounded-lg">
                <p>Choose your level of expertise in conducting interviews <span className="text-red-500">*</span></p>
                <div className="mt-3 flex flex-wrap space-x-8 md:space-x-10 sm:space-x-0 sm:flex-col">
                  {["junior", "mid-level", "senior", "lead"].map((level, index) => (
                    <label key={index} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-gray-600"
                        name="InterviewExpertiseLevel"
                        value={level}
                        checked={expertiseLevel === level}
                        onChange={handleRadioChange2}
                      />
                      <span className="ml-2 capitalize">{level.replace("-", " ")} ({index * 3}-{(index + 1) * 3} years)</span>
                    </label>
                  ))}
                </div>
                {errors.ExpertiseLevel_ConductingInterviews && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.ExpertiseLevel_ConductingInterviews}</p>}
              </div>

              {/* Expected Rate Per Hour */}
              {/* <div > */}
              <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-900 mb-2">
                Expected Hourly Rate (USD) <span className="text-red-500">*</span>
              </label>
              <div className="grid  gap-6">

                <div className='flex flex-col w-full'>
                  <div className="relative w-full">
                    {/* Dollar Symbol */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>

                    {/* Input Field with $ Symbol Inside */}

                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      min="20"
                      max="500"
                      placeholder="75"
                      value={formData.hourlyRate || ""}
                      onChange={handleHourlyRateChange}
                      className={`block border rounded-md bg-white pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 w-full focus:outline-none ${errors.hourlyRate ? "border-red-500" : "border-gray-400"
                        } `}
                    />

                  </div>

                  {/* Error Message Below Input */}
                  {errors.hourlyRate && (
                    <p className="text-red-500 text-xs sm:text-xs mt-1 ml-1">{errors.hourlyRate}</p>
                  )}
                </div>
              </div>
              {/* </div> */}

              {/* Interview Formats You Offer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Formats You Offer <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'format_technical',
                      value: 'technical',
                      label: 'Technical Coding',
                      description: 'Algorithmic problem-solving and coding challenges',
                    },
                    {
                      id: 'format_system_design',
                      value: 'system_design',
                      label: 'System Design',
                      description: 'Architecture and scalability discussions',
                    },
                    {
                      id: 'format_behavioral',
                      value: 'behavioral',
                      label: 'Behavioral',
                      description: 'Soft skills and situational questions',
                    },
                    {
                      id: 'format_mock',
                      value: 'mock',
                      label: 'Mock Interviews',
                      description: 'Full interview simulation with feedback',
                    },
                  ].map(({ id, value, label, description }) => (
                    <div
                      key={id}
                      className="relative flex items-start p-4 rounded-lg border border-gray-200  transition-colors"
                    >
                      <div className="flex items-center h-5">
                        <input
                          id={id}
                          type="checkbox"
                          value={value}
                          // Changed: Use includes() to check if value is in interviewFormatWeOffer
                          // checked={formData.interviewFormatWeOffer.includes(value)}
                          checked={formData.interviewFormatWeOffer?.includes(value) || false}
                          onChange={handleInterviewFormatChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor={id} className="font-medium text-gray-700">
                          {label}
                        </label>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Changed: Added error display for interviewFormatWeOffer */}
                {errors.interviewFormatWeOffer && (
                  <p className="text-red-500 text-sm mt-2">{errors.interviewFormatWeOffer}</p>
                )}
              </div>

              {/* Expected Rate Per Mock Interview */}
              {isMockInterviewSelected && (
                <div>
                  <label
                    htmlFor="hourly_rate"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Expected rate per mock interview (USD) <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    {/* Dollar Symbol */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>

                    {/* Hourly Rate Input */}
                    <input
                      id="expectedRatePerMockInterview"
                      type="number"
                      name="expectedRatePerMockInterview"
                      min="20"
                      max="500"
                      value={formData?.expectedRatePerMockInterview}
                      onChange={handleChangeforExp}
                      className={`block w-full pl-7 pr-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm ${errors.expectedRatePerMockInterview ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="75"
                    />
                  </div>

                  {/* Error Message */}
                  {errors.expectedRatePerMockInterview && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.expectedRatePerMockInterview}</p>
                  )}
                </div>
              )}



              {/* No-Show Policy */}
              {/* {isReady && ( */}
              <div>
                <p className="text-gray-900 text-sm font-medium leading-6 rounded-lg mb-1">
                  Policy for No-Show Cases <span className="text-red-500">*</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-1 text-sm sm:text-xs">
                  {["25%", "50%", "75%", "100%"].map((policy) => (
                    <label key={policy} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="NoShowPolicy"
                        value={policy}
                        checked={formData.NoShowPolicy === policy}
                        onChange={handleNoShow}
                        className="form-radio text-gray-600"
                      />
                      <span className="ml-2">Charge {policy} without rescheduling</span>
                    </label>
                  ))}
                </div>
                {errors.NoShowPolicy && <p className="text-red-500 text-sm sm:text-xs mt-2">{errors.NoShowPolicy}</p>}
              </div>
              {/* // )} */}

              {/* Professional Title */}
              <div className="sm:col-span-6 col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="Professional Title"
                  name="professionalTitle"
                  type="text"
                  value={formData.professionalTitle}
                  // onChange={(e) =>
                  //   setFormData((prevData) => ({
                  //     ...prevData,
                  //     professionalTitle: e.target.value,
                  //   }))
                  // }
                  onChange={(e) => {
                    setFormData((prevData) => ({
                      ...prevData,
                      professionalTitle: e.target.value,
                    }));
                    // Clear error when user starts typing
                    if (e.target.value.length >= 50) {
                      setErrors(prev => ({ ...prev, professionalTitle: '' }));
                    }
                  }}
                  // onBlur={(e) => {
                  //   const value = e.target.value.trim();
                  //   if (!value) {
                  //     setErrors(prev => ({ ...prev, professionalTitle: 'Professional title is required' }));
                  //   } else if (value.length < 50) {
                  //     setErrors(prev => ({ ...prev, professionalTitle: 'Professional title must be at least 50 characters' }));
                  //   } else if (value.length > 100) {
                  //     setErrors(prev => ({ ...prev, professionalTitle: 'Professional title cannot exceed 100 characters' }));
                  //   } else {
                  //     setErrors(prev => ({ ...prev, professionalTitle: '' }));
                  //   }
                  // }}
                  className="block w-full px-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2  sm:text-sm"
                  placeholder="Senior Software Engineer"
                />
                <div className="flex justify-between ">
                  {errors.professionalTitle ? (
                    <p className="text-sm text-red-600">{errors.professionalTitle}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Min 50 characters</p>
                  )}
                  {formData.professionalTitle?.length > 0 && (
                    <p className={`text-xs ${formData.professionalTitle.length < 50 || errors.professionalTitle ? 'text-red-500' : 'text-gray-500'}`}>
                      {formData.professionalTitle.length}/100
                    </p>
                  )}
                </div>
                {/* {errors.title && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>
                )} */}
              </div>

              {/* Professional Bio */}
              <div className="sm:col-span-6 col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Bio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    rows="5"
                    value={formData.bio}
                    // onChange={handleBioChange}
                    onChange={(e) => {
                      handleBioChange(e);
                      // Clear error when user starts typing
                      // if (e.target.value.length >= 150) {
                      //   setErrors(prev => ({ ...prev, bio: '' }));
                      // }
                    }}
                    // onBlur={(e) => {
                    //   const value = e.target.value.trim();
                    //   if (!value) {
                    //     setErrors(prev => ({ ...prev, bio: 'Professional bio is required' }));
                    //   } else if (value.length < 150) {
                    //     setErrors(prev => ({ ...prev, bio: 'Professional bio must be at least 150 characters' }));
                    //   } else {
                    //     setErrors(prev => ({ ...prev, bio: '' }));
                    //   }
                    // }}
                    className={`block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2  sm:text-sm `}
                    // ${errors.bio ? 'border-red-500' : 'border-gray-300'
                    //   }
                    placeholder="Tell us about your professional background, expertise, and what makes you a great interviewer..."
                    minLength={150}
                    maxLength={500}
                  ></textarea>
                  {bioLength > 0 && (
                    <p
                      className={`absolute -bottom-6 right-0 text-xs ${bioLength < 150 || errors.bio ? 'text-red-500' : bioLength > 450 ? 'text-yellow-500' : 'text-gray-500'}`}
                    >
                      {bioLength}/500
                    </p>
                  )}
               
                </div>
                <div className="flex justify-between ">
                  {errors.bio ? (
                    <p className="text-sm text-red-600">{errors.bio}</p>
                  ) : (
                    <p className="text-xs text-gray-500">Min 150 characters</p>
                  )}
                </div>
              </div>




            </div>
            {/* </div> */}



            <div className="flex justify-end space-x-3  ">
              <button
                type="button"
                onClick={handleCloseModal}

                className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSave}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg "
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </Modal>
  )
}

export default EditInterviewDetails