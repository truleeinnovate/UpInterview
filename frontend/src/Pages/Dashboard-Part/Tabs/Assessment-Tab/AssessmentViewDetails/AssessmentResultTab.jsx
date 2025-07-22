// v1.0.0  -  Ashraf  -  reduce error solved
// v1.0.1  -  Ashraf  -  displaying more fileds in result
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronUpIcon, ChevronDownIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import ScheduledAssessmentResultView from './ScheduledAssessmentResultView';
import { useAssessments } from '../../../../../apiHooks/useAssessments.js';

function AssessmentResultsTab({ assessment, toggleStates, toggleArrow1, isFullscreen, assessmentQuestions }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showResultView, setShowResultView] = useState(false);
  const { fetchAssessmentResults } = useAssessments();

useEffect(() => {
  const getResults = async () => {
    const { data, error } = await fetchAssessmentResults(assessment._id);
    if (!error) {
      setResults(data);
    } else {
      console.error('Error loading results:', error);
    }
  };

  if (assessment._id) {
    getResults();
  }
}, [assessment._id]);

  const toggleSchedule = (index) => {
    toggleArrow1(index);
  };

  const handleViewResult = (candidate, schedule) => {
    setSelectedCandidate(candidate);
    setSelectedSchedule(schedule);
    setShowResultView(true);
  };

  const closeResultView = () => {
    setShowResultView(false);
    setSelectedCandidate(null);
    setSelectedSchedule(null);
  };
// <---------------------- v1.0.0
// <---------------------- v1.0.1

  // Calculate statistics
  // Only consider candidates with result 'pass' or 'fail'
  const allCandidates = results?.flatMap(schedule => schedule.candidates || []) || [];
  const completedCandidates = allCandidates.filter(c => c.result === 'pass' || c.result === 'fail');
  const totalCompleted = completedCandidates.length;
  const passedCandidates = completedCandidates.filter(c => c.result === 'pass').length;
  const failedCandidates = completedCandidates.filter(c => c.result === 'fail').length;

  // Helper to check if a date is valid
  const isValidDate = (date) => {
    const d = new Date(date);
    return date && !isNaN(d);
  };

  // Helper to get duration in minutes from assessment
  const getAssessmentDuration = () => {
    if (assessment && assessment.Duration) {
      const parsed = parseInt(assessment.Duration, 10);
      return !isNaN(parsed) ? parsed : 30;
    }
    return 30;
  };

  // Helper to get time taken for a candidate
  const getTimeTaken = (candidate) => {
    const duration = getAssessmentDuration();
    if (candidate.remainingTime !== undefined && candidate.remainingTime !== null) {
      return Math.floor((duration * 60 - candidate.remainingTime) / 60);
    }
    return '-';
  };
 // <-------------------------------v1.0.1


  if (loading) return <div className="p-4">Loading results...</div>;

  if (showResultView) {
    return (
      <ScheduledAssessmentResultView
        candidate={selectedCandidate}
        schedule={selectedSchedule}
        assessment={assessment}
        onBack={closeResultView}
        toggleStates={toggleStates}
        toggleArrow1={toggleArrow1}
        isFullscreen={isFullscreen}
        assessmentQuestions={assessmentQuestions}
      />
    );
  }

  return (
    <div className="p-4">
 <h3 className="text-lg font-medium text-gray-900 mb-6">Assessment Results</h3>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
{/* // <---------------------- v1.0.1 */}
          
          <div className="text-2xl font-semibold text-blue-600">{totalCompleted}</div>
          <div className="text-sm text-gray-500">Total Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-semibold text-green-600">{passedCandidates}</div>
          <div className="text-sm text-gray-500">Passed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-semibold text-red-600">{failedCandidates}</div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
      </div>

      <div className="space-y-4">
        {results && results.length > 0 ? (
          results.map((schedule, index) => (
            <div key={schedule.scheduleId} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div
                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSchedule(index)}
              >
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{schedule.order}</h4>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Expiry:</span>{' '}
                      {isValidDate(schedule.expiryAt)
                        ? format(new Date(schedule.expiryAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        schedule.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  {toggleStates[index] ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              {toggleStates[index] && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Answered Questions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration (mins)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {schedule.candidates && schedule.candidates.length > 0 ? (
                          schedule.candidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                                <div className="text-sm text-gray-500">{candidate.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {candidate.answeredQuestions}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getTimeTaken(candidate)} / {getAssessmentDuration()} mins
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {candidate.totalScore}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    candidate.result === 'pass'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {candidate.result}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {candidate.completionDate
                                  && isValidDate(candidate.completionDate)
                                  ? format(new Date(candidate.completionDate), 'MMM dd, yyyy')
                                  : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewResult(candidate, schedule)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-sm text-gray-500 text-center">
                              No candidates found for this schedule
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <h3 className="text-base font-medium text-gray-900 mb-2">No assessments results</h3>
          </div>
        )}
      </div>
    </div>
    // <-------------------------------v1.0.1

  );
}

export default AssessmentResultsTab;