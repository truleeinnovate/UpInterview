// v1.0.0  -  Ashraf  - forwarderror solved
// v1.0.1  -  Ashok   - Improved responsiveness and added common code to popup

import React, { useState, useEffect, useMemo, useRef, forwardRef } from "react";
import { validatePassScoreData } from "../../../../../utils/passScoreValidation";
// Common Form Field Components
import DropdownWithSearchField from "../../../../../Components/FormFields/DropdownWithSearchField.jsx";
import InputField from "../../../../../Components/FormFields/InputField.jsx";
// <---------------------- v1.0.0
// v1.0.1 <-----------------------------------------------------------------------------------------
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
// v1.0.1 ----------------------------------------------------------------------------------------->

const PassScore = forwardRef(
  (
    {
      // ---------------------- v1.0.0 >
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
    },
    ref
  ) => {
    const [selectedScore, setSelectedScore] = useState(
      formData.passScoreType || "Number"
    );
    const [selectedPassScoreBy, setSelectedPassScoreBy] = useState(
      formData.passScoreBy || "Overall"
    );
    const [localTotalScore, setLocalTotalScore] = useState(
      initialTotalScore || ""
    );
    const [localPassScore, setLocalPassScore] = useState(
      initialPassScore || ""
    );
    const [localTotalScores, setLocalTotalScores] = useState(
      initialTotalScores || {}
    );
    const [localPassScores, setLocalPassScores] = useState(
      initialPassScores || {}
    );
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
    }, [
      selectedPassScoreBy,
      memoizedAddedSections,
      initialTotalScore,
      initialPassScore,
    ]);

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
    }, [
      selectedScore,
      selectedPassScoreBy,
      localPassScore,
      localTotalScore,
      localPassScores,
      localTotalScores,
      memoizedAddedSections,
      touched,
    ]);

    const handleClose = () => {
      onClose();
    };

    const handleScoreSelect = (score) => {
      setSelectedScore(score);
      setTouched((prev) => ({ ...prev, selectedScore: true }));
      setErrors((prev) => {
        const { selectedScore, ...rest } = prev;
        return rest;
      });
    };

    const handlePassScoreBySelect = (score) => {
      setSelectedPassScoreBy(score);
      setTouched((prev) => ({ ...prev, selectedPassScoreBy: true }));
      setErrors((prev) => {
        const { selectedPassScoreBy, ...rest } = prev;
        return rest;
      });
    };

    const handlePassScoreChange = (sectionName, value) => {
      const maxPassScore =
        selectedScore === "Percentage"
          ? 100
          : Number(localTotalScores[sectionName]) || Infinity;
      if (
        value === "" ||
        (Number(value) >= 1 && Number(value) <= maxPassScore)
      ) {
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
        setTouched((prev) => ({
          ...prev,
          [`totalScore_${sectionName}`]: true,
        }));
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
          (selectedScore === "Percentage"
            ? Number(value) <= 100
            : Number(value) <= (Number(localTotalScore) || Infinity)))
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
            [`totalScore_${section.SectionName}`]:
              selectedPassScoreBy === "Each Section",
            [`passScore_${section.SectionName}`]:
              selectedPassScoreBy === "Each Section",
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
        const questionScore = localTotalScore
          ? Number(localTotalScore) / totalQuestions
          : 0;

        updatedSections = memoizedAddedSections.map((section) => ({
          ...section,
          Questions: section.Questions.map((q) => ({
            ...q,
            Score: questionScore,
          })),
          totalScore: localTotalScore,
          passScore: localPassScore,
        }));
      } else {
        updatedSections = memoizedAddedSections.map((section) => {
          const sectionQuestions = section.Questions.length;
          const sectionTotalScore =
            Number(localTotalScores[section.SectionName]) || 0;
          const sectionPassScore =
            Number(localPassScores[section.SectionName]) || 0;
          const questionScore = sectionTotalScore
            ? sectionTotalScore / sectionQuestions
            : 0;

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
      // v1.0.1 <--------------------------------------------------------------------------
      <SidebarPopup title="Pass Score" onClose={handleClose}>
        <div className="flex flex-col justify-between h-full bg-white">
          {/* Content */}
          <div className="flex-1 sm:p-2 p-6">
            <div className="mx-auto">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Pass Score Type */}
                <div className="flex sm:flex-col items-start sm:gap-3 gap-6">
                  <div className="w-40 pt-2">
                    <label className="text-sm font-medium text-gray-700">
                      Pass Score Type
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <div className="flex-1 sm:w-full">
                    <DropdownWithSearchField
                      ref={scoreInputRef}
                      name="Passscore"
                      value={selectedScore}
                      options={score.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                      onChange={(e) => {
                        handleScoreSelect(e.target.value);
                        setTouched((prev) => ({
                          ...prev,
                          selectedScore: true,
                        }));
                      }}
                      error={touched.selectedScore && errors.selectedScore}
                      required
                    />
                  </div>
                </div>

                {/* Pass Score By */}
                <div className="flex sm:flex-col items-start sm:gap-3 gap-6">
                  <div className="w-40 pt-2">
                    <label className="text-sm font-medium text-gray-700">
                      Pass Score By<span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <div className="flex-1 sm:w-full">
                    <DropdownWithSearchField
                      ref={passScoreByInputRef}
                      name="Passscoreby"
                      value={selectedPassScoreBy}
                      options={passScoreBy.map((p) => ({
                        value: p,
                        label: p,
                      }))}
                      onChange={(e) => {
                        handlePassScoreBySelect(e.target.value);
                        setTouched((prev) => ({
                          ...prev,
                          selectedPassScoreBy: true,
                        }));
                      }}
                      error={
                        touched.selectedPassScoreBy &&
                        errors.selectedPassScoreBy
                      }
                      required
                    />
                  </div>
                </div>

                {/* Overall Pass Score and Total Score */}
                {selectedPassScoreBy === "Overall" && (
                  <>
                    <div className="flex sm:flex-col items-start sm:gap-3 gap-6">
                      <div className="w-40 pt-2">
                        <label className="text-sm font-medium text-gray-700">
                          Total Score{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                      <div className="flex-1 sm:w-full">
                        <InputField
                          type="number"
                          id="totalScore"
                          name="totalScore"
                          placeholder="Eg: 100"
                          value={localTotalScore}
                          onChange={(e) =>
                            handleOverallTotalScoreChange(e.target.value)
                          }
                          error={touched.totalScore && errors.totalScore}
                          required
                          min={1}
                          suffix={selectedScore === "Percentage" ? "%" : ""}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-40 pt-2">
                        <label className="text-sm font-medium text-gray-700">
                          Pass Score{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                      </div>
                      <div className="flex-1">
                        <InputField
                          type="number"
                          id="passScore"
                          name="passScore"
                          placeholder="Eg: 85"
                          value={localPassScore}
                          onChange={(e) =>
                            handleOverallPassScoreChange(e.target.value)
                          }
                          error={touched.passScore && errors.passScore}
                          required
                          min={1}
                          max={
                            selectedScore === "Percentage"
                              ? 100
                              : Number(localTotalScore) || undefined
                          }
                          suffix={selectedScore === "Percentage" ? "%" : ""}
                        />
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No. of Questions
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pass Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {memoizedAddedSections.map((section, index) => {
                          const {
                            SectionName: sectionName,
                            Questions: questions,
                          } = section;
                          return (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {sectionName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {questions.length}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <div className="w-24">
                                  <InputField
                                    type="number"
                                    value={localTotalScores[sectionName] || ""}
                                    onChange={(e) =>
                                      handleTotalScoreChange(
                                        sectionName,
                                        e.target.value
                                      )
                                    }
                                    min={1}
                                    suffix={
                                      selectedScore === "Percentage" ? "%" : ""
                                    }
                                    error={
                                      touched[`totalScore_${sectionName}`] &&
                                      errors[sectionName]
                                    }
                                    compact
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <div className="w-24">
                                  <InputField
                                    type="number"
                                    value={localPassScores[sectionName] || ""}
                                    onChange={(e) =>
                                      handlePassScoreChange(
                                        sectionName,
                                        e.target.value
                                      )
                                    }
                                    min={1}
                                    max={
                                      selectedScore === "Percentage"
                                        ? 100
                                        : Number(
                                            localTotalScores[sectionName]
                                          ) || undefined
                                    }
                                    suffix={
                                      selectedScore === "Percentage" ? "%" : ""
                                    }
                                    error={
                                      touched[`passScore_${sectionName}`] &&
                                      errors[sectionName]
                                    }
                                    compact
                                  />
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
          <div className="bg-white p-4 mb-10">
            <div className="mx-auto flex justify-end">
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
      </SidebarPopup>
      // v1.0.1 -------------------------------------------------------------------------->
    );
  }
);

export default PassScore;
