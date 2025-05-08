import React, { useState, useEffect, useMemo, useRef } from "react";
import { ReactComponent as MdArrowDropDown } from "../../../../../icons/MdArrowDropDown.svg";
import { validatePassScoreData } from "../../../../../utils/passScoreValidation";

const PassScore = ({
  setAddedSections,
  addedSections,
  setFormData,
  formData,
  onClose,
  onSave,
  totalScore: initialTotalScore,
  totalScores: initialTotalScores,
  passScores: initialPassScores,
  passScore: initialPassScore,
  setPassScores,
  setTotalScores,
  setTotalScore,
  setPassScore,
}) => {
  const [selectedScore, setSelectedScore] = useState(formData.passScoreType || "Number");
  const [selectedPassScoreBy, setSelectedPassScoreBy] = useState(formData.passScoreBy || "Overall");
  const [localTotalScore, setLocalTotalScore] = useState(initialTotalScore || "");
  const [localPassScore, setLocalPassScore] = useState(initialPassScore || "");
  const [localTotalScores, setLocalTotalScores] = useState(initialTotalScores || {});
  const [localPassScores, setLocalPassScores] = useState(initialPassScores || {});
  const [showDropdownScore, setShowDropdownScore] = useState(false);
  const [showDropdownPassScoreBy, setShowDropdownPassScoreBy] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const scoreInputRef = useRef(null);
  const passScoreByInputRef = useRef(null);

  const score = ["Percentage", "Number"];
  const passScoreBy = ["Overall", "Each Section"];

  const memoizedAddedSections = useMemo(() => addedSections, [addedSections]);

  // Initialize localTotalScores and localPassScores for "Each Section" mode
  useEffect(() => {
    if (selectedPassScoreBy === "Each Section") {
      const initialTotalScores = memoizedAddedSections.reduce(
        (acc, section) => ({
          ...acc,
          [section.SectionName]: section.totalScore || "",
        }),
        {}
      );
      const initialPassScores = memoizedAddedSections.reduce(
        (acc, section) => ({
          ...acc,
          [section.SectionName]: section.passScore || "",
        }),
        {}
      );
      setLocalTotalScores(initialTotalScores);
      setLocalPassScores(initialPassScores);
    } else {
      setLocalTotalScores({});
      setLocalPassScores({});
      setLocalTotalScore(initialTotalScore || "");
      setLocalPassScore(initialPassScore || "");
    }
  }, [selectedPassScoreBy, memoizedAddedSections, initialTotalScore, initialPassScore]);

  // Validate only when fields are touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validatePassScoreData(
        selectedScore,
        selectedPassScoreBy,
        localPassScore,
        localPassScores,
        memoizedAddedSections.map((s) => s.SectionName),
        localTotalScore,
        localTotalScores,
        memoizedAddedSections
      );
      setErrors(newErrors);
    }
  }, [selectedScore, selectedPassScoreBy, localPassScore, localTotalScore, localPassScores, localTotalScores, memoizedAddedSections, touched]);

  const handleClose = () => {
    onClose();
  };

  const toggleDropdownScore = () => {
    setShowDropdownScore(!showDropdownScore);
    setTouched((prev) => ({ ...prev, selectedScore: true }));
  };

  const toggleDropdownPassScoreBy = () => {
    setShowDropdownPassScoreBy(!showDropdownPassScoreBy);
    setTouched((prev) => ({ ...prev, selectedPassScoreBy: true }));
  };

  const handleScoreSelect = (score) => {
    setSelectedScore(score);
    setShowDropdownScore(false);
    setTouched((prev) => ({ ...prev, selectedScore: true }));
    setErrors((prev) => {
      const { selectedScore, ...rest } = prev;
      return rest;
    });
  };

  const handlePassScoreBySelect = (score) => {
    setSelectedPassScoreBy(score);
    setShowDropdownPassScoreBy(false);
    setTouched((prev) => ({ ...prev, selectedPassScoreBy: true }));
    setErrors((prev) => {
      const { selectedPassScoreBy, ...rest } = prev;
      return rest;
    });
  };

  const handlePassScoreChange = (sectionName, value) => {
    const maxPassScore = selectedScore === "Percentage" ? 100 : Number(localTotalScores[sectionName]) || Infinity;
    if (value === "" || (Number(value) >= 1 && Number(value) <= maxPassScore)) {
      setLocalPassScores((prev) => ({ ...prev, [sectionName]: value }));
      setTouched((prev) => ({ ...prev, [`passScore_${sectionName}`]: true }));
      setErrors((prev) => {
        const { [sectionName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTotalScoreChange = (sectionName, value) => {
    if (value === "" || Number(value) >= 1) {
      setLocalTotalScores((prev) => ({ ...prev, [sectionName]: value }));
      setTouched((prev) => ({ ...prev, [`totalScore_${sectionName}`]: true }));
      setErrors((prev) => {
        const { [sectionName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleOverallTotalScoreChange = (value) => {
    if (value === "" || Number(value) >= 1) {
      setLocalTotalScore(value);
      setTouched((prev) => ({ ...prev, totalScore: true }));
      setErrors((prev) => {
        const { totalScore, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleOverallPassScoreChange = (value) => {
    if (
      value === "" ||
      (Number(value) >= 1 &&
        (selectedScore === "Percentage" ? Number(value) <= 100 : Number(value) <= (Number(localTotalScore) || Infinity)))
    ) {
      setLocalPassScore(value);
      setTouched((prev) => ({ ...prev, passScore: true }));
      setErrors((prev) => {
        const { passScore, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTouched({
      selectedScore: true,
      selectedPassScoreBy: true,
      totalScore: selectedPassScoreBy === "Overall",
      passScore: selectedPassScoreBy === "Overall",
      ...memoizedAddedSections.reduce(
        (acc, section) => ({
          ...acc,
          [`totalScore_${section.SectionName}`]: selectedPassScoreBy === "Each Section",
          [`passScore_${section.SectionName}`]: selectedPassScoreBy === "Each Section",
        }),
        {}
      ),
    });

    const newErrors = validatePassScoreData(
      selectedScore,
      selectedPassScoreBy,
      localPassScore,
      localPassScores,
      memoizedAddedSections.map((s) => s.SectionName),
      localTotalScore,
      localTotalScores,
      memoizedAddedSections
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update parent state
    setFormData((prev) => ({
      ...prev,
      passScoreType: selectedScore,
      passScoreBy: selectedPassScoreBy,
      passScore: selectedPassScoreBy === "Overall" ? localPassScore : "",
      totalScore: selectedPassScoreBy === "Overall" ? localTotalScore : "",
    }));
    if (selectedPassScoreBy === "Overall") {
      setTotalScore(localTotalScore);
      setPassScore(localPassScore);
      setTotalScores({});
      setPassScores({});
    } else {
      setTotalScores(localTotalScores);
      setPassScores(localPassScores);
      setTotalScore("");
      setPassScore("");
    }

    // Update question scores in addedSections
    let updatedSections = [...memoizedAddedSections];
    if (selectedPassScoreBy === "Overall") {
      const totalQuestions = memoizedAddedSections.reduce(
        (acc, section) => acc + section.Questions.length,
        0
      );
      const questionScore = localTotalScore ? Number(localTotalScore) / totalQuestions : 0;

      updatedSections = memoizedAddedSections.map((section) => ({
        ...section,
        Questions: section.Questions.map((q) => ({ ...q, Score: questionScore })),
        totalScore: localTotalScore,
        passScore: localPassScore,
      }));
    } else {
      updatedSections = memoizedAddedSections.map((section) => {
        const sectionQuestions = section.Questions.length;
        const sectionTotalScore = Number(localTotalScores[section.SectionName]) || 0;
        const sectionPassScore = Number(localPassScores[section.SectionName]) || 0;
        const questionScore = sectionTotalScore ? sectionTotalScore / sectionQuestions : 0;

        return {
          ...section,
          totalScore: sectionTotalScore,
          passScore: sectionPassScore,
          Questions: section.Questions.map((q) => ({
            ...q,
            Score: sectionTotalScore ? questionScore : q.Score || 1,
          })),
        };
      });
    }

    setAddedSections(updatedSections);

    // Pass data to parent
    if (selectedPassScoreBy === "Overall") {
      onSave({
        overallPassScore: localPassScore,
        overallTotalScore: localTotalScore,
        passScoreType: selectedScore,
        passScoreBy: selectedPassScoreBy,
        sectionPassScores: {},
        sectionTotalScores: {},
      });
    } else {
      onSave({
        sectionPassScores: localPassScores,
        sectionTotalScores: localTotalScores,
        passScoreType: selectedScore,
        passScoreBy: selectedPassScoreBy,
        overallPassScore: "",
        overallTotalScore: "",
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 shadow-sm">
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

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Pass Score Type */}
            <div className="flex items-start gap-6">
              <label htmlFor="Passscore" className="w-40 text-sm font-medium text-gray-700 pt-2">
                Pass Score Type<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    id="Passscore"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedScore}
                    onClick={toggleDropdownScore}
                    readOnly
                    ref={scoreInputRef}
                  />
                  <MdArrowDropDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                    onClick={toggleDropdownScore}
                  />
                </div>
                {showDropdownScore && (
                  <div
                    className="absolute z-10 mt-1 rounded-md bg-white shadow-lg border border-gray-200"
                    style={{ width: scoreInputRef.current?.offsetWidth }}
                  >
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
                {touched.selectedScore && errors.selectedScore && (
                  <p className="mt-1 text-sm text-red-600">{errors.selectedScore}</p>
                )}
              </div>
            </div>

            {/* Pass Score By */}
            <div className="flex items-start gap-6">
              <label htmlFor="Passscoreby" className="w-40 text-sm font-medium text-gray-700 pt-2">
                Pass Score By<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex-1">
                <div className="relative">
                  <input
                    name="passscoreby"
                    type="text"
                    id="Passscoreby"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedPassScoreBy}
                    onClick={toggleDropdownPassScoreBy}
                    readOnly
                    ref={passScoreByInputRef}
                  />
                  <MdArrowDropDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer h-5 w-5"
                    onClick={toggleDropdownPassScoreBy}
                  />
                </div>
                {showDropdownPassScoreBy && (
                  <div
                    className="absolute z-10 mt-1 rounded-md bg-white shadow-lg border border-gray-200"
                    style={{ width: passScoreByInputRef.current?.offsetWidth }}
                  >
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
                {touched.selectedPassScoreBy && errors.selectedPassScoreBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.selectedPassScoreBy}</p>
                )}
              </div>
            </div>

            {/* Overall Pass Score and Total Score */}
            {selectedPassScoreBy === "Overall" && (
              <>
                <div className="flex items-start gap-6">
                  <label htmlFor="totalScore" className="w-40 text-sm font-medium text-gray-700 pt-2">
                    Total Score <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        id="totalScore"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={localTotalScore}
                        onChange={(e) => handleOverallTotalScoreChange(e.target.value)}
                        required
                        min="1"
                      />
                      {selectedScore === "Percentage" && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      )}
                    </div>
                    {touched.totalScore && errors.totalScore && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalScore}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <label htmlFor="passScore" className="w-40 text-sm font-medium text-gray-700 pt-2">
                    Pass Score <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex-1">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        id="passScore"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={localPassScore}
                        onChange={(e) => handleOverallPassScoreChange(e.target.value)}
                        required
                        min="1"
                        max={selectedScore === "Percentage" ? "100" : localTotalScore || undefined}
                      />
                      {selectedScore === "Percentage" && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      )}
                    </div>
                    {touched.passScore && errors.passScore && (
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
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  value={localTotalScores[sectionName] || ""}
                                  onChange={(e) => handleTotalScoreChange(sectionName, e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  min="1"
                                />
                                {selectedScore === "Percentage" && (
                                  <span className="ml-2 text-gray-500 text-sm">%</span>
                                )}
                              </div>
                              {touched[`totalScore_${sectionName}`] && errors[sectionName] && (
                                <p className="mt-1 text-xs text-red-600 max-w-[120px]">{errors[sectionName]}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  value={localPassScores[sectionName] || ""}
                                  onChange={(e) => handlePassScoreChange(sectionName, e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  min="1"
                                  max={selectedScore === "Percentage" ? "100" : localTotalScores[sectionName] || undefined}
                                />
                                {selectedScore === "Percentage" && (
                                  <span className="ml-2 text-gray-500 text-sm">%</span>
                                )}
                              </div>
                              {touched[`passScore_${sectionName}`] && errors[sectionName] && (
                                <p className="mt-1 text-xs text-red-600 max-w-[120px]">{errors[sectionName]}</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassScore;