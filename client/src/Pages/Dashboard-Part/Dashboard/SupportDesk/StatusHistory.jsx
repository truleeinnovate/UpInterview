/* eslint-disable react/prop-types */
import { useState } from 'react';


function StatusHistory({ history }) {
  const [notifyUser, setNotifyUser] = useState(false);
    return (
      
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mt-6">
      <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">Status Details:</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        <div className="flex items-center">
          <span className="font-medium text-gray-700 w-32">Status</span>
          <span className="text-gray-600">{history.status}</span>
        </div>
        <div className="flex items-center ">
        <span className="font-medium text-gray-700  mr-3">Notify User</span>
        <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyUser}
                  onChange={(e) => setNotifyUser(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
      </div>
        
      
      <div className="flex items-start">
          <span className="font-medium text-gray-700 w-32">Comments</span>
          <span className="text-gray-600 flex-1">{history?.StatusHistory?.comment}</span>
        </div>
      
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center">
        <span className="font-medium text-gray-700 w-32">Created By</span>
        <span className="text-gray-600">{history.createdBy}</span>
        <span className="text-gray-600">
        {history.createdBy} {history.createdDate}
        </span>
      </div>
      <div className="flex items-center">
        <span className="font-medium text-gray-700 w-32">Modified By</span>
        <span className="text-gray-600">{history.modifiedBy}</span>
        <span className="">
        {history.modifiedBy} {history.modifiedDate}
        </span>
      </div>
    </div>
  </div>
    );
  }
  
  export default StatusHistory;