// src/components/DetailsTab.jsx
// v1.0.0  -  Ashraf  -  page alignments changes
// v1.0.1  -  Ashok   -  Improved responsiveness

import { format } from "date-fns";
import { usePositions } from "../../../../../apiHooks/usePositions";

function DetailsTab({ assessment, assessmentQuestions }) {
  const { positionData } = usePositions();

  const matchedPosition = positionData.find(
    (pos) => pos._id === assessment.Position
  );

  if (!assessment)
    return (
      <div className="p-4 text-gray-600">Loading assessment details...</div>
    );

  const isEachSection = assessment.passScoreBy === "Each Section";
  const scoringData = isEachSection
    ? assessmentQuestions.sections?.map((section, idx) => ({
        sectionName: `Section ${idx + 1}: ${section.sectionName}`,
        totalScore: section.totalScore || "-",
        passScore: section.passScore || "-",
      })) || []
    : [
        {
          sectionName: "Overall",
          totalScore: assessment.totalScore || "-",
          passScore: assessment.passScore || "-",
        },
      ];

  return (
    <div className="space-y-8 sm:px-0 px-6 py-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Details Section */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">
            Basic Details
          </h3>
          <dl className="space-y-4">
            <div className="flex justify-between items-start">
              <dt className="text-sm font-medium text-gray-600 flex-1">
                Position
              </dt>
              <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
                {matchedPosition?.title.charAt(0).toUpperCase() +
                  matchedPosition?.title.slice(1) || "-"}
              </dd>
            </div>
            <div className="flex justify-between items-start">
              <dt className="text-sm font-medium text-gray-600 flex-1">
                Duration
              </dt>
              <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
                {assessment.Duration}
              </dd>
            </div>
            <div className="flex justify-between items-start">
              <dt className="text-sm font-medium text-gray-600 flex-1">
                Difficulty Level
              </dt>
              <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
                {assessment.DifficultyLevel}
              </dd>
            </div>
            <div className="flex justify-between items-start">
              <dt className="text-sm font-medium text-gray-600 flex-1">
                Expiry Date
              </dt>
              <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
                {assessment.ExpiryDate
                  ? format(new Date(assessment.ExpiryDate), "MMM dd, yyyy")
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Scoring Section */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">
            Scoring
          </h3>
          <div className="space-y-6">
            {scoringData.map((score, idx) => (
              <div
                key={idx}
                className={`${
                  isEachSection
                    ? "pb-4 mb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                    : ""
                }`}
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {score.sectionName}
                </h4>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-600">
                      Total Score
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {score.totalScore}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-600">
                      Pass Score
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {score.passScore}
                    </dd>
                  </div>
                  {!isEachSection && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-600">
                        Questions
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {assessment.NumberOfQuestions || "-"}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      {/* v1.0.1 <----------------------------------------------------------------------------- */}
      {/* <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">Additional Information</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Instructions</h4>
            <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
              {assessment.Instructions ? (
                <div>
                  {assessment.Instructions.split('\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-3 last:mb-0">
                      {paragraph.startsWith('•') ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {paragraph
                            .split('•')
                            .filter((item) => item.trim())
                            .map((item, iIndex) => (
                              <li key={iIndex}>{item.trim()}</li>
                            ))}
                        </ul>
                      ) : (
                        <p>{paragraph}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">None provided</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Additional Notes</h4>
            <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
              {assessment.AdditionalNotes || <p className="text-gray-500 italic">None provided</p>}
            </div>
          </div>
        </div>
      </div> */}
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">
          Additional Information
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Instructions
            </h4>
            <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200 break-words whitespace-pre-wrap overflow-x-auto">
              {assessment.Instructions ? (
                <div>
                  {assessment.Instructions.split("\n").map(
                    (paragraph, pIndex) => (
                      <div key={pIndex} className="mb-3 last:mb-0">
                        {paragraph.startsWith("•") ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {paragraph
                              .split("•")
                              .filter((item) => item.trim())
                              .map((item, iIndex) => (
                                <li key={iIndex}>{item.trim()}</li>
                              ))}
                          </ul>
                        ) : (
                          <p className="break-words">{paragraph}</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">None provided</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Additional Notes
            </h4>
            <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200 break-words whitespace-pre-wrap overflow-x-auto">
              {assessment.AdditionalNotes || (
                <p className="text-gray-500 italic">None provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* v1.0.1 -----------------------------------------------------------------------------> */}
    </div>
  );
}

export default DetailsTab;
