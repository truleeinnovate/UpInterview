import React from "react";
export default function FeedsViewPage({ feedDetails, onClose }) {


  if (!feedDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Feed not found</div>
      </div>
    );
  }

  return (
    <div className="px-8">
    <div className="flex items-center gap-2 cursor-pointer" onClick={onClose}>
      <div className="text-teal-600 text-lg">Feeds</div>
      <span className="text-teal-600 text-lg">/</span>
      <span className="text-teal-600 text-lg">{feedDetails._id}</span>
    </div>
  
    <div className="mb-3">
      <div>
        <button className="px-4 py-2 text-base font-medium text-gray-600 border-b-2 border-teal-600 focus:outline-none">
          Feeds
        </button>
      </div>
    </div>
  
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h3 className="text-lg font-medium mb-8">Logs Details:</h3>
  
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-12">
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">Feed ID</span>
            <span className="text-gray-700">{feedDetails._id}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">Parent ID</span>
            <span className="text-gray-700">{feedDetails.parentId}</span>
          </div>
        </div>
  

  
        <div className="grid grid-cols-2 gap-x-12">
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">Tenant ID</span>
            <span className="text-gray-700">{feedDetails.tenantId}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">Date/Time</span>
            <span className="text-gray-700">{new Date(feedDetails.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12">
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">Parent Object</span>
            <span className="text-gray-700">{feedDetails.parentObject}</span>
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-x-12">
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">Old Value</span>
            <span className="text-gray-700">{feedDetails.history?.length > 0 ? (typeof feedDetails.history.oldValue === 'object' ? JSON.stringify(feedDetails.history[0].oldValue) : feedDetails.history[0].oldValue) : 'N/A'}</span>
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-x-12">
          <div className="flex">
            <span className="text-gray-500 text-sm w-32">New Value</span>
            <span className="text-gray-700">{feedDetails.history?.length > 0 ? (typeof feedDetails.history.newValue === 'object' ? JSON.stringify(feedDetails.history[0].newValue) : feedDetails.history[0].newValue) : 'N/A'}</span>
          </div>
        </div>
      </div>
  
      <hr className="my-8 border-gray-200" />
  
      <h3 className="text-lg font-medium mb-8">System Details:</h3>
  
      <div className="grid grid-cols-2 gap-x-12">
        <div className="flex">
          <span className="text-gray-500 text-sm w-32">Created By</span>
          {/* Uncomment and add values */}
          {/* <span className="text-gray-700">{feedDetails.createdBy.name}, {feedDetails.createdBy.timestamp}</span> */}
        </div>
        <div className="flex">
          <span className="text-gray-500 text-sm w-32">Modified By</span>
          {/* Uncomment and add values */}
          {/* <span className="text-gray-700">{feedDetails.modifiedBy.name}, {feedDetails.modifiedBy.timestamp}</span> */}
        </div>
      </div>
    </div>
  </div>
  
  );
}