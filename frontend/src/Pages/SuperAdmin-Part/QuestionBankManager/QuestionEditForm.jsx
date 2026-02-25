// v2.0.0 - Ashok - Enhanced form with all editable fields (interview + assessment)

import React, { useState } from "react";
import { notify } from "../../../services/toastService";
import { useUpdateQuestionBankManager } from "../../../apiHooks/questionBankManager/useQuestionBankManager";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";

const QuestionEditForm = ({ question, type, onClose, onSuccess }) => {
  const impersonationToken = Cookies.get("impersonationToken");
  const impersonatedTokenPayload = decodeJwt(impersonationToken);
  const ownerId = impersonatedTokenPayload?.impersonatedUserId;

  const [formData, setFormData] = useState({
    topic: question.topic || "",
    questionOrderId: question.questionOrderId || "",
    questionText: question.questionText || "",
    options: question.options || [],
    correctAnswer: question.correctAnswer || "",
    difficultyLevel: question.difficultyLevel || "",
    category: question.category || "",
    area: question.area || "",
    subTopic: question.subTopic || "",
    tags: question.tags || [],
    technology: question.technology || [],
    relatedQuestions: question.relatedQuestions || [],
    hints: question.hints || [],
    attachments: question.attachments || [],
    explanation: question.explanation || "",
    solutions: question.solutions || [], // [{language, code, approach}]
    programming: question.programming || null,
    assessmentConfig: question.assessmentConfig || null,
    autoAssessment: question.autoAssessment || null,
  });

  const { mutate, isPending } = useUpdateQuestionBankManager(type);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleArrayChange = (field, index, value) => {
  //   const updated = [...formData[field]];
  //   updated[index] = value;
  //   setFormData((prev) => ({ ...prev, [field]: updated }));
  // };

  // const handleAddItem = (field) => {
  //   setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  // };

  // const handleRemoveItem = (field, index) => {
  //   const updated = [...formData[field]];
  //   updated.splice(index, 1);
  //   setFormData((prev) => ({ ...prev, [field]: updated }));
  // };

  // const handleOptionChange = (index, key, value) => {
  //   const updatedOptions = [...formData.options];

  //   if (key === "isCorrect") {
  //     // Ensure only one option is marked as correct
  //     updatedOptions.forEach((opt, i) => {
  //       updatedOptions[i] = { ...opt, isCorrect: i === index };
  //     });
  //   } else {
  //     updatedOptions[index] = { ...updatedOptions[index], [key]: value };
  //   }

  //   setFormData((prev) => ({ ...prev, options: updatedOptions }));
  // };
  const handleOptionChange = (index, key, value) => {
    const updatedOptions = [...formData.options];

    if (key === "isCorrect") {
      // Toggle logic for multiple correct options
      updatedOptions[index] = {
        ...updatedOptions[index],
        isCorrect: !updatedOptions[index].isCorrect,
      };
    } else {
      // Text input logic
      updatedOptions[index] = {
        ...updatedOptions[index],
        [key]: value,
      };
    }

    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const handleAddItem = (field) => {
    const newItem =
      field === "options" ? { optionText: "", isCorrect: false } : "";
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const handleRemoveItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      updatedBy: ownerId,
    };
    mutate(
      { questionId: question._id, formData: updatedFormData },
      {
        onSuccess: () => {
          notify.success("Question updated successfully!");
          onSuccess?.();
          onClose?.();
        },
        onError: () => {
          notify.error("Failed to update question");
        },
      },
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Edit {type === "interview" ? "Interview" : "Assessment"} Question
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Question Order ID</label>
            <input
              type="text"
              value={formData.questionOrderId}
              onChange={(e) => handleChange("questionOrderId", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Question Text</label>
          <textarea
            value={formData.questionText}
            onChange={(e) => handleChange("questionText", e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            rows={3}
          />
        </div>

        {/* Options */}
        {/* <div>
          <label className="text-sm font-medium">Options</label>
          {formData.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={(e) =>
                  handleArrayChange("options", idx, e.target.value)
                }
                className="flex-1 border rounded-lg p-2 text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem("options", idx)}
                className="text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem("options")}
            className="text-sm text-blue-600"
          >
            + Add Option
          </button>
        </div> */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
          <label className="text-sm font-semibold text-gray-700 block">
            Question Options
          </label>
          <p className="text-xs text-gray-500 mb-2 italic">
            Check all options that are correct for this question.
          </p>

          {formData.options.map((opt, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 bg-white p-2 rounded-lg border transition-all ${
                opt.isCorrect
                  ? "border-blue-400 ring-1 ring-blue-100"
                  : "border-gray-200"
              }`}
            >
              {/* Checkbox for Multiple Correct Answers */}
              <input
                type="checkbox"
                checked={opt.isCorrect || false}
                onChange={() => handleOptionChange(idx, "isCorrect")}
                className="w-4 h-4 accent-custom-blue rounded border-gray-300 cursor-pointer"
              />

              {/* Label (a, b, c) */}
              <span className="text-sm font-medium text-gray-400 w-4">
                {String.fromCharCode(97 + idx)})
              </span>

              {/* Text Input */}
              <input
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt.optionText || ""}
                onChange={(e) =>
                  handleOptionChange(idx, "optionText", e.target.value)
                }
                className="flex-1 border-none focus:ring-0 text-sm p-1 bg-transparent"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveItem("options", idx)}
                className="text-gray-300 hover:text-red-500 transition-colors px-2"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddItem("options")}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1"
          >
            <span className="text-lg">+</span> Add New Option
          </button>
        </div>

        <div>
          <label className="text-sm font-medium">Correct Answer</label>
          <input
            type="text"
            value={formData.correctAnswer}
            onChange={(e) => handleChange("correctAnswer", e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        {/* Meta Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Difficulty</label>
            <input
              type="text"
              value={formData.difficultyLevel}
              onChange={(e) => handleChange("difficultyLevel", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Area</label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => handleChange("area", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">SubTopic</label>
            <input
              type="text"
              value={formData.subTopic}
              onChange={(e) => handleChange("subTopic", e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        {/* Tags, Tech, Related */}
        {["tags", "technology", "relatedQuestions", "hints", "attachments"].map(
          (field) => (
            <div key={field}>
              <label className="text-sm font-medium capitalize">{field}</label>
              {formData[field].map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      handleArrayChange(field, idx, e.target.value)
                    }
                    className="flex-1 border rounded-lg p-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(field, idx)}
                    className="text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddItem(field)}
                className="text-sm text-blue-600"
              >
                + Add {field}
              </button>
            </div>
          ),
        )}

        {/* Interview-specific fields */}
        {type === "interview" && (
          <>
            <div>
              <label className="text-sm font-medium">Explanation</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => handleChange("explanation", e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                rows={3}
              />
            </div>

            {/* Solutions */}
            {/* <div>
              <label className="text-sm font-medium">Solutions</label>
              {formData.solutions.map((s, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 mb-3 space-y-2 bg-gray-50"
                >
                  <input
                    type="text"
                    placeholder="Language"
                    value={s.language || ""}
                    onChange={(e) =>
                      handleArrayChange("solutions", idx, {
                        ...s,
                        language: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <textarea
                    placeholder="Code"
                    value={s.code || ""}
                    onChange={(e) =>
                      handleArrayChange("solutions", idx, {
                        ...s,
                        code: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                    rows={3}
                  />
                  <input
                    type="text"
                    placeholder="Approach"
                    value={s.approach || ""}
                    onChange={(e) =>
                      handleArrayChange("solutions", idx, {
                        ...s,
                        approach: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleChange("solutions", [
                    ...formData.solutions,
                    { language: "", code: "", approach: "" },
                  ])
                }
                className="text-sm text-blue-600"
              >
                + Add Solution
              </button>
            </div> */}
            {/* Solutions */}
            <div>
              <label className="text-sm font-medium">Solutions</label>
              {formData.solutions.map((s, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 mb-3 space-y-2 bg-gray-50 relative"
                >
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem("solutions", idx)}
                    className="absolute -top-6 right-2 text-red-600 text-sm"
                  >
                    ✕
                  </button>

                  <input
                    type="text"
                    placeholder="Language"
                    value={s.language || ""}
                    onChange={(e) =>
                      handleArrayChange("solutions", idx, {
                        ...s,
                        language: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />

                  <textarea
                    placeholder="Code"
                    value={s.code || ""}
                    onChange={(e) =>
                      handleArrayChange("solutions", idx, {
                        ...s,
                        code: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                    rows={3}
                  />

                  <input
                    type="text"
                    placeholder="Approach"
                    value={s.approach || ""}
                    onChange={(e) =>
                      handleArrayChange("solutions", idx, {
                        ...s,
                        approach: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  handleChange("solutions", [
                    ...formData.solutions,
                    { language: "", code: "", approach: "" },
                  ])
                }
                className="text-sm text-blue-600"
              >
                + Add Solution
              </button>
            </div>
          </>
        )}

        {/* Submit buttons */}
        <div className="flex justify-end gap-3 w-full py-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionEditForm;
