import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { integrationLogService } from '../../services/integrationLogService';

export default function IntegrationLogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await integrationLogService.getLogs(searchQuery, page, limit);
      setLogs(response.data);
      setTotalPages(Math.ceil(response.total / limit));
      setTotalLogs(response.total);
    } catch (err) {
      setError(err.message || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleActionClick = (id) => {
    navigate(`/integration-logs-view-page/${id}`);
  };

  return (
    <>
      <div className="p-6">
        <h1 className="text-xl text-teal-600 font-bold">Integration Logs</h1>

        <div className="flex justify-end items-center gap-4 mb-2">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-8 py-2 focus:outline-none border border-gray-300 rounded w-[400px]"
            />
            <FaSearch className="absolute left-3 text-xl text-teal-600" />
            <div className="absolute right-0 h-full px-2 flex items-center border-l border-gray-300">
              <span className="text-teal-600 text-xl">▼</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">
              {loading ? 'Loading...' : `${(page - 1) * limit + 1}-${Math.min(page * limit, totalLogs)}/${totalLogs}`}
            </span>
            <button 
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
            >
              <IoIosArrowBack className="text-gray-600 text-xl" />
            </button>
            <button 
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={handleNextPage}
              disabled={page === totalPages || loading}
            >
              <IoIosArrowForward className="text-gray-600 text-xl" />
            </button>
            <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
              <FaFilter className="text-teal-600 text-xl" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className='bg-gray-50'>
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Log ID</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Process Name</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Endpoint URL</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Flow Type</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Status</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Date/Time</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Message</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-teal-600 tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.logId}>
                  <td className="px-4 md:px-6 py-4 text-sm text-teal-600">{log.logId}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{log.processName}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-teal-600">{log.requestEndPoint}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{log.flowType}</td>
                  <td className="px-4 md:px-6 py-4 text-sm">
                    <span className={`${
                      log.status === 'error' ? 'text-red-500' :
                      log.status === 'warning' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-700">{log.message}</td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                    <button 
                      onClick={() => handleActionClick(log.logId)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <BsThreeDotsVertical className="text-gray-700" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
