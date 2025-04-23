import React, { useState, useEffect, useMemo } from "react";
import { ReactComponent as MdArrowDropDown } from "../../../../../icons/MdArrowDropDown.svg";
import { validatePassScoreData } from "../../../../../utils/passScoreValidation";

const PassScore = ({ setAddedSections, addedSections, setFormData, formData, onClose, onSave,totalScore,totalScores,passScores,passScore,setPassScores,setTotalScores,setTotalScore,setPassScore }) => {
  const [selectedScore, setSelectedScore] = useState(formData.passScoreType || "Number");
  const [selectedPassScoreBy, setSelectedPassScoreBy] = useState(formData.passScoreBy || "Overall");
  const [showDropdownScore, setShowDropdownScore] = useState(false);
  const [showDropdownPassScoreBy, setShowDropdownPassScoreBy] = useState(false);


  const [errors, setErrors] = useState({});

  const score = ["Percentage", "Number"];
  const passScoreBy = ["Overall", "Each Section"];

  const memoizedAddedSections = useMemo(() => addedSections, [addedSections]);

  useEffect(() => {
    calculateScores();
  }, [selectedScore, selectedPassScoreBy, passScore, totalScore, passScores, totalScores,setTotalScores,]);

  const calculateScores = () => {
    if (selectedPassScoreBy === "Overall" && totalScore) {
      const totalQuestions = memoizedAddedSections.reduce((acc, section) => acc + section.Questions.length, 0);
      const questionScore = Number(totalScore) / totalQuestions;

      if (questionScore < 1) {
        setErrors({ totalScore: "Total Score must be high enough to assign at least 1 point per question." });
        return;
      }

      setAddedSections(prev => {
        const newSections = prev.map(section => ({
          ...section,
          Questions: section.Questions.map(q => ({ ...q, Score: questionScore }))
        }));
        if (JSON.stringify(newSections) !== JSON.stringify(prev)) {
          return newSections;
        }
        return prev;
      });
      setFormData(prev => ({ ...prev, totalScore }));
    } else if (selectedPassScoreBy === "Each Section") {
      setAddedSections(prev => {
        const newSections = prev.map(section => {
          const sectionQuestions = section.Questions.length;
          const sectionPassScore = Number(passScores[section.SectionName]) || 0;
          const sectionTotalScore = Number(totalScores[section.SectionName]) || 0;
          const questionScore = sectionTotalScore ? sectionTotalScore / sectionQuestions : 0;

          if (sectionTotalScore && questionScore < 1) {
            setErrors({ [section.SectionName]: "Total Score must be high enough to assign at least 1 point per question." });
            return section;
          }

          return {
            ...section,
            totalScore: sectionTotalScore,
            passScore: sectionPassScore,
            Questions: section.Questions.map(q => ({
              ...q,
              Score: sectionTotalScore ? questionScore : q.Score || 1
            }))
          };
        });
        if (JSON.stringify(newSections) !== JSON.stringify(prev)) {
          return newSections;
        }
        return prev;
      });
    }
  };

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
    setFormData(prev => ({ ...prev, passScoreType: score }));
    setShowDropdownScore(false);
    setErrors(prev => { const { selectedScore, ...rest } = prev; return rest; });
  };

  const handlePassScoreBySelect = (score) => {
    setSelectedPassScoreBy(score);
    setShowDropdownPassScoreBy(false);
    setFormData(prev => ({
      ...prev,
      passScoreBy: score,
      ...(score === "Each Section" && { passScore: "", totalScore: "" })
    }));
    setErrors(prev => { const { selectedPassScoreBy, ...rest } = prev; return rest; });
    if (score === "Each Section") {
      setTotalScores(
        memoizedAddedSections.reduce((acc, section) => ({
          ...acc,
          [section.SectionName]: section.totalScore || ""
        }), {})
      );
      setPassScores(
        memoizedAddedSections.reduce((acc, section) => ({
          ...acc,
          [section.SectionName]: section.passScore || ""
        }), {})
      );
    }
  };

  const handlePassScoreChange = (sectionName, value) => {
    setPassScores(prev => ({ ...prev, [sectionName]: value }));
    setErrors(prev => { const { [sectionName]: _, ...rest } = prev; return rest; });
  };

  const handleTotalScoreChange = (sectionName, value) => {
    setTotalScores(prev => ({ ...prev, [sectionName]: value }));
    setErrors(prev => { const { [sectionName]: _, ...rest } = prev; return rest; });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = validatePassScoreData(
      selectedScore,
      selectedPassScoreBy,
      passScore,
      passScores,
      memoizedAddedSections.map(s => s.SectionName),
      totalScore,
      totalScores,
      memoizedAddedSections
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedPassScoreBy === "Overall") {
      onSave({
        overallPassScore: passScore,
        overallTotalScore: totalScore,
        passScoreType: selectedScore,
        passScoreBy: selectedPassScoreBy
      });
    } else {
      onSave({
        sectionPassScores: passScores,
        sectionTotalScores: totalScores,
        passScoreType: selectedScore,
        passScoreBy: selectedPassScoreBy
      });
    }
    handleClose();
  };

  return (
    <>
      <div className="fixed top-0 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-4 bg-custom-blue text-white">
          <h2 className="text-lg font-semibold">Pass Score</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="fixed top-16 bottom-16 overflow-auto p-6 w-full">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Pass Score Type */}
            <div className="flex items-center gap-6">
              <label htmlFor="Passscore" className="w-40 text-sm font-medium text-gray-700">
                Pass Score Type<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative flex-1">
                <div className="relative">
                  <input
                    type="text"
                    id="duration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedScore}
                    onClick={toggleDropdownScore}
                    readOnly
                  />
                  <MdArrowDropDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                    onClick={toggleDropdownScore}
                  />
                </div>
                {showDropdownScore && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
                    {score.map((score) => (
                      <div
                        key={score}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleScoreSelect(score)}
                      >
                        {score}
                      </div>
                    ))}
                  </div>
                )}
                {errors.selectedScore && (
                  <p className="mt-1 text-sm text-red-600">{errors.selectedScore}</p>
                )}
              </div>
            </div>

            {/* Pass Score By */}
            <div className="flex items-center gap-6">
              <label htmlFor="Passscore by" className="w-40 text-sm font-medium text-gray-700">
                Pass Score By<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative flex-1">
                <div className="relative">
                  <input
                    name="passscore by"
                    type="text"
                    id="passscore by"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedPassScoreBy}
                    onClick={toggleDropdownPassScoreBy}
                    readOnly
                  />
                  <MdArrowDropDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                    onClick={toggleDropdownPassScoreBy}
                  />
                </div>
                {showDropdownPassScoreBy && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
                    {passScoreBy.map((passScoreBy) => (
                      <div
                        key={passScoreBy}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handlePassScoreBySelect(passScoreBy)}
                      >
                        {passScoreBy}
                      </div>
                    ))}
                  </div>
                )}
                {errors.selectedPassScoreBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.selectedPassScoreBy}</p>
                )}
              </div>
            </div>

            {/* Overall Pass Score and Total Score */}
            {selectedPassScoreBy === "Overall" && (
              <>
                <div className="flex items-center gap-6">
                  <label htmlFor="totalScore" className="w-40 text-sm font-medium text-gray-700">
                    Total Score <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative flex-1">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        id="totalScore"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none no-spinner" // Added no-spinner class
                        value={totalScore}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value >= 1) {
                            setTotalScore(value);
                            setFormData((prev) => ({ ...prev, totalScore: value }));
                          }
                        }}
                        required
                        style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
                      />
                      {selectedScore === "Percentage" && (
                        <span className="absolute right-10 text-gray-500">%</span>
                      )}
                      <div className="absolute right-2 flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() => setTotalScore((prev) => (Number(prev) || 0) + 1)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTotalScore((prev) =>
                              Math.max(
                                memoizedAddedSections.reduce((acc, s) => acc + s.Questions.length, 0),
                                (Number(prev) || 0) - 1
                              )
                            )
                          }
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {errors.totalScore && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalScore}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label htmlFor="passScore" className="w-40 text-sm font-medium text-gray-700">
                    Pass Score <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative flex-1">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        id="passScore"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none no-spinner" // Added no-spinner class
                        value={passScore}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            value >= 1 &&
                            (selectedScore === "Percentage" ? value <= 100 : value <= (totalScore || Infinity))
                          ) {
                            setPassScore(value);
                            setFormData((prev) => ({ ...prev, passScore: value }));
                          }
                        }}
                        required
                        style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
                      />
                      {selectedScore === "Percentage" && (
                        <span className="absolute right-10 text-gray-500">%</span>
                      )}
                      <div className="absolute right-2 flex flex-col space-y-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPassScore((prev) =>
                              Math.min(selectedScore === "Percentage" ? 100 : totalScore, (Number(prev) || 0) + 1)
                            )
                          }
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassScore((prev) => Math.max(1, (Number(prev) || 0) - 1))}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {errors.passScore && (
                      <p className="mt-1 text-sm text-red-600">{errors.passScore}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Each Section Table */}
            {selectedPassScoreBy === "Each Section" && (
              <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Questions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memoizedAddedSections.map((section, index) => {
                      const { SectionName: sectionName, Questions: questions } = section;
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sectionName}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{questions.length}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={totalScores[sectionName] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || (Number(value) >= 1)) { // Allow empty input for flexibility
                                    handleTotalScoreChange(sectionName, value);
                                    setAddedSections(prev =>
                                      prev.map((each) => 
                                        each.SectionName === sectionName ? { ...each, totalScore: value === "" ? 0 : +value } : each
                                      )
                                    );
                                  }
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                              {selectedScore === "Percentage" && (
                                <span className="ml-2 text-gray-500 text-sm">%</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={passScores[sectionName] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const maxPassScore = selectedScore === "Percentage" ? 100 : Number(totalScores[sectionName]) || Infinity;
                                  if (value === "" || (Number(value) >= 1 && Number(value) <= maxPassScore)) {
                                    handlePassScoreChange(sectionName, value);
                                    setAddedSections(prev =>
                                      prev.map((each) => 
                                        each.SectionName === sectionName ? { ...each, passScore: value === "" ? 0 : +value } : each
                                      )
                                    );
                                  }
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                              {selectedScore === "Percentage" && (
                                <span className="ml-2 text-gray-500 text-sm">%</span>
                              )}
                            </div>
                            {errors[sectionName] && (
                              <p className="mt-1 text-xs text-red-600">{errors[sectionName]}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="fixed pt-6 bottom-2 right-3">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
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
