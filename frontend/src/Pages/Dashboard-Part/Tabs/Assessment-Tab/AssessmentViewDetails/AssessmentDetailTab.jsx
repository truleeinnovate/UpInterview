// src/components/DetailsTab.jsx
import { format } from 'date-fns';
import { usePositions } from '../../../../../apiHooks/usePositions';



function DetailsTab({ assessment, assessmentQuestions }) {
  const { positionData } = usePositions();

  const matchedPosition = positionData.find((pos) => pos._id === assessment.Position);

  if (!assessment) return <div>Loading assessment details...</div>;

  const isEachSection = assessment.passScoreBy === 'Each Section';
  const scoringData = isEachSection
    ? assessmentQuestions.sections?.map((section, idx) => ({
      sectionName: `Section ${idx + 1}: ${section.sectionName}`,
      totalScore: section.totalScore || '-',
      passScore: section.passScore || '-',
    })) || []
    : [
      {
        sectionName: 'Overall',
        totalScore: assessment.totalScore || '-',
        passScore: assessment.passScore || '-',
      },
    ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Position</dt>
             <dd className="text-sm text-gray-900">{matchedPosition?.title.charAt(0).toUpperCase() + matchedPosition?.title.slice(1) || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="text-sm text-gray-900">{assessment.Duration}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Difficulty Level</dt>
              <dd className="text-sm text-gray-900">{assessment.DifficultyLevel}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
              <dd className="text-sm text-gray-900">
                {assessment.ExpiryDate ? format(new Date(assessment.ExpiryDate), 'MMM dd, yyyy') : '-'}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scoring</h3>
          {scoringData.map((score, idx) => (
            <div key={idx} className={isEachSection ? 'mb-4' : ''}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{score.sectionName}</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Score</dt>
                  <dd className="text-sm text-gray-900">{score.totalScore}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pass Score</dt>
                  <dd className="text-sm text-gray-900">{score.passScore}</dd>
                </div>
                {!isEachSection && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Questions</dt>
                    <dd className="text-sm text-gray-900">{assessment.NumberOfQuestions || '-'}</dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Instructions</h4>
            <p className="text-sm text-gray-500 break-words">
              {assessment.Instructions ? (
                <div className="text-sm text-gray-500">
                  {assessment.Instructions.split('\n').map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-2">
                      {paragraph.startsWith('•') ? (
                        <ul className="list-disc pl-5">
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
                <p className="text-sm text-gray-500">None provided</p>
              )}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Additional Notes</h4>
            <p className="text-sm text-gray-500">{assessment.AdditionalNotes || 'None provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsTab;