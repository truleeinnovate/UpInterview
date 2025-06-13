import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { validateSteps } from '../../../utils/IndividualValidation.js';
import { TailSpin } from "react-loader-spinner";
import StepIndicator from "./StepIndicator.jsx"
import BasicDetails from './BasicDetails.jsx'
import AdditionalDetails from './AdditionalDetails.jsx';
import InterviewDetails from './InterviewDetails.jsx'
import AvailabilityDetails from './AvailabilityDetails.jsx'
import toast from "react-hot-toast";
import { config } from '../../../config.js';
import { setAuthCookies } from '../../../utils/AuthCookieManager/AuthCookieManager.jsx';

const FooterButtons = ({
  onNext,
  onPrev,
  currentStep,
  isFreelancer,
  isInternalInterviewer,
  isSubmitting = false
}) => {
  const lastStep = isInternalInterviewer ? 3 : (isFreelancer ? 3 : 1);
  const isLastStep = currentStep === lastStep;

  return (
    <div className="flex justify-between space-x-3 mt-4 mb-4 sm:text-sm">
      {currentStep > 0 ? (
        <button 
          type="button" 
          onClick={onPrev} 
          disabled={isSubmitting}
          className={`border ${isSubmitting ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-custom-blue text-custom-blue hover:bg-gray-50'} rounded px-6 sm:px-3 py-1`}
        >
          Prev
        </button>
      ) : (
        <div></div>
      )}
      <button
        onClick={onNext}
        disabled={isSubmitting}
        className={`px-6 sm:px-3 py-1 rounded text-white flex items-center justify-center ${isSubmitting ? 'bg-custom-blue/70 cursor-not-allowed' : 'bg-custom-blue hover:bg-custom-blue/90'}`}
        type="button"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isLastStep ? 'Saving...' : 'Processing...'}
          </>
        ) : isLastStep ? 'Save' : 'Next'}
      </button>
    </div>
  );
};

const MultiStepForm = () => {
      console.log('MultiStepForm')
  const navigate = useNavigate();
  const location = useLocation();
  const { Freelancer, profession, linkedInData } = location.state || {}; //from profile3
  const { isProfileComplete, roleName, contactDataFromOrg } = location.state || {}; //from organizationlogin page
  const [selectedTimezone, setSelectedTimezone] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  // Add these new states:
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [previousInterviewExperience, setPreviousInterviewExperience] = useState('');
  const [isMockInterviewSelected, setIsMockInterviewSelected] = useState(false);

  const [times, setTimes] = useState({
    Sun: [{ startTime: null, endTime: null }],
    Mon: [{ startTime: null, endTime: null }],
    Tue: [{ startTime: null, endTime: null }],
    Wed: [{ startTime: null, endTime: null }],
    Thu: [{ startTime: null, endTime: null }],
    Fri: [{ startTime: null, endTime: null }],
    Sat: [{ startTime: null, endTime: null }]
  });

  const [basicDetailsData, setBasicDetailsData] = useState({
    firstName: linkedInData ? linkedInData.firstName : "",
    lastName: linkedInData ? linkedInData.lastName : "",
    profileId: "",
    email: linkedInData ? linkedInData?.email : "",
    countryCode: "+91" || "",
    phone: "",
    linkedinUrl: linkedInData ? linkedInData?.profileUrl : "",
    portfolioUrl: "",
    dateOfBirth: "",
    gender: "",
  });

  // const checkProfileIdExists = useCallback(async (profileId) => {
  //   if (!profileId) return false;
  //   try {
  //     const response = await axios.get(`${config.REACT_APP_API_URL}/check-profileId?profileId=${profileId}`);
  //     return response.data.exists;
  //   } catch (error) {
  //     console.error("ProfileId check error:", error);
  //     return false;
  //   }
  // }, []);

  // const checkEmailExists = useCallback(async (email) => {
  //   if (!email) return false;
  //   try {
  //     const response = await axios.get(`${config.REACT_APP_API_URL}/check-email?email=${email}`);
  //     return response.data.exists;
  //   } catch (error) {
  //     console.error("Email check error:", error);
  //     return false;
  //   }
  // }, []);

  // if user created from organization default data will display from here
  useEffect(() => {
    if (isProfileComplete && contactDataFromOrg) {
      setBasicDetailsData((prevData) => ({
        ...prevData,
        // name: `${contactDataFromOrg.firstName || ''} ${contactDataFromOrg.lastName || ''}`.trim(),
        firstName: contactDataFromOrg.firstName || '',
        lastName: contactDataFromOrg.lastName || '',
        profileId: contactDataFromOrg.profileId || '',
        email: contactDataFromOrg.email || '',
        phone: contactDataFromOrg.phone || '',
      }));
    }
  }, [isProfileComplete, contactDataFromOrg]);

  useEffect(() => {
    if (linkedInData) {
      setFilePreview(linkedInData.pictureUrl);
      setBasicDetailsData(prev => ({
        ...prev,
        // name: `${linkedInData.firstName} ${linkedInData.lastName}`,
        firstName: linkedInData.firstName || '',
        lastName: linkedInData.lastName || '',
        email: linkedInData.email,
        linkedinUrl: linkedInData.profileUrl
      }));
    }
  }, [linkedInData]);

  const [additionalDetailsData, setAdditionalDetailsData] = useState({
    currentRole: "",
    industry: "",
    yearsOfExperience: "",
    location: "",
    coverLetterdescription: "",
    resume: null,
  });

  const [interviewDetailsData, setInterviewDetailsData] = useState({
    skills: [],
    technologies: [],
    previousInterviewExperience: "",
    previousInterviewExperienceYears: "",
    expertiseLevel_ConductingInterviews: "",
    hourlyRate: "",
    interviewFormatWeOffer: [],
    expectedRatePerMockInterview: "",
    noShowPolicy: "",
    bio: "",
    professionalTitle: "",
  });

  const [availabilityDetailsData, setAvailabilityDetailsData] = useState({
    timeZone: "",
    preferredDuration: "",
    availability: ""
  });

  // Determine if we should show limited steps (only 0 and 1) or all steps
  const showLimitedSteps = isProfileComplete && roleName !== "Internal_Interviewer";
  const isInternalInterviewer = roleName === "Internal_Interviewer";

  const [completed, setCompleted] = useState([false, false, false, false]);

  const handleNextStep = async () => {
    let params = {};
    let isValid = false;

    if (currentStep === 0) {
      params = {
        formData: basicDetailsData,
      };
      isValid = await validateSteps(
        currentStep,
        params,
        setErrors,
        // checkProfileIdExists,
        // checkEmailExists
      );

    } else if (currentStep === 1) {
      params = {
        formData: additionalDetailsData,
        selectedIndustry: additionalDetailsData.industry,
        selectedLocation: additionalDetailsData.location,
      };
      isValid = validateSteps(currentStep, params, setErrors);
    } else if (currentStep === 2) {
      params = {
        selectedCandidates: selectedCandidates,
        selectedSkills: interviewDetailsData.skills,
        InterviewPreviousExperience:
          interviewDetailsData.previousInterviewExperience,
        expertiseLevel: interviewDetailsData.expertiseLevel_ConductingInterviews,
        formData2: interviewDetailsData,
      };
      isValid = validateSteps(currentStep, params, setErrors);
    } else if (currentStep === 3) {
      params = {
        times: times,
        formData3: availabilityDetailsData,
        selectedOption: availabilityDetailsData.preferredDuration,
      };
      isValid = validateSteps(currentStep, params, setErrors);
    }

    if (!isValid) {
      console.log("Validation failed. Errors:", errors);
      return;
    }

    setCompleted((prev) => {
      const updated = [...prev];
      updated[currentStep] = true;
      return updated;
    });

    // For non-freelancer or limited steps profile (EXCLUDING internal interviewers), save at step 1
    if (
      (!Freelancer && currentStep === 1 && !isInternalInterviewer) ||
      (showLimitedSteps && currentStep === 1 && !isInternalInterviewer)
    ) {
      await handleSubmit();
      return;
    }

    // For freelancer/internal interviewer, save at last step
    if ((Freelancer || isInternalInterviewer) && currentStep === 3) {
      await handleSubmit();
    } else {
      const nextStep = Math.min(currentStep + 1, showLimitedSteps ? 1 : 3);
      setCurrentStep(nextStep);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
  
    const userData = {
      firstName: basicDetailsData.firstName,
      lastName: basicDetailsData.lastName,
      profileId: basicDetailsData.profileId,
      isFreelancer: isInternalInterviewer ? false : Freelancer,//when user is coming as organization user then they have fleelancer false
      email: basicDetailsData.email,
      isProfileCompleted: true,
    };
  
    const contactData = {
      ...basicDetailsData,
      ...additionalDetailsData,
      ...(isInternalInterviewer || Freelancer ? interviewDetailsData : {}),
      LetUsKnowYourProfession: profession,
      // Add preferredDuration and timeZone to contactData
      preferredDuration: availabilityDetailsData.preferredDuration,
      timeZone: availabilityDetailsData.timeZone,
    };
  
    const availabilityData = (isInternalInterviewer || Freelancer)
      ? Object.keys(availabilityDetailsData.availability || times)
          .map((day) => ({
            day,
            timeSlots: availabilityDetailsData.availability[day]
              .filter((slot) => slot.startTime && slot.endTime && slot.startTime !== 'unavailable')
              .map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
              })),
          }))
          .filter((dayData) => dayData.timeSlots.length > 0)
      : [];
  
    let isProfileCompleteData = {};
    if (isProfileComplete) {
      isProfileCompleteData = {
        isProfileComplete: true,
        ownerId: contactDataFromOrg.ownerId,
        contactId: contactDataFromOrg._id,
        isInternalInterviewer,
      };
    }
  
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/Individual/Signup`, {
        userData,
        contactData,
        availabilityData,
        Freelancer,
        isProfileCompleteData,
      });
  
      // Show success toast based on create/update
      toast.success(
        response.data.isUpdate 
          ? "Profile updated successfully!" 
          : "Profile created successfully!",
        { autoClose: 5000 }
      );
  
      const { contactId, token } = response.data;
  
      // Handle image upload
      if (file) {
        const imageData = new FormData();
        imageData.append('image', file);
        imageData.append('type', 'contact');
        imageData.append('id', contactId);
        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else if (linkedInData?.pictureUrl && !filePreview) {
        const response = await fetch(linkedInData.pictureUrl);
        const blob = await response.blob();
        const imageFile = new File([blob], 'linkedin-profile.jpg', { type: 'image/jpeg' });
        const imageData = new FormData();
        imageData.append('image', imageFile);
        imageData.append('type', 'contact');
        imageData.append('id', contactId);
        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
  
      if (!token) {
        console.error("No token received from server");
        toast.error("Failed to authenticate. Please try again.", { autoClose: 5000 });
        setLoading(false);
        return;
      }

      // Store JWT in cookies
      setAuthCookies(token);
  
      // Send welcome email
      try {
        await axios.post(`${config.REACT_APP_API_URL}/emails/send-signup-email`, {
          email: userData.email,
          tenantId: response.data.tenantId,
          ownerId: response.data.ownerId,
          lastName: userData.lastName,
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't show error toast for email failure
      }
  
      setLoading(false);
      navigate('/subscription-plans');
    } catch (error) {
      console.error('Submission failed:', error);
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to submit form. Please try again.",
        { autoClose: 5000 }
      );
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 0) {
      navigate('/select-profession');
    } else {
      setCurrentStep((prevStep) => {
        const previousStep = prevStep - 1;
        return previousStep >= 0 ? previousStep : 0;
      });
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <TailSpin color="#ffffff" height={50} width={50} />
            <span className="mt-2 text-white text-lg font-semibold">Processing...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-slate-50 min-h-screen py-6 px-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-2xl font-bold text-gray-900 mb-4">
              Create Profile
            </p>
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 sm:p-8">
                <StepIndicator
                  currentStep={currentStep}
                  showLimitedSteps={showLimitedSteps}
                  isInternalInterviewer={isInternalInterviewer}
                  completed={completed}
                />

                {currentStep === 0 && (
                  <BasicDetails
                    basicDetailsData={basicDetailsData}
                    setBasicDetailsData={setBasicDetailsData}
                    errors={errors}
                    setErrors={setErrors}
                    file={file}
                    setFile={setFile}
                    filePreview={filePreview}
                    setFilePreview={setFilePreview}
                    linkedInData={linkedInData}
                  />
                )}

                {currentStep === 1 && (
                  <AdditionalDetails
                    errors={errors}
                    setErrors={setErrors}
                    additionalDetailsData={additionalDetailsData}
                    setAdditionalDetailsData={setAdditionalDetailsData}
                  />
                )}

                {(Freelancer || isInternalInterviewer) && !showLimitedSteps && (
                  <>
                    {currentStep === 2 && (
                      <InterviewDetails
                        errors={errors}
                        setErrors={setErrors}
                        selectedTechnologyies={selectedCandidates}
                        setSelectedTechnologyies={setSelectedCandidates}
                        interviewDetailsData={interviewDetailsData}
                        setInterviewDetailsData={setInterviewDetailsData}
                        selectedSkills={selectedSkills}
                        setSelectedSkills={setSelectedSkills}
                        previousInterviewExperience={previousInterviewExperience}
                        setPreviousInterviewExperience={setPreviousInterviewExperience}
                        isMockInterviewSelected={isMockInterviewSelected}
                        setIsMockInterviewSelected={setIsMockInterviewSelected}
                      />
                    )}

                    {currentStep === 3 && (
                      <AvailabilityDetails
                        selectedTimezone={selectedTimezone}
                        setSelectedTimezone={setSelectedTimezone}
                        times={times}
                        setTimes={setTimes}
                        availabilityDetailsData={availabilityDetailsData}
                        setAvailabilityDetailsData={setAvailabilityDetailsData}
                        errors={errors}
                        setErrors={setErrors}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <FooterButtons
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              currentStep={currentStep}
              isFreelancer={Freelancer || isInternalInterviewer}
              isProfileComplete={isProfileComplete}
              roleName={roleName}
              showLimitedSteps={showLimitedSteps}
              isInternalInterviewer={isInternalInterviewer}
              isSubmitting={loading}
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default MultiStepForm;