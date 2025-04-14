/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const AssessmentDetails = ({ roundDetails, onCancel, onPrevious, onSave, roundNumber, isLastRound }) => {
  const [formData, setFormData] = useState({
    roundName: '',
    interviewType: 'Assessment',
    template: '',
    interviewMode: '',
    duration: '30',
    instructions: ''
  });

  useEffect(() => {
    if (roundDetails) {
      setFormData(prev => ({
        ...prev,
        roundName: roundDetails.roundName,
        interviewType: roundDetails.interviewType,
        interviewMode: roundDetails.interviewMode || 'Virtual',
        duration: roundDetails.duration || '30',
        instructions: roundDetails.instructions || '',
        template: roundDetails.selectedTemplate || ''
      }));
    }
  }, [roundDetails]);

  const handleSave = () => {
    onSave(formData, 'RoundDetailsSave');
  };

  const handleSaveAndAdd = () => {
    onSave(formData, 'RoundDetailsSave&AddRound');
  };

  const handleSaveAndNext = () => {
    onSave(formData, 'RoundDetailsSave&Next');
  };

  const handlePrevious = () => {
    if (roundNumber > 1) {
      // Navigate to previous round
      onPrevious('round' + (roundNumber - 1));
    } else {
      // Navigate to basic details
      onPrevious('basic');
    }
  };


  return (
    <>
      <div className="w-full border rounded-lg">
        <div className='px-8 py-5 sm:px-5'>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold sm:text-lg">Round Details:</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-sm mb-2">
                  Round Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roundName}
                  readOnly
                  onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                  placeholder="Software Engineer - Assessment"
                  className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-2">
                  Interview Type <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.interviewType}
                  readOnly
                  onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                  className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-4">Assessment Templates:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm mb-2">
                    Select Template <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.template}
                      onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                      placeholder="Select Template"
                      className="w-full border rounded px-3 py-1.5 focus:outline-none focus:border-teal-500"
                    />
                    <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                      <FaSearch className="text-gray-600 text-lg" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm mb-2">
                    Interview Mode <span className="text-red-500">*</span>
                  </label>
                  <div className='border rounded px-3'>
                    <select
                      name="interviewMode"
                      value={formData.interviewMode}
                      onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                      className="w-full py-1.5 focus:outline-none focus:border-teal-500 bg-white"
                    >
                      <option value="Virtual">Virtual</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-sm mb-2">
                  Duration (in minutes) <span className="text-red-500">*</span>
                </label>
                <div className='border rounded px-3'>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full py-1.5 focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-2">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="This interview template is designed to evaluate a candidate's technical proficiency, problem-solving abilities, and coding skills. The assessment consists of multiple-choice questions, coding challenges, and scenario-based problems relevant to the job role."
                rows="4"
                className="border rounded px-3 py-2 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6 mb-4">
        <div className="flex-1">
          <button
            onClick={handlePrevious}
            className="px-3 py-1 border-custom-blue rounded border"
          >
            Previous
          </button>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1 border-custom-blue rounded border"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 border bg-custom-blue text-white rounded hover:bg-custom-blue font-medium"
        >
          Save
        </button>
        {isLastRound ? (
          <button
            onClick={handleSaveAndAdd}
            className="px-3 py-1 border bg-custom-blue text-white rounded hover:bg-custom-blue font-medium"
          >
            Save & Add Round
          </button>
        ) : (
          <button
            onClick={handleSaveAndNext}
            className="px-3 py-1 border bg-custom-blue text-white rounded hover:bg-custom-blue font-medium"
          >
            Save & Next
          </button>
        )}
      </div>
    </>
  );
};

export default AssessmentDetails;
