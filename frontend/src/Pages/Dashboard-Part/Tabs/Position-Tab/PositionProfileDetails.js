import React, { useEffect, useState } from "react";
import { useCustomContext } from "../../../../Context/Contextfetch.js";

const PositionProfileDetails = ({ positionId, onCloseprofile }) => {
  //ashraf
  const { positions } = useCustomContext();
  const position = positions.find((data) => data._id === positionId);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    minexperience: "",
    maxexperience: "",
    jobDescription: "",
    additionalNotes: "",
    skills: [],
    rounds: [],
    template: "",
  });

  console.log(formData, "formData")

  useEffect(() => {
    if (position) {
      setFormData({
        title: position.title || "",
        companyName: position.companyname || "",
        minexperience: position.minexperience || "",
        maxexperience: position.maxexperience || "",
        jobDescription: position.jobDescription || "",
        additionalNotes: position.additionalNotes || "",
        skills: position.skills || [],
        rounds: position.rounds || [],
        template: position.template || "",
      });
    }
  }, [position]);

  const handleNext = () => {
    if (currentStep < formData.rounds.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStageIndicator = () => {
    return (
      <>
        <div className="flex items-center justify-center mb-4 mt-1 w-full overflow-x-auto py-2">
          <div className="flex items-center min-w-fit px-2">
            <div className="flex items-center">
              <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${currentStep === 0 ? "bg-orange-400 text-white" : "bg-custom-blue text-white"}`}>
                Basic Details
              </span>
            </div>

            <div className="flex items-center">
              <div className="h-[1px] w-10 bg-teal-200"></div>
            </div>

            {currentStep === 0 && (
              <>
                <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-teal-50 text-teal-600 border border-teal-100 sm:text-[12px] md:text-[14px]">
                  Rounds
                </span>
              </>
            )}

            {formData.rounds.slice(0, currentStep).map((round, index, array) => (
              <React.Fragment key={index}>
                <span
                  className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium sm:text-[12px] md:text-[14px] ${currentStep === index + 1 ? "bg-orange-400 text-white" : "bg-custom-blue text-white"
                    }`}
                >
                  Round {index + 1}
                </span>

                {formData.rounds.length > 1 && index !== array.length - 1 && (
                  <div className="h-[1px] w-10 bg-teal-200"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </>
    );
  };


  return (
    <>
      <div className="overflow-auto mx-10">
        <h2
          className="text-xl font-semibold px-[13%] mt-3 sm:mt-5 sm:mb-2 sm:text-lg sm:px-[5%] md:mt-6 md:mb-2 md:text-xl md:px-[5%]"
          onClick={onCloseprofile}
        >
          <span className="text-[#217989] font-semibold">Positions</span> / {formData.title}
        </h2>
        {renderStageIndicator()}
        <div className="px-[13%] sm:px-[5%] md:px-[5%]">
          <div className="bg-white rounded-lg shadow-md border px-6 py-4">
            {currentStep === 0 ? (
              <>
                <h3 className="font-semibold mb-5">Position Details:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-1 w-full mb-5">
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Title
                    </p>
                    <p className="text-sm">
                      {formData.title}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Company Name
                    </p>
                    <p className="text-sm">
                      {formData.companyName}
                    </p>
                  </div>
                </div>
                <p className='text-gray-400 text-sm mb-2'>Experience</p>
                <div className="grid grid-cols-2 sm:grid-cols-1 w-1/2 mb-5">
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Min
                    </p>
                    <p className="text-sm">
                      {formData.minexperience}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Max
                    </p>
                    <p className="text-sm">
                      {formData.maxexperience}
                    </p>
                  </div>
                </div>

                <div className="w-full mb-5">
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Job Description
                    </p>
                    <p className="text-sm">
                      {formData.jobDescription}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="font-semibold mb-3">Skills</p>
                  <p className="w-[75%]">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill, index) => (
                        <div key={index} className="border p-2 rounded-lg flex justify-between mb-3 px-14">
                          <p className="w-20 text-center">{skill.skill}</p>
                          <p className="w-20 text-center">{skill.expertise}</p>
                          <p className="w-20 text-center">{skill.experience}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills available</p>
                    )}
                  </p>
                </div>
                <div className="mb-2">
                  <p className='text-gray-400 text-sm mb-2'>Additional Notes</p>
                  <p className="text-sm">
                    {formData.additionalNotes}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold mb-5">Position Details:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-1 w-full mb-5">
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Round Title
                    </p>
                    <p className="text-sm">
                      {formData.rounds[currentStep - 1].roundName}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Interview Type
                    </p>
                    <p className="text-sm">
                      {formData.rounds[currentStep - 1].interviewType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-1 w-full mb-5">
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Interview Mode
                    </p>
                    <p className="text-sm">
                      {formData.rounds[currentStep - 1].interviewMode}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-400 text-sm'>
                      Duration
                    </p>
                    <p className="text-sm">
                      {formData.rounds[currentStep - 1].duration}
                    </p>
                  </div>
                </div>
                <div>
                <p className='text-gray-400 text-sm'>
                    Instructions
                  </p>
                  <p className="text-sm">
                    {formData.rounds[currentStep - 1].instructions}
                  </p>
                </div>

              </>
            )}
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 space-x-3 mb-5">
            {currentStep > 0 && (
              <button
                type="button"
                className="px-3 py-1 border rounded border-custom-blue"
                onClick={handlePrev}
              >
                Previous
              </button>
            )}
            <div></div>
            {currentStep < formData.rounds.length ? (
              <button
                type="button"
                className="px-3 py-1 border bg-custom-blue text-white rounded font-medium"
                onClick={handleNext}
              >
                Next
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionProfileDetails;