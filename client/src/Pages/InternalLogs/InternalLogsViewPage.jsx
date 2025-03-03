import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from "date-fns";
import { internalLogService } from './internalLogService';

export default function InternalLogsViewPage() {
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
      const response = await internalLogService.getLogById(id);
      setLogDetails(response.data);
    } catch (err) {
      setError(err.message || 'Error fetching log details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-700 bg-red-100 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!logDetails) {
    return (
      <div className="p-6">
        <div className="text-gray-700">
          No log details found for ID: {id}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link to='/internal-logs' className="text-teal-600 font-bold cursor-pointer">Internal Logs</Link>
        <span className="text-lg text-gray-400">/</span>
        <span className="text-lg text-gray-400">{id}</span>
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

      <div className="bg-white rounded-lg border border-gray-200 mb-3 p-3">
        <h2 className="text-lg font-semibold mb-4">Logs Details:</h2>
        <div className="grid grid-cols-2 mb-6">
          <div className="space-y-8">
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Log ID</h1>
              <p className="text-gray-600">{logDetails.logId}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Status</h1>
              <p className={
                logDetails.status === 'error' ? 'text-red-600' :
                  logDetails.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
              }>
                {logDetails.status}
              </p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Error Code</h1>
              <p className="text-gray-600">{logDetails.code}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Server Name</h1>
              <p className="text-gray-600">{logDetails.serverName}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Severity</h1>
              <p className={
                logDetails.severity === 'high' ? 'text-red-600' :
                  logDetails.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
              }>
                {logDetails.severity}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Process Name</h1>
              <p className="text-gray-600">{logDetails.processName}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Message</h1>
              <p className="text-gray-600">{logDetails.message}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Date/Time</h1>
              <p className="text-gray-600">{new Date(logDetails.createdAt).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium">Execution Time</h1>
              <p className="text-gray-600">{logDetails.executionTime}</p>
            </div>
          </div>
        </div>

        <hr className="border-t mb-4 w-full border-gray-200" />

        <div className='mb-6'>
          <h2 className="text-lg font-semibold mb-4">Request Details:</h2>
          <div className='space-y-8'>
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Endpoint URL</h1>
              <p className="text-gray-600 font-mono">{logDetails.requestEndPoint}</p>
            </div>
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Method</h1>
              <p className="text-gray-600">{logDetails.requestMethod}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium w-32">Payload</h1>
              <pre className="text-sm text-gray-600  whitespace-pre">
                {JSON.stringify(logDetails.requestBody, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <hr className="border-t mb-4 w-full border-gray-200" />

        <div className='mb-6'>
          <h2 className="text-lg font-semibold mb-4">Response Details:</h2>
          <div className='space-y-8'>
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Status Code</h1>
              <p className="text-gray-600">{logDetails.responseStatusCode}</p>
            </div>
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Error</h1>
              <p className="text-gray-600">{logDetails.responseError ? logDetails.responseError : '-'}</p>

            </div>
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Message</h1>
              <p className="text-gray-600">{logDetails.responseMessage}</p>
            </div>
            <div className="grid grid-cols-[150px,1fr] gap-16">
              <h1 className="text-gray-700 font-medium w-32">Response</h1>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap break-all">
                {JSON.stringify(logDetails.responseBody, null, 2)}
              </pre>

            </div>

          </div>
        </div>

        <hr className="border-t mb-4 w-full border-gray-200" />

        <div>
          <h2 className="text-lg font-semibold mb-4">System Details:</h2>
          <div className="grid grid-cols-2 mt-3 mb-3">
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Created By</h1>
              <p className="text-gray-600">
                User {"  "}{logDetails.createdAt
                  ? format(parseISO(logDetails.createdAt), "dd MMM yyyy. hh:mm a")
                  : "Invalid date"}
              </p>
            </div>
            <div className='grid grid-cols-[150px,1fr] gap-16'>
              <h1 className="text-gray-700 font-medium mb-1">Modified By</h1>
              <p className="text-gray-600">
                User {"  "}{logDetails.updatedAt
                  ? format(parseISO(logDetails.updatedAt), "dd MMM yyyy. hh:mm a")
                  : "Invalid date"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}