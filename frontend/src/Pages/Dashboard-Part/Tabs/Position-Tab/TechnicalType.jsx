import { useState, useEffect } from 'react';

const TechnicalType = ({ roundDetails, onCancel, onPrevious, onSave, roundNumber, isLastRound }) => {
  const [formData, setFormData] = useState({
    roundName: '',
    interviewType: 'Technical',
    minimumInterviewers: '1',
    interviewerLevel: '',
    interviewDuration: '30',
    interviewMode: 'Virtual',
    instructions: '',
    interviewers: ['Jhone', 'Jhone 1', 'Jhone 2', 'Jhone 8'],
    questions: [
      'What is the difference between synchronous and asynchronous programming?',
      'Explain the concept of RESTful API.',
      'What are the key differences between SQL and NoSQL databases?',
      'How does garbage collection work in programming languages like Java or Python?',
      'What is the time complexity of a binary search algorithm?',
    ],
  });

  useEffect(() => {
    if (roundDetails) {
      setFormData(prev => ({
        ...prev,
        roundName: roundDetails.roundName || '',
        interviewType: roundDetails.interviewType || 'Technical',
        minimumInterviewers: roundDetails.minimumInterviewers || '1',
        interviewerLevel: roundDetails.interviewerLevel || '',
        interviewDuration: roundDetails.interviewDuration || '30',  // Ensure a default
        interviewMode: roundDetails.interviewMode || 'Virtual',
        instructions: roundDetails.instructions || '',
        interviewers: roundDetails.interviewers || [],
        questions: roundDetails.questions || [],
      }));
    }
  }, [roundDetails]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // console.log('formdata in technical:', formData);


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
      onPrevious('round' + (roundNumber - 1));
    } else {
      onPrevious('basic');
    }
  };

  return (
    <>
      <div className="w-full border rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-5">Round {roundNumber} Details:</h2>

        <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 mb-5">
          <div className="flex flex-col">
            <label className="text-sm mb-2">Round Name <span className="text-red-500">*</span></label>
            <input type="text" name="roundName" value={formData.roundName} onChange={handleChange} className="w-full border rounded px-3 py-1.5" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">Interview Type <span className="text-red-500">*</span></label>
            <input type="text" name="interviewType" value={formData.interviewType} readOnly className="w-full border rounded px-3 py-1.5 bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label className="text-sm mb-2">Interview Mode <span className="text-red-500">*</span></label>
            <select name="interviewMode" value={formData.interviewMode} onChange={handleChange} className="w-full border rounded px-3 py-1.5 bg-white">
              <option value="Virtual">Virtual</option>
              <option value="In-Person">In-Person</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">Duration <span className="text-red-500">*</span></label>
            <select
              name="interviewDuration"
              value={formData.interviewDuration}
              onChange={handleChange}
              className="w-full border rounded px-3 py-1.5 bg-white"
            >
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes</option>
              <option value="90">90 Minutes</option>
            </select>
          </div>

        </div>

        <div className="flex flex-col mt-4">
          <label className="text-sm mb-2">Instructions <span className="text-red-500">*</span></label>
          <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows="4" className="w-full border rounded px-3 py-2"></textarea>
        </div>

        <div className="space-y-5 mt-6">
          <h2 className="text-base font-medium">Interviewer Details:</h2>
          <div className="flex flex-col">
            <label className="text-sm mb-2">Interviewer Level <span className="text-red-500">*</span></label>
            <select name="interviewerLevel" value={formData.interviewerLevel} onChange={handleChange} className="w-full border rounded px-3 py-1.5 bg-white">
              <option value="">Select Option</option>
              <option value="Internal Interview">Internal Interview</option>
              <option value="Outsource Interview">Outsource Interview</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">Minimum Interviewers Required <span className="text-red-500">*</span></label>
            <input type="number" name="minimumInterviewers" value={formData.minimumInterviewers} min="1" max="5" onChange={handleChange} className="w-full border rounded px-3 py-1.5" />
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <h2 className="text-base font-medium">Questions:</h2>
          {formData.questions.map((question, index) => (
            <div key={index} className="border rounded px-3 py-2">
              <p>{index + 1}. {question}</p>
            </div>
          ))}
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

export default TechnicalType;
