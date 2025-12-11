import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { integrationLogService } from '../../services/integrationLogService';

const formatMessageValue = (value) => {
  if (!value) return 'N/A';
  if (typeof value === 'string') return value;
  if (value && typeof value.message === 'string') return value.message;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
};

export default function IntegrationLogsViewPage() {
  const { id } = useParams();
  const [logDetails, setLogDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLogDetails = async () => {
    try {
      setLoading(true);
      const response = await integrationLogService.getLogById(id);
      setLogDetails(response.data);
    } catch (err) {
      setError(err.message || 'Error fetching log details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-700 bg-red-100 p-4 rounded mb-4">
          {error}
        </div>
        <Link to="/integration-logs" className="text-teal-600 hover:text-teal-700">
          Back to Integration Logs
        </Link>
      </div>
    );
  }

  if (!logDetails) {
    return (
      <div className="p-6">
        <div className="text-gray-700 bg-gray-100 p-4 rounded mb-4">
          Log not found
        </div>
        <Link to="/integration-logs" className="text-teal-600 hover:text-teal-700">
          Back to Integration Logs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-gray-500 ">
        <Link to="/integration-logs" className="text-teal-600 font-bold cursor-pointer">
          Integration Logs
        </Link>
        <span className='text-lg text-gray-400'>/</span>
        <span className='text-lg text-gray-400'>{id}</span>
      </div>

      <div className="mb-3">
        <div className="border-b border-none border-gray-200">
          <div className="inline-block">
            <button className="px-4 py-2 text-base font-medium text-teal-600 border-b-2 border-teal-600 focus:outline-none">
              Logs
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Logs Details:</h3>
          <div className="grid grid-cols-2  gap-y-8">
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Log ID</span>
              <span className=" text-gray-600">{logDetails.logId}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 whitespace-nowrap font-medium w-32">Integration Name</span>
              <span className=" text-gray-600">{logDetails.integrationName}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Process Name</span>
              <span className=" text-gray-600">{logDetails.processName}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Flow Type</span>
              <span className=" text-gray-600">{logDetails.flowType}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Status</span>
              <span className={` ${logDetails.status === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                {logDetails.status}
              </span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Date/Time</span>
              <span className=" text-gray-600">{logDetails.dateTime}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Error Code</span>
              <span className=" text-gray-600">{logDetails.errorCode}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Duration (ms)</span>
              <span className=" text-gray-600">{logDetails.duration}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Severity</span>
              <span className=" text-gray-600">{logDetails.severity}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Message</span>
              <span className=" text-gray-600">{formatMessageValue(logDetails.message)}</span>
            </div>
          </div>
        </div>

        <hr className="border-t mb-4 w-full border-gray-200" />

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Request Details:</h3>
          <div className="grid grid-cols-1 gap-y-8">
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Endpoint URL</span>
              <span className="text-teal-600">{logDetails.requestEndPoint}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Method</span>
              <span className=" text-gray-600">{logDetails.requestMethod}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Payload</span>
              <pre className="text-sm text-gray-600 whitespace-pre">
                {JSON.stringify(logDetails.requestBody, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <hr className="border-t mb-4 w-full border-gray-200" />

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Response Details:</h3>
          <div className="grid grid-cols-1 gap-y-8">
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Status Code</span>
              <span className=" text-gray-600">{logDetails.responseStatusCode}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Error</span>
              <span className=" text-gray-600">{formatMessageValue(logDetails.responseError)}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Message</span>
              <span className=" text-gray-600">{formatMessageValue(logDetails.responseMessage)}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Response</span>
              <pre className="text-sm text-gray-600 whitespace-pre">
                {JSON.stringify(logDetails.responseBody, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <hr className="border-t mb-4 w-full border-gray-200" />

        <div className='mb-6'>
          <h3 className="text-lg font-semibold mb-4">System Details:</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Created By</span>
              <span className=" text-gray-600">{logDetails.createdBy}</span>
            </div>
            <div className="flex gap-x-24">
              <span className="text-gray-700 font-medium w-32">Modified By</span>
              <span className=" text-gray-600">{logDetails.modifiedBy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
