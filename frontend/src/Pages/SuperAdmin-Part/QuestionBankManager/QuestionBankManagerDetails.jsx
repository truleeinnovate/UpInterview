// v1.0.0 - Ashok - Improved issues

import React from "react";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const QuestionBankManagerDetails = ({ content, type }) => {
  if (!content) return <div>No data available</div>;

  // v1.0.0 <----------------------------------------------------------------------------------
  return (
    <div className="w-full bg-white rounded-2xl p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-medium text-gray-900">
          {content.questionOrderId ?? "N/A"}: {content.questionText ?? "N/A"}
        </h2>
        <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
          {content.questionType ?? "N/A"}
        </span>
      </div>

      {/* Common badges */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          Difficulty: {content.difficultyLevel ?? "N/A"}
        </span>
        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
          Category: {content.category ?? "N/A"}
        </span>
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          Area: {content.area ?? "N/A"}
        </span>
        <span className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
          SubTopic: {content.subTopic ?? "N/A"}
        </span>
      </div>

      {/* Assessment Type */}
      <>
        {/* Options */}
        {content.options && content.options.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Options</h3>
            <ul className="list-disc ml-6 text-gray-700">
              {content.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          </div>
        )}

        {content.correctAnswer ? (
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Correct Answer</h3>
            <p className="text-gray-700">{content.correctAnswer}</p>
          </div>
        ) : null}
      </>

      {/* Interview Type */}
      {type === "interview" && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Answer / Explanation
            </h3>
            <p className="text-gray-700">{content.explanation ?? "N/A"}</p>
          </div>
          {content.solutions?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Solutions</h3>
              {content.solutions.map((s, idx) => (
                <div key={idx} className="mb-3 p-4 bg-gray-100 rounded-lg">
                  <div>
                    <strong>Language:</strong> {s?.language ?? "N/A"}
                  </div>
                  <div className="mt-1">
                    <strong>Code:</strong>
                    <pre className="bg-gray-200 p-2 rounded mt-1 text-sm overflow-x-auto">
                      {s?.code ?? "N/A"}
                    </pre>
                  </div>
                  <div className="mt-1">
                    <strong>Approach:</strong> {s?.approach ?? "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* v1.0.0 ---------------------------------------------------------------------------> */}
        </>
      )}

      {/* Programming Section */}
      {content.programming && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Programming</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p>
              <strong>Starter Code:</strong>{" "}
              {content.programming.starterCode ?? "N/A"}
            </p>
            <p>
              <strong>Code Template:</strong>{" "}
              {content.programming.codeTemplate ?? "N/A"}
            </p>
            <p>
              <strong>Languages:</strong>{" "}
              {content.programming.language?.length > 0
                ? content.programming.language.join(", ")
                : "N/A"}
            </p>

            <div>
              <h4 className="font-semibold text-gray-700">Test Cases</h4>
              {content.programming.testCases?.length > 0 ? (
                content.programming.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 p-2 rounded mt-1 text-sm"
                  >
                    <p>
                      <strong>Input:</strong> {tc.input ?? "N/A"}
                    </p>
                    <p>
                      <strong>Expected Output:</strong>{" "}
                      {tc.expectedOutput ?? tc.expected_output ?? "N/A"}
                    </p>
                    <p>
                      <strong>Output Type:</strong>{" "}
                      {tc.expectedOutputType ?? "N/A"}
                    </p>
                    <p>
                      <strong>Weight:</strong> {tc.weight ?? "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assessment Config */}
      {content.assessmentConfig && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">
            Assessment Config
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p>
              <strong>Auto Assessable:</strong>{" "}
              {content.assessmentConfig.autoAssessable ? "Yes" : "No"}
            </p>
            <p>
              <strong>Code Template:</strong>{" "}
              {content.assessmentConfig.codeTemplate ?? "N/A"}
            </p>
            <p>
              <strong>Time Complexity:</strong>{" "}
              {content.assessmentConfig.timeComplexity ?? "N/A"}
            </p>
            <p>
              <strong>Space Complexity:</strong>{" "}
              {content.assessmentConfig.spaceComplexity ?? "N/A"}
            </p>

            <div>
              <h4 className="font-semibold text-gray-700">Test Cases</h4>
              {content.assessmentConfig.testCases?.length > 0 ? (
                content.assessmentConfig.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 p-2 rounded mt-1 text-sm"
                  >
                    <p>
                      <strong>Input:</strong> {tc.input ?? "N/A"}
                    </p>
                    <p>
                      <strong>Expected Output:</strong>{" "}
                      {tc.expectedOutput ?? "N/A"}
                    </p>
                    <p>
                      <strong>Output Type:</strong>{" "}
                      {tc.expectedOutputType ?? "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto Assessment */}
      {content.autoAssessment && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Auto Assessment</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p>
              <strong>Criteria:</strong>{" "}
              {content.autoAssessment.criteria ?? "N/A"}
            </p>
            <p>
              <strong>Expected Answer:</strong>{" "}
              {content.autoAssessment.expectedAnswer ?? "N/A"}
            </p>

            <div>
              <h4 className="font-semibold text-gray-700">Test Cases</h4>
              {content.autoAssessment.testCases?.length > 0 ? (
                content.autoAssessment.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 p-2 rounded mt-1 text-sm"
                  >
                    <p>
                      <strong>Input:</strong> {tc.input ?? "N/A"}
                    </p>
                    <p>
                      <strong>Expected Output:</strong>{" "}
                      {tc.expectedOutput ?? "N/A"}
                    </p>
                    <p>
                      <strong>Output Type:</strong>{" "}
                      {tc.expectedOutputType ?? "N/A"}
                    </p>
                    <p>
                      <strong>Weight:</strong> {tc.weight ?? "N/A"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Common Sections */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {content.tags?.length > 0 ? (
            content.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Technology</h3>
        <p className="text-gray-700">
          {content.technology?.length > 0
            ? content.technology.join(", ")
            : "N/A"}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Related Questions</h3>
        <p className="text-gray-700">
          {content.relatedQuestions?.length > 0
            ? content.relatedQuestions.join(", ")
            : "N/A"}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Hints</h3>
        <p className="text-gray-700">
          {content.hints?.length > 0 ? content.hints.join(", ") : "N/A"}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Attachments</h3>
        <p className="text-gray-700">
          {content.attachments?.length > 0
            ? content.attachments.join(", ")
            : "N/A"}
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Created By</h3>
        <p className="text-gray-700">
          {content?.createdBy
            ? `${capitalizeFirstLetter(content?.createdBy?.firstName) || ""} ${
                capitalizeFirstLetter(content?.createdBy?.lastName) || ""
              }`.trim() || "N/A"
            : "N/A"}
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Updated By</h3>
        <p className="text-gray-700">
          {content?.updatedBy
            ? `${capitalizeFirstLetter(content?.updatedBy?.firstName) || ""} ${
                capitalizeFirstLetter(content?.updatedBy?.lastName) || ""
              }`.trim() || "N/A"
            : "N/A"}
        </p>
      </div>
    </div>
  );
  // v1.0.0 ---------------------------------------------------------------------------------->
};

export default QuestionBankManagerDetails;
