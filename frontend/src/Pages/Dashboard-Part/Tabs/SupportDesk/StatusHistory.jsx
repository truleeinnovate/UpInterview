// v1.0.0------Venkatesh------change comment to internal comments and add user comments


function StatusHistory({ history }) {
  
    return (
      
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mt-6">
      <div className="space-y-6">
      <h2 className="text-lg font-semibold mb-4">Status Details:</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div className="flex justify-between">
      <div className="flex items-center">
          <span className="font-medium text-gray-700 w-32">Status</span>
          <span className="text-gray-600">{history.statusHistory?.[0]?.status}</span>
        </div>
      <div className="flex items-center ">
        <span className="font-medium text-gray-700  w-32">Notify User</span>
        <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={history.statusHistory?.[0]?.notifyUser}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
      </div>
      </div>
        
      {/* <-------v1.0.0------ */}
      <div className="flex items-start ">
          <span className="font-medium text-gray-700 w-32">Internal Comments</span>
          <span className="text-gray-600 flex-1 break-words">{history?.statusHistory?.[0]?.comment}</span>
      </div>

      <div className="flex items-start">
          <span className="font-medium text-gray-700 w-32">User Comments</span>
          <span className="text-gray-600 flex-1 break-words">{history?.statusHistory?.[0]?.userComment}</span>
      </div>
      {/* -------v1.0.0------> */}
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center">
        <span className="font-medium text-gray-700 w-32">Created By</span>
        <span className="text-gray-600">
        {history?.contact} {new Date(history?.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center">
        <span className="font-medium text-gray-700 w-32">Modified By</span>
        <span className="text-gray-600">
        {history?.statusHistory?.[0]?.user} {new Date(history?.statusHistory?.[0]?.date).toLocaleString()}
        </span>
      </div>
    </div>
  </div>
    );
  }
  
  export default StatusHistory;