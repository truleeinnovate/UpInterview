
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import Breadcrumb from '../../CommonCode-AllTabs/Breadcrumb.jsx';
import { useCandidates } from '../../../../../apiHooks/useCandidates';
import { useInterviews } from '../../../../../apiHooks/useInterviews.js';
import LoadingButton from '../../../../../Components/LoadingButton';
import { useInterviewTemplates } from '../../../../../apiHooks/useInterviewTemplates.js';
import { usePositions } from '../../../../../apiHooks/usePositions.js';
// Reusable Modal Component
const ConfirmationModal = ({ isOpen, onClose, onProceed, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900">Confirm Template Change</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 border border-transparent rounded-md text-white bg-custom-blue hover:bg-custom-blue/90"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

const InterviewForm = () => {

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const orgId = tokenPayload?.tenantId;
  const userId = tokenPayload?.userId;
  const { id } = useParams();
  const navigate = useNavigate();
  const { positionData } = usePositions();
  const { templatesData } = useInterviewTemplates();
  const {
    interviewData,
    isMutationLoading,
    createInterview,
  } = useInterviews();
  const { candidateData } = useCandidates();

  const [candidateId, setCandidateId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidateError, setCandidateError] = useState('');
  const [positionError, setPositionError] = useState('');

  const isEditing = !!id;
  const interview = isEditing ? interviewData.find(interview => interview._id === id) : null;
  //console.log('interview-----',interview);

  useEffect(() => {
    if (isEditing && interview) {
      setCandidateId(interview.candidateId._id);
      setPositionId(interview.positionId._id);
      setTemplateId(interview.templateId?._id);
    }
  }, [isEditing, interview]);

  useEffect(() => {
    if (positionId) {
      const selectedPosition = positionData.find(pos => pos._id === positionId);
      if (selectedPosition) {
        if (selectedPosition.templateId) {
          setTemplateId(selectedPosition.templateId);
          toast.info("Template and rounds are fetched from the position.");
        } else {
          setTemplateId('');
        }
      }
    }
  }, [positionId]);

  const handleTemplateChange = (e) => {
    const newTemplateId = e.target.value;

    if (!positionId) {
      toast.error("Please select a position first.", { autoClose: 3000 });
      e.target.value = ''; 
      return;
    }

    const selectedPosition = positionData.find(pos => pos._id === positionId);

    if (selectedPosition) {
      if ((selectedPosition.rounds && selectedPosition.rounds.length > 0) || selectedPosition.templateId) {
        setTemplateId(newTemplateId);
        setShowModal(true);
      } else {
        setTemplateId(newTemplateId);
      }
    }

    
  };

  const handleProceed = () => {
    setShowModal(false);
    handleSubmit();
  };

  const handleCancel = () => {
    setTemplateId('');
    setShowModal(false);
  };

const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  setError(null);

  // Reset errors
  setCandidateError('');
  setPositionError('');

  let hasError = false;

  if (!candidateId) {
    setCandidateError('Candidate is required');
    hasError = true;
  }

  if (!positionId) {
    setPositionError('Position is required');
    hasError = true;
  }

  if (hasError) {
    return;
  }

  try {
    const selectedTemplate = templateId ? templatesData.find(template => template._id === templateId) : null;

    if (templateId && !selectedTemplate) {
      throw new Error('Selected template not found');
    }

    // Use createInterview mutation from useInterviews hook
    await createInterview({
      candidateId,
      positionId,
      orgId,
      userId,
      templateId,
      id, // interviewId
    });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
  } finally {
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Breadcrumb items={[
            { label: 'Interviews', path: '/interviewList' },
            ...(isEditing && interview
              ? [{ label: candidateData?.LastName || 'Interview', path: `/interviews/${id}`, status: interview.status },
              { label: 'Edit Interview', path: '' }]
              : [{ label: 'New Interview', path: '' }])
          ]} />

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Edit Interview' : 'Create New Interview'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing ? 'Update the interview details below' : 'Fill in the details to create a new interview'}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit}>
                {error && <div className="mb-4 p-4 bg-red-50 rounded-md"><p className="text-sm text-red-700">{error}</p></div>}

                <div className="space-y-6">
                  <div>
                    <label htmlFor="candidate" className="block text-sm font-medium text-gray-700">Candidate <span className="text-red-500">*</span></label>
                    <select
                      id="candidate"
                      value={candidateId}
                      onChange={(e) => {
                        setCandidateId(e.target.value);
                        setCandidateError('');
                      }}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${candidateError ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                    >
                      <option value="" hidden>Select a Candidate</option>
                      {(candidateData ?? []).map(candidate => (
                        <option key={candidate._id} value={candidate._id}>{candidate.LastName} ({candidate.Email})</option>
                      ))}
                    </select>
                    {candidateError && <p className="mt-2 text-sm text-red-600">{candidateError}</p>}
                  </div>

                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position <span className="text-red-500">*</span></label>
                    <select
                      id="position"
                      value={positionId}
                      onChange={(e) => {
                        setPositionId(e.target.value);
                        setPositionError('');
                      }}
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${positionError ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                    >
                      <option value="" hidden>Select a Position</option>
                      {(positionData ?? []).map(position => (
                        <option key={position._id} value={position._id}>{position.title}</option>
                      ))}
                    </select>
                    {positionError && <p className="mt-2 text-sm text-red-600">{positionError}</p>}
                  </div>

                  <div>
                    <label htmlFor="template" className="block text-sm font-medium text-gray-700">Interview Template</label>
                    <select id="template" value={templateId} onChange={handleTemplateChange}
                      disabled={!positionId}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                      <option value="" hidden>Select a Template</option>
                      {(templatesData ?? []).filter(template => template.rounds && template.rounds.length > 0 && template.status === 'active')
                      .map((template) => (
                        <option key={template._id} value={template._id}>{template.templateName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate(-1)}
                      className="px-4 py-2 border border-custom-blue rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Cancel
                    </button>
                    {/* <button type="submit" disabled={submitting}
                      className="px-4 py-2 border border-transparent rounded-md text-white bg-custom-blue hover:bg-custom-blue/90">
                      {submitting ? 'Saving...' : isEditing ? 'Update Interview' : 'Create Interview'}
                    </button> */}

                    <LoadingButton
                      onClick={handleSubmit}
                      isLoading={isMutationLoading}
                      loadingText={isEditing ? "Updating..." : "Saving..."}
                    >
                      {isEditing ? "Update Interview" : "Create Interview"}
                    </LoadingButton>
                    
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onProceed={handleProceed}
        message="Changing the template will override the existing rounds. Do you want to proceed?"
      />
    </div>
  );
};

export default InterviewForm;