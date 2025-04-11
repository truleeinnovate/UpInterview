import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import { validateSteps } from '../../../utils/LoginValidation.js';
import { TailSpin } from "react-loader-spinner";
import StepIndicator from "./StepIndicator.jsx"
import BasicDetails from './BasicDetails.jsx'
import AdditionalDetails from './AdditionalDetails.jsx';
import InterviewDetails from './InterviewDetails.jsx'
import AvailabilityDetails from './AvailabilityDetails.jsx'
import { config } from '../../../config.js';

const FooterButtons = ({ onNext, onPrev, currentStep, isFreelancer }) => {
  return (
    <div className="flex justify-between space-x-3 mt-4 mb-4 sm:text-sm">
      <button
        type="button"
        onClick={onPrev}
        className="border border-custom-blue rounded px-6 sm:px-3 py-1 text-custom-blue"
      >
        Prev
      </button>
      <button
        onClick={onNext}
        className="px-6 sm:px-3 py-1 bg-custom-blue text-white rounded"
        type="button"
      >
        {(!isFreelancer && currentStep === 1) || (isFreelancer && currentStep === 3) ? "Save" : "Next"}
      </button>
    </div>
  );
};

const MultiStepForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { Freelancer, profession, linkedInData } = location.state || {};
  const [selectedTimezone, setSelectedTimezone] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const [times, setTimes] = useState({
    Sun: [{ startTime: null, endTime: null }],
    Mon: [{ startTime: null, endTime: null }],
    Tue: [{ startTime: null, endTime: null }],
    Wed: [{ startTime: null, endTime: null }],
    Thu: [{ startTime: null, endTime: null }],
    Fri: [{ startTime: null, endTime: null }],
    Sat: [{ startTime: null, endTime: null }]
  });

  console.log('7. Profile4 received state:', location.state);
  console.log('8. LinkedIn data in Profile4:', linkedInData);

  const [basicDetailsData, setBasicDetailsData] = useState({
    Name: linkedInData ? `${linkedInData.firstName} ${linkedInData.lastName}` : "",
    UserName: "",
    Email: linkedInData?.email || "",
    CountryCode: "",
    Phone: "",
    LinkedinUrl: linkedInData?.profileUrl || "",
    portfolioUrl: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
  if (linkedInData) {
    setFilePreview(linkedInData.pictureUrl);
    setBasicDetailsData(prev => ({
      ...prev,
      Name: `${linkedInData.firstName} ${linkedInData.lastName}`,
      Email: linkedInData.email,
      LinkedinUrl: linkedInData.profileUrl
    }));
  }
}, [linkedInData]);

  const [additionalDetailsData, setAdditionalDetailsData] = useState({
    CurrentRole: "",
    industry: "",
    YearsOfExperience: "",
    location: "",
    CoverLetterdescription: "",
  });

  const [interviewDetailsData, setInterviewDetailsData] = useState({
    Skills: [],
    Technology: [],
    PreviousExperienceConductingInterviews: "",
    PreviousExperienceConductingInterviewsYears: "",
    ExpertiseLevel_ConductingInterviews: "",
    hourlyRate: "",
    InterviewFormatWeOffer: [],
    ExpectedRatePerMockInterviewMin: "",
    ExpectedRatePerMockInterviewMax: "",
    NoShowPolicy: "",
    bio: "",
    professionalTitle: "",
  });

  const [availabilityDetailsData, setAvailabilityDetailsData] = useState({
    TimeZone: "",
    PreferredDuration: "",
    Availability: ""
  });

  const handleNextStep = async () => {
    let params = {};
    if (currentStep === 0) {
      params = { basicDetailsData };
    } else if (currentStep === 1) {
      params = { additionalDetailsData };
    } else if (currentStep === 2) {
      params = { interviewDetailsData };
    } else if (currentStep === 3) {
      params = { availabilityDetailsData };
    }

    const isValid = validateSteps(currentStep, params, setErrors);

    if (!isValid) {
      console.log("Validation failed. Errors:", errors);
      return;
    }

    if (!Freelancer && currentStep === 1) {
      console.log('Submitting from step 1 (non-freelancer)');
      await handleSubmit();
      return;
    }

    if (currentStep === 3) {
      await handleSubmit();
    } else {
      setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
    }
  };

  console.log('config.REACT_APP_API_URL from individual 4::::', config.REACT_APP_API_URL);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
  
    console.log("🚀 Starting form submission...");
  
    const userData = {
      Name: basicDetailsData.Name,
      UserName: basicDetailsData.UserName,
      isFreelancer: Freelancer,
      Email: basicDetailsData.Email,
    };
  
    console.log("🧾 User Data:", userData);
  
    const contactData = {
      ...basicDetailsData,
      ...additionalDetailsData,
      ...interviewDetailsData,
      LetUsKnowYourProfession: profession
    };

    console.log("📞 Contact Data:", contactData);

    const availabilityData = Object.keys(availabilityDetailsData.Availability || times)
      .map((day) => ({
        day,
        timeSlots: availabilityDetailsData.Availability[day]
          .filter((slot) => slot.startTime && slot.endTime && slot.startTime !== "unavailable")
          .map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
      }))
      .filter((dayData) => dayData.timeSlots.length > 0);
  
    console.log("📅 Availability Data:", availabilityData);

    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/Individual/Signup`, {
        userData,
        contactData,
        availabilityData,
        Freelancer,
      });
  
      console.log("✅ Signup Response:", response.data);
  
      const contactId = response.data.contactId;
  
      // Handle image upload (manual or LinkedIn)
      if (file) {
        console.log("📸 Uploading manual image...");
        const imageData = new FormData();
        imageData.append("image", file);
        imageData.append("type", "contact");
        imageData.append("id", contactId);
  
        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("✅ Manual image uploaded");
      } else if (linkedInData?.pictureUrl && !filePreview) {
        console.log("🔗 Fetching LinkedIn image...");
        const response = await fetch(linkedInData.pictureUrl);
        const blob = await response.blob();
        const imageFile = new File([blob], "linkedin-profile.jpg", { type: "image/jpeg" });
        const imageData = new FormData();
        imageData.append("image", imageFile);
        imageData.append("type", "contact");
        imageData.append("id", contactId);
  
        await axios.post(`${config.REACT_APP_API_URL}/upload`, imageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("✅ LinkedIn image uploaded");
      }
  
      // Set cookies and navigate
      Cookies.set("userId", response.data.userId, { expires: 7 });
      if (Cookies.get("organizationId")) {
        Cookies.remove("organizationId");
      }
  
      console.log("🎉 Redirecting to subscription-plans");
      setLoading(false);
      navigate("/subscription-plans");
    } catch (error) {
      console.error("❌ Error saving data:", error.response?.data || error.message);
      setLoading(false);
    }
  };  

  const handlePrevStep = () => {
    if (currentStep === 0) {
      navigate('/profile3');
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
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 sm:p-8">

                <h1 className="text-3xl font-bold text-center text-gray-900 mb-7">
                  {currentStep === 0 && 'Basic Details'}
                  {currentStep === 1 && 'Additional Details'}
                  {currentStep === 2 && 'Interview Details'}
                  {currentStep === 3 && 'Availability'}
                </h1>

                <StepIndicator currentStep={currentStep} />

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

                {Freelancer && (
                  <>
                    {currentStep === 2 && (
                      <InterviewDetails
                        errors={errors}
                        setErrors={setErrors}
                        selectedTechnologyies={selectedCandidates}
                        setSelectedTechnologyies={setSelectedCandidates}
                        interviewDetailsData={interviewDetailsData}
                        setInterviewDetailsData={setInterviewDetailsData}
                      />
                    )}
                  </>
                )}

                {Freelancer && (
                  <>
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

            {currentStep <= 3 && (
              <FooterButtons
                onNext={handleNextStep}
                onPrev={handlePrevStep}
                currentStep={currentStep}
                isFreelancer={Freelancer}
              />
            )}

          </div>
        </div>
      </form>
    </>
  );
};

export default MultiStepForm;