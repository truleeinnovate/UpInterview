// components/FeeConfirmationModal.jsx
import React from 'react';
import { XCircle, Calendar } from 'lucide-react';

const FeeConfirmationModal = ({ onClose, onConfirm, action, fees, round }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4 capitalize">{action} Round: {round.roundTitle}</h2>
        <p className="mb-4">Time Bracket: {fees.bracket.replace(/([A-Z])/g, ' $1').trim()}</p>
        <table className="w-full mb-4 border-collapse">
          <thead>
            <tr><th className="border p-2">Item</th><th className="border p-2">Amount</th></tr>
          </thead>
          <tbody>
            <tr><td className="border p-2">{action === 'reschedule' ? 'Reschedule Fee' : 'Cancellation Fee'}</td><td className="border p-2">${action === 'reschedule' ? fees.rescheduleFee : fees.cancelFee}</td></tr>
            <tr><td className="border p-2">Paid to Interviewer</td><td className="border p-2">${fees.paidToInterviewer}</td></tr>
            <tr><td className="border p-2">Service Charge (10% excl. GST)</td><td className="border p-2">${fees.serviceCharge}</td></tr>
          </tbody>
        </table>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center">
            <XCircle className="h-4 w-4 mr-1" /> Confirm {action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeConfirmationModal;