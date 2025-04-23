import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tab } from "@headlessui/react";
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  UserPlusIcon,
  PaperAirplaneIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import axios from "axios";
import ShareAssessment from "./ShareAssessment.jsx";

function AssessmentView() {
  const { assessmentData, fetchAssessmentData } = useCustomContext();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [toggleStates, setToggleStates] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);

  const toggleArrow1 = (index) => {
    setToggleStates((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const fetchAssessmentCandidates = async (assessmentId) => {
    try {
      setLoadingCandidates(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentId}/candidates`);
      setCandidates(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      return [];
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchAssessmentResults = async (assessmentId) => {
    try {
      setLoadingResults(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentId}/results`);
      setResults(response.data); // Only completed results
      return response.data;
    } catch (error) {
      console.error("Error fetching results:", error);
      return [];
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (assessment) {
      console.log("Fetching assessment questions for ID:", assessment._id);
      axios
        .get(`${process.env.REACT_APP_API_URL}/assessment-questions/list/${assessment._id}`)
        .then((response) => {
          console.log("API Response:", response.data);
          if (response.data.success) {
            const data = response.data.data;
            console.log("Received assessment questions data:", data);
            setAssessmentQuestions(data);
            setToggleStates(new Array(data.sections.length).fill(false));
          }
        })
        .catch((error) => {
          console.error("Error fetching assessment questions:", error);
          console.error("Error details:", error.response?.data || error.message);
        });
    }
  }, [assessment]);

  useEffect(() => {
    const loadData = async () => {
      const foundAssessment = assessmentData?.find((a) => a._id === id);

      if (foundAssessment) {
        setAssessment(foundAssessment);
        setIsModalOpen(true);
        await Promise.all([fetchAssessmentCandidates(id), fetchAssessmentResults(id)]);
      } else {
        const fetchedAssessment = await fetchAssessmentData(id);
        if (fetchedAssessment) {
          setAssessment(fetchedAssessment);
          setIsModalOpen(true);
          await Promise.all([fetchAssessmentCandidates(id), fetchAssessmentResults(id)]);
        }
      }
    };

    loadData();
  }, [id, assessmentData, fetchAssessmentData]);

  const formattedCandidates = candidates.map((candidate) => ({
    id: candidate._id,
    name: candidate.candidateId?.LastName || "Unknown",
    email: candidate.candidateId?.Email || "No email",
    status: candidate.status,
    score: candidate.totalScore,
    completionDate: candidate.endedAt,
    result:
      candidate.status === "completed"
        ? assessment.passScoreBy === "Each Section"
          ? "N/A"
          : candidate.totalScore >= (assessment?.passScore || 0)
            ? "pass"
            : "fail"
        : null,
  }));

  const formattedResults = results.map((result) => {
    let resultStatus = "N/A";
    if (assessment.passScoreBy === "Overall") {
      resultStatus = result.totalScore >= (assessment.passScore || 0) ? "pass" : "fail";
    } else if (assessment.passScoreBy === "Each Section" && assessmentQuestions.sections) {
      const sectionResults = result.sections.map((sectionData, idx) => {
        const section = assessmentQuestions.sections[idx];
        return sectionData.totalScore >= (section.passScore || 0);
      });
      resultStatus = sectionResults.every((passed) => passed) ? "pass" : "fail";
    }

    return {
      id: result._id,
      name: result.candidateId?.LastName || "Unknown",
      email: result.candidateId?.Email || "No email",
      score: result.totalScore,
      result: resultStatus,
      completionDate: result.endedAt,
      sections: result.sections, // Array of section objects
    };
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAddCandidate = (candidateData) => {
    console.log("Adding candidate:", candidateData);
    setShowAddCandidate(false);
  };

  // const handleResendLink = async (candidateId = null) => {
  //   let candidateEmails = [];

  //   if (candidateId) {
  //     // Single candidate resend
  //     const candidate = candidatesData.find((c) => c._id === candidateId);
  //     if (!candidate) return;
  //     candidateEmails = [candidate.Email];
  //   } else {
  //     // Multiple candidates resend
  //     const selectedCandidateIds = Object.keys(selectedCandidates).filter(
  //       (id) => selectedCandidates[id]
  //     );

  //     if (selectedCandidateIds.length === 0) {
  //       setErrors({
  //         ...errors,
  //         Candidate: "Please select at least one candidate.",
  //       });
  //       return;
  //     }

  //     candidateEmails = selectedCandidateIds
  //       .map((id) => {
  //         const candidate = candidatesData.find((c) => c._id === id);
  //         return candidate ? candidate.Email : null;
  //       })
  //       .filter((email) => email !== null);
  //   }

  //   setIsLoading(true);
  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_API_URL}/candidate-assessment/send-assessment-link`,
  //       {
  //         candidateEmails,
  //         assessmentId: assessment._id,
  //       }
  //     );

  //     if (response.status === 200) {
  //       console.log("Emails sent successfully");
  //       setIsEmailSent(true);
  //       setTimeout(() => setIsEmailSent(false), 2000);
  //       if (!candidateId) {
  //         // Clear selected candidates only if it's a bulk resend
  //         setSelectedCandidates({});
  //         setIsMainResendEnabled(false);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error sending emails:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const tabs = [
    { name: "Details", content: <DetailsTab assessment={assessment} assessmentQuestions={assessmentQuestions} /> },
    {
      name: "Questions",
      content: (
        <QuestionsTab
          sections={assessmentQuestions.sections || []}
          toggleStates={toggleStates}
          toggleArrow1={toggleArrow1}
        />
      ),
    },
    {
      name: "Candidates",
      content: (
        <CandidatesTab
          candidates={formattedCandidates}
          loading={loadingCandidates}
          onAddCandidate={() => setShowAddCandidate(true)}
          // onResendLink={handleResendLink}
          onViewCandidate={handleViewCandidate}
          isShareOpen={isShareOpen}
          setIsShareOpen={setIsShareOpen}
          assessment={assessment}
        />
      ),
    },
    {
      name: "Results",
      content: (
        <ResultsTab
          results={formattedResults}
          loading={loadingResults}
          assessment={assessment}
          assessmentQuestions={assessmentQuestions}
        />
      ),
    },
  ];

  if (!assessment) return <div className="p-4">Loading assessment details...</div>;

  return (
    // ... (Rest of the JSX remains unchanged, including modals for Add Candidate and Candidate Details)
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal} />
          <div
            className={`fixed inset-y-0 right-0 flex max-w-full ${isFullscreen ? "w-full" : "w-1/2"} transition-all duration-300`}
          >
            <div className="w-full relative">
              <div className="h-full bg-white shadow-xl flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{"Assessment Details"}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      {isFullscreen ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <Tab.List className="flex space-x-4 border-b border-gray-200 px-4">
                      {tabs.map((tab, idx) => (
                        <Tab
                          key={idx}
                          className={({ selected }) =>
                            `py-4 px-4 text-sm font-medium border-b-2 focus:outline-none ${selected
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`
                          }
                        >
                          {tab.name}
                        </Tab>
                      ))}
                    </Tab.List>
                    <Tab.Panels className="p-4">
                      {tabs.map((tab, idx) => (
                        <Tab.Panel key={idx} className="focus:outline-none">
                          {tab.content}
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddCandidate(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add New Candidate</h3>
                <button
                  onClick={() => setShowAddCandidate(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">{/* CandidateForm component would go here */}</div>
            </div>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedCandidate(null)} />
          <div className="fixed inset-y-0 right-0 flex max-w-full w-1/2">
            <div className="w-full relative">
              <div className="h-full bg-white shadow-xl flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Candidate Details</h3>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">{/* CandidateDetailView component would go here */}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailsTab({ assessment, assessmentQuestions }) {
  if (!assessment) return <div>Loading assessment details...</div>;

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Position</dt>
              <dd className="text-sm text-gray-900">{assessment.Position}</dd>
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
                {assessment.ExpiryDate ? format(new Date(assessment.ExpiryDate), "MMM dd, yyyy") : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scoring</h3>
          {scoringData.map((score, idx) => (
            <div key={idx} className={isEachSection ? "mb-4" : ""}>
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
                    <dd className="text-sm text-gray-900">{assessment.NumberOfQuestions || "-"}</dd>
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
            <p className="text-sm text-gray-500">
              {assessment.Instructions ? (
                <div className="text-sm text-gray-500">
                  {assessment.Instructions.split("\n").map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-2">
                      {paragraph.startsWith("•") ? (
                        <ul className="list-disc pl-5">
                          {paragraph
                            .split("•")
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
            <p className="text-sm text-gray-500">{assessment.AdditionalNotes || "None provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ sections, toggleStates, toggleArrow1 }) {
  const getDifficultyColorClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="space-y-5">
        {sections?.length > 0 &&
          sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium shadow-xs">
                      {section.questions?.length || 0} Questions
                    </span>
                    <h3 className="font-semibold text-gray-800">{section.sectionName}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                    onClick={() => toggleArrow1(index)}
                  >
                    {toggleStates[index] ? (
                      <ChevronUp className="text-xl" />
                    ) : (
                      <ChevronDown className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {toggleStates[index] && (
                <div className="divide-y divide-gray-200">
                  {section.questions?.map((question, qIndex) => (
                    <div key={question._id} className="p-5 hover:bg-gray-50 transition-colors group">
                      <div className="flex gap-4">
                        <div className="relative flex flex-col items-center pt-0.5">
                          <div
                            className={`w-2.5 h-10 rounded-full ${getDifficultyColorClass(
                              question.snapshot?.difficultyLevel
                            )}`}
                            title={question.snapshot?.difficultyLevel}
                          ></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="text-gray-500 text-sm font-medium">{question.order}.</span>
                                <p className="text-gray-800 font-medium truncate">{question.snapshot?.questionText}</p>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {question.snapshot?.questionType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

function CandidatesTab({
  candidates,
  loading,
  onAddCandidate,
  onResendLink,
  onViewCandidate,
  isShareOpen,
  setIsShareOpen,
  assessment,
}) {
  if (loading) return <div className="p-4">Loading candidates...</div>;

  const handleShareClick = async () => {
    setIsShareOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
        <button
          onClick={handleShareClick}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add Candidate
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => onViewCandidate(candidate)}
                    >
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => onViewCandidate(candidate)}
                    >
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => onViewCandidate(candidate)}
                    >
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === "completed"
                            ? candidate.result === "pass"
                              ? "bg-green-100 text-green-800"
                              : candidate.result === "fail"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                      onClick={() => onViewCandidate(candidate)}
                    >
                      {candidate.score ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResendLink(candidate.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                        Resend Link
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan="5">
                    No candidates added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isShareOpen && (
        <ShareAssessment isOpen={isShareOpen} onCloseshare={() => setIsShareOpen(false)} assessmentId={assessment._id} />
      )}
    </div>
  );
}

function ResultsTab({ results, loading, assessment, assessmentQuestions }) {
  if (loading) return <div className="p-4">Loading results...</div>;

  const isEachSection = assessment.passScoreBy === "Each Section";
  const totalCandidates = results.length;
  const passedCandidates = results.filter((r) => r.result === "pass").length;
  const failedCandidates = results.filter((r) => r.result === "fail").length;

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Assessment Results</h3>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-semibold text-blue-600">{totalCandidates}</div>
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

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completion Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {isEachSection ? (
                    <div>
                      {result.sections.map((sectionData, idx) => (
                        <div key={idx}>
                          <span className="font-medium">Section {idx + 1}:</span> {sectionData.totalScore}
                        </div>
                      ))}
                    </div>
                  ) : (
                    result.score
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${result.result === "pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {result.result}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.completionDate ? format(new Date(result.completionDate), "MMM dd, yyyy") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssessmentView;