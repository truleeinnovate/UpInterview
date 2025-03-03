
/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { IoMdArrowDropdown } from 'react-icons/io';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const DashboardOverview = ({ templateId }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartType, setChartType] = useState('bar');
    const tenantId = localStorage.getItem('tenantId') || '65a4f3c6e20ed268c22e5142';

    const fetchDashboard = useCallback(async () => {
        if (!templateId) return;
        
        try {
            setLoading(true);
            
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/dashboard/${templateId}/${tenantId}`);
            console.log('Dashboard response:', response.data);
            setDashboardData(response.data.dashboard);
            setActivityData(response.data.activityData);
            
            setLoading(false);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError('Error loading dashboard data');
            setLoading(false);
        }
    }, [templateId, tenantId]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Get current widget settings
    const currentWidget = useMemo(() => {
        if (!dashboardData?.widgets) return null;
        return dashboardData.widgets.find(w => w._id);
    }, [dashboardData?.widgets]);

    useEffect(() => {
        if (currentWidget?.widgetType) {
            setChartType(currentWidget.widgetType);
        }
    }, [currentWidget?.widgetType]);

    const updateWidgetSettings = useCallback(async (newChartType) => {
        try {
            if (!currentWidget?._id) {
                setError('No widget found to update');
                return;
            }

            setLoading(true);
            setError(null);
            
            // Create minimal widget update with existing widget ID
            const widgetUpdate = {
                _id: currentWidget._id,
                widgetType: newChartType
            };

            console.log('Sending widget update:', widgetUpdate);

            // Update widget in backend using dashboard ID and PATCH
            const updateResponse = await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/reports/dashboard/${dashboardData._id}/widget-settings`,
                { widgets: [widgetUpdate] }
            );

            console.log('Update response:', updateResponse.data);

            // Refresh dashboard data
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports/dashboard/${templateId}/${tenantId}`);
            setDashboardData(response.data.dashboard);
            setActivityData(response.data.activityData);
            setLoading(false);
        } catch (err) {
            console.error('Error updating widget settings:', err);
            setError(err.response?.data?.message || 'Failed to update widget settings');
            setLoading(false);
        }
    }, [currentWidget?._id, dashboardData?._id, templateId, tenantId]);

    const handleChartTypeChange = useCallback(async (e) => {
        const newChartType = e.target.value;
        await updateWidgetSettings(newChartType);
    }, [updateWidgetSettings]);

    // Prepare chart data based on current widget type
    const chartData = useMemo(() => {
        if (!activityData) return null;


        return {
            labels: activityData.chartData.labels,
            datasets: [
                {
                    label: activityData.chartData.datasets[0].label,
                    data: activityData.chartData.datasets[0].data,
                    backgroundColor: activityData.chartData.datasets[0].backgroundColor,
                    borderColor: activityData.chartData.datasets[0].borderColor,
                    borderWidth: activityData.chartData.datasets[0].borderWidth,
                },
            ],
        };
    }, [activityData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: currentWidget?.position || 'top',
                labels: {
                    usePointStyle: false,
                    useBorderRadius: false,
                    boxWidth: 20,
                }
            },
            title: {
                display: true,
                text: activityData?.title || 'Activity Overview',
            },
        },
    };

    if (loading) {
        return <div className="p-4">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    const isVisible = currentWidget?.isVisible ?? true;

    if (!isVisible) {
        return null;
    }

    return (
        <div className="p-4 w-full">
            {chartData && (
                <div className={`bg-white w-full p-6 rounded-lg shadow-md 'h-[400px]'`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Activity Overview</h3>
                        <div className="relative">
                            <select
                                value={chartType}
                                onChange={handleChartTypeChange}
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                                <option value="pie">Pie Chart</option>
                                <option value="bar">Bar Chart</option>
                                <option value="doughnut">Doughnut Chart</option>
                                <option value="line">Line Chart</option>
                            </select>
                            <IoMdArrowDropdown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <div className="h-[400px]">
                        {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
                        {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
                        {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
                        {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
                    </div>
                    {activityData?.totalCandidates && (
                        <div className="mt-4 text-sm text-gray-600">
                            Total Candidates: {activityData.totalCandidates}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
