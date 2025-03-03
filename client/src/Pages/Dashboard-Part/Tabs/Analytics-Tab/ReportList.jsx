import { useState, useEffect, useCallback, useMemo } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { BiSearch } from 'react-icons/bi';
import { TbLayoutDashboard } from 'react-icons/tb';
import { LuListFilter } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ReportList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/templates`);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize filtered reports to prevent unnecessary recalculations
  const filteredReports = useMemo(() => 
    reports.filter(report =>
      (report.reportName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ),
    [reports, searchTerm]
  );

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-teal-600">Reports</h1>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Report"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <BiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <TbLayoutDashboard size={24} className="text-gray-600 cursor-pointer hover:text-teal-600" />
          <LuListFilter size={24} className="text-gray-600 cursor-pointer hover:text-teal-600" />
        </div>
      </div>

      <div>
        <table className="w-full bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="text-sm font-medium text-gray-600 bg-gray-50">
              <th className="text-left p-4 w-4/12">Report Name</th>
              <th className="text-left p-4 w-4/12">Type</th>
              <th className="text-left p-4 w-3/12">Last Updated/ Time</th>
              <th className="text-center p-4 w-1/12">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report._id} className="border-b text-sm transition-colors duration-150">
                <td className="p-4">
                  <Link 
                    to={`/analytics/${report._id}`}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    {report.reportName}
                  </Link>
                </td>
                <td className="p-4 text-gray-600">{report.category}</td>
                <td className="p-4 text-gray-600">{new Date(report.updatedAt).toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <button className="hover:bg-gray-100 p-1.5 rounded-full transition-colors duration-150">
                      <BsThreeDotsVertical size={18} className="text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No reports found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReportList;