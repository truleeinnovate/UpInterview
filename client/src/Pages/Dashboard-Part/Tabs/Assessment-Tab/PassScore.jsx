import React, { useState } from "react";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { validatePassScoreData } from "../../../../utils/passScoreValidation";

const PassScore = ({ setAddedSections,addedSections,sections,setFormData,formData,passScoreType, questionsBySection, onClose, onSave }) => {
  const [selectedScore, setSelectedScore] = useState(formData.passScoreType);
  const [selectedPassScoreBy, setSelectedPassScoreBy] = useState(formData.passScoreBy);
  const [passScore, setPassScore] = useState("");
  const [showDropdownScore, setShowDropdownScore] = useState(false);
  const [showDropdownPassScoreBy, setShowDropdownPassScoreBy] = useState(false);
  const [passScores, setPassScores] = useState({});
  const [errors, setErrors] = useState({});

  const score = ["Percentage", "Number"];
  const passScoreBy = ["Overall", "Each Section"];

  const handleClose = () => {
    onClose();
  };

  const toggleDropdownScore = () => {
    setShowDropdownScore(!showDropdownScore);
  };

  const toggleDropdownPassScoreBy = () => {
    setShowDropdownPassScoreBy(!showDropdownPassScoreBy);
  };

  const handleScoreSelect = (score) => {
    setSelectedScore(score);
    setFormData(prev=>({
      ...prev,
      passScoreType:score
    }))
    setShowDropdownScore(false);

    // Clear the error for selectedScore
    setErrors((prevErrors) => {
      const { selectedScore, ...rest } = prevErrors;
      return rest;
    });
  };

  const handlePassScoreBySelect = (score) => {
    setSelectedPassScoreBy(score);
    setShowDropdownPassScoreBy(false);
    setFormData(prev=>({
      ...prev,
      passScoreBy:score,
      ...(score==="Each Section" && {passScore:""})
    }))

    // Clear the error for selectedPassScoreBy
    setErrors((prevErrors) => {
      const { selectedPassScoreBy, ...rest } = prevErrors;
      return rest;
    });
  };

  const handlePassScoreChange = (sectionName, value) => {
    setPassScores((prev) => ({
      ...prev,
      [sectionName]: value,
    }));

    // Clear the error for the specific section
    setErrors((prevErrors) => {
      const { [sectionName]: _, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = validatePassScoreData(
      selectedScore,
      selectedPassScoreBy,
      passScore,
      passScores,
      sections
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedPassScoreBy === "Overall") {
      onSave({ overall: passScore });
    } else {
      onSave(passScores);
    }
    handleClose();
  };

  return (
    <>
      <div className="fixed top-0 w-full bg-white border-b">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-bold">Pass Score</h2>
          <button
            type="button"
            onClick={handleClose}
            className="focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="fixed top-16 bottom-16 overflow-auto p-4 w-full text-sm">
        <div>
          <form onSubmit={handleSave}>
            <div className="relative flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="Passscore"
                  className="block mb-2 text-sm font-medium text-gray-900 w-36"
                >
                  Pass Score Type<span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    id="duration"
                    className="border-b focus:outline-none w-[250px]"
                    value={selectedScore}
                    onClick={toggleDropdownScore}
                    readOnly
                  />
                  <MdArrowDropDown
                    className="absolute text-gray-500 cursor-pointer top-1 right-48"
                    onClick={toggleDropdownScore}
                  />
                </div>
                {showDropdownScore && (
                  <div className="absolute z-50 mb-5 w-[250px] rounded-sm border bg-white shadow-lg">
                    {score.map((score) => (
                      <div
                        key={score}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleScoreSelect(score)}
                      >
                        {score}
                      </div>
                    ))}
                  </div>
                )}
                {errors.selectedScore && (
                  <p className="text-red-500 text-sm">{errors.selectedScore}</p>
                )}
              </div>
            </div>

            <div className="relative flex gap-5 mb-5">
              <div>
                <label
                  htmlFor="Passscore by"
                  className="block mb-2 text-sm font-medium text-gray-900 w-36"
                >
                  Pass Score By<span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    name="passscore by"
                    type="text"
                    id="passscore by"
                    className="border-b focus:outline-none w-[250px]"
                    value={selectedPassScoreBy}
                    onClick={toggleDropdownPassScoreBy}
                    readOnly
                  />
                  <MdArrowDropDown className="absolute text-gray-500 cursor-pointer top-1 right-48" onClick={toggleDropdownPassScoreBy} />
                </div>
                {showDropdownPassScoreBy && (
                  <div className="absolute z-50 mb-5 w-[250px] rounded-sm border bg-white shadow-lg">
                    {passScoreBy.map((passScoreBy) => (
                      <div
                        key={passScoreBy}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => handlePassScoreBySelect(passScoreBy)}
                      >
                        {passScoreBy}
                      </div>
                    ))}
                  </div>
                )}
                {errors.selectedPassScoreBy && (
                  <p className="text-red-500 text-sm">{errors.selectedPassScoreBy}</p>
                )}
              </div>
            </div>

            {selectedPassScoreBy === "Overall" && (
              <div className="relative flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="passScore"
                    className="block mb-2 text-sm font-medium text-gray-900 w-36"
                  >
                    Pass Score <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative flex-grow">
                  <input
                    type="number"
                    id="passScore"
                    className="border-b focus:outline-none w-[250px]"
                    autoComplete="off"
                    value={passScore}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value >= 1 && value <= 100) {
                        setPassScore(value);
                        setFormData(prev=>({...prev,passScore:value}))
                      }
                    }}
                    required
                  />
                  {selectedScore === "Percentage" ? (
                    <span className="absolute top text-gray-500 cursor-pointer right-52">%</span>
                  ) : null}
                  {errors.passScore && (
                    <p className="text-red-500 text-sm">{errors.passScore}</p>
                  )}
                </div>
              </div>
            )}

            {selectedPassScoreBy === "Each Section" && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2">Section Name</th>
                      <th className="border border-gray-300 p-2">No. of Questions</th>
                      <th className="border border-gray-300 p-2">Total Score</th>
                      <th className="border border-gray-300 p-2">Pass Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {sections.map((sectionName) => { */}
                    {addedSections.map((section,index) => {
                    // {addedSections.map((sectionName) => {
                      // const questions = questionsBySection[sectionName] || [];
                      const {SectionName:sectionName,Questions:questions}=section
                      // const questions = sectionName.Questions
                      const totalScore = questions.reduce((acc, question) => acc + (Number(question.Score) || 0), 0);
                      return (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{sectionName}</td>
                          <td className="border border-gray-300 p-2">{questions.length}</td>
                          <td className="border border-gray-300 p-2">{totalScore}</td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="number"
                              value={passScores[sectionName] || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 1 && value <= 100) {
                                  handlePassScoreChange(sectionName, value);
                                  setAddedSections(prev=>
                                     prev.map((each)=>each.SectionName===sectionName ? {...each,passScore:+value}:each)
                                  )
                                }
                              }}
                              className="border-b focus:outline-none w-[60px] pr-1"
                            />
                            {selectedScore === "Percentage" && <span className="text-gray-500">%</span>}
                            {errors[sectionName] && (
                              <p className="text-red-500 text-sm">{errors[sectionName]}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="SaveAndScheduleButtons flex justify-end">
              <button type="submit" className="footer-button" >
                Save
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};
export default PassScore;
