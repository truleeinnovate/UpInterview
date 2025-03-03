import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ReportFilters from './ReportFilters';
import DashboardOverview from './DashboardOverview';
import ReportTable from './ReportTable';

import { FaFilter } from 'react-icons/fa';
import { BiExport } from 'react-icons/bi';
import { IoMdRefresh } from 'react-icons/io';

const ReportDetail = () => {
  const { id } = useParams();
  const [reportTemplate, setReportTemplate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportDataGet, setReportDataGet] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const tenantId = "670286b86ebcb318dab2f676"; // You can also get this from a context or state management system
  const ownerId = "670286b86ebcb318dab2f678";
 
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Generate fresh report to check for updates
      const generateResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/generate/${id}/${tenantId}/${ownerId}`, {
        filters: filters
      });
      
      // Always update the report data to get latest timestamp
      setReportDataGet({
        updatedAt: generateResponse.data.updatedAt
      });
      
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing report:', error);
      setError(error.message);
      setRefreshing(false);
    }
  };

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get report template details
      const templateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/templates/${id}`);
      console.log('Template response:', templateResponse.data);
      setReportTemplate(templateResponse.data);
      
      // Get user filters
      const filterResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/filters/${id}/${ownerId}`);
      console.log('Filter response:', filterResponse.data);
      const currentFilters = filterResponse.data?.filters 
      // || {
      //   dateRange: 'last_month',
      //   interviewStage: 'all',
      //   show: 'all'
      // };
      setFilters(currentFilters);

      // First try to get existing report data
      try {
        const reportResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/data/${id}/${tenantId}/${ownerId}`, {
          filters: currentFilters
        });
        const responeReportDataGet = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/data/${id}/${tenantId}/${ownerId}`)
        console.log('Found existing report data');
        setReportData(reportResponse.data);
        setReportDataGet({
          
          updatedAt: responeReportDataGet.data.updatedAt
        });
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('No existing report data, generating new report');
          // Only generate report if it doesn't exist
          const generateResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/generate/${id}/${tenantId}/${ownerId}`, {
            filters: currentFilters
          });
          setReportData(generateResponse.data);
          setReportDataGet({
            ...generateResponse.data,
            updatedAt: generateResponse.data.updatedAt
          });
        } else {
          throw error;
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [id, tenantId, ownerId]);

  const applyFilters = useCallback(async (newFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Get filtered data
      const reportResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/data/${id}/${tenantId}/${ownerId}`, {
        filters: newFilters
      });
      console.log('Filtered report response:', reportResponse.data);
      setReportData(reportResponse.data);
      setFilters(newFilters);
      setLoading(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [id, tenantId, ownerId]);

  const saveFilters = async (filtersToSave) => {
    try {
      // Add ownerID when show is 'my'
      const filters = {
        ...filtersToSave,
        ...(filtersToSave.show === 'my' ? { ownerID: ownerId } : {})
      };

      // Save filters to backend
      console.log('Saving filters to backend:', filters);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/filters/${id}/${ownerId}`, {
        filters
      });

      // Update local state
      setFilters(filters);
      
      // Refresh the report data
      await fetchReportData(filters);
    } catch (error) {
      console.error('Error saving filters:', error);
      setError(error.message);
    }
  };

  const handleExport = useCallback(() => {
    if (!reportData?.data) return;

    // Prepare data for Activity Summary (Charts)
    const activityData = [
      // Headers
      ['Status', 'Count'],
      // Activity data from chart
      ...reportData.data.dashboardData.activity.chartData.labels.map((label, index) => [
        label,
        reportData.data.dashboardData.activity.chartData.datasets[0].data[index]
      ])
    ];

    // Prepare data for Candidates (Table)
    const candidatesData = [
      // Headers
      reportData.data.tableData.headers,
      // Rows
      ...reportData.data.tableData.rows
    ];

    // Create workbook and add worksheets
    const wb = XLSX.utils.book_new();
    
    // Add Activity Summary worksheet
    const activityWS = XLSX.utils.aoa_to_sheet(activityData);
    XLSX.utils.book_append_sheet(wb, activityWS, 'Activity Summary');
    
    // Add Candidates worksheet
    const candidatesWS = XLSX.utils.aoa_to_sheet(candidatesData);
    XLSX.utils.book_append_sheet(wb, candidatesWS, 'Candidates');

    // Save the file
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${reportTemplate?.objectName || 'Report'}_${date}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [reportData, reportTemplate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!reportTemplate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Report template not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="mb-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Link to='/analytics' className="text-[#0F766E] text-xl font-medium hover:text-teal-700">
              Reports
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-xl font-medium text-gray-500">{reportTemplate.objectName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center justify-center h-9 w-9 border border-teal-600 rounded hover:bg-gray-50 transition-colors"
              // onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <FaFilter className="text-[#0F766E] text-base" />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 flex items-center gap-2 h-9 bg-white border border-teal-600 rounded text-[#0F766E] hover:bg-gray-50 transition-colors"
            >
              <BiExport className="text-lg" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Last Refreshed Section */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <span>Last refreshed: {reportDataGet?.updatedAt ? new Date(reportDataGet.updatedAt).toLocaleString('en-US', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
          }) : 'Not refreshed yet'}</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center border border-teal-600 rounded-md p-2 gap-1 text-teal-600 hover:text-teal-700 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            
            <IoMdRefresh className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        <ReportFilters
          filters={filters}
          applyFilters={applyFilters}
          saveFilters={saveFilters}
          templateId={id}
          filterOptions={reportTemplate.defaultFiltersOptions}
        />

        {/* Content */}
        <div className="mt-4">
          
            <>
            <DashboardOverview templateId={id} reportData={reportData} />
            <ReportTable reportData={reportData} />
            </>
          
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
