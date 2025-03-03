/* eslint-disable react/prop-types */
import { useState, useCallback, useMemo } from 'react';
import { validateWebhookFormData } from '../../../../utils/WebHooksValidation.js';

const WebhookForm = ({ isOpen, onClose, onSave }) => {
  const initialFormState = useMemo(() => ({
    callbackUrl: '',
    event: '',
    sharedSecret: ''
  }), []);

  const [formData, setFormData] = useState(initialFormState);

  const eventOptions = useMemo(() => [
    'Interview Scheduled',
    'Interview Rescheduled',
    'Interview Canceled',
    'Interview Completed',
    'Assessment Scheduled',
    'Assessment Submitted',
    'Assessment Reviewed',
    'Feedback Subbmited'
  ], []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
  }, [initialFormState]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    
    const errors = validateWebhookFormData(formData);

    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join('\n'));
      return;
    }

    console.log('Submitting form data:', formData);
    onSave(formData);
    resetForm();
  }, [formData, onSave, resetForm]);

  const renderOptions = useCallback(() => (
    eventOptions.map((event) => (
      <option className="text-gray-700" key={event} value={event}>{event}</option>
    ))
  ), [eventOptions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
      <div className="bg-white w-full md:w-2/3 lg:w-1/2 h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-teal-700 text-white">
          <h3 className="text-2xl text-teal-50 font-semibold">Subscribe</h3>
          <button onClick={handleClose} className="text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-6">
          <div className="space-y-6">
            <div className='grid grid-cols-[auto_1fr] gap-x-[10ch]'>
              <label htmlFor="callbackUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Callback URL <span className="text-red-500">*</span>
              </label>
              <input
                id="callbackUrl"
                type="text"
                name="callbackUrl"
                value={formData.callbackUrl}
                onChange={handleInputChange}
                placeholder="https://htms.example.com/webhook-Scheduled"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className='grid grid-cols-[auto_1fr] gap-x-[14.9ch]'>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                Events <span className="text-red-500">*</span>
              </label>
              <select
                id="event"
                name="event"
                value={formData.event}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${formData.event ? 'text-gray-700' : 'text-gray-400'}`}
                required
              >
                <option value="" hidden>Select events</option>
                {renderOptions()}
              </select>
            </div>

            <div className='grid grid-cols-[auto_1fr] gap-x-[3ch]'>
              <label htmlFor="sharedSecret" className="block text-sm font-medium text-gray-700 mb-1">
                Shared Secret (optional)
              </label>
              <input
                id="sharedSecret"
                type="text"
                name="sharedSecret"
                value={formData.sharedSecret}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end p-5 border-t border-gray-400 space-x-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-teal-600 border-teal-600 border-2 rounded hover:bg-teal-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-teal-700 rounded hover:bg-teal-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebhookForm;