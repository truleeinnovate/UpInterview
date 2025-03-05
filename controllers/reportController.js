const OrganizationReportTemplate = require('../models/OrganizationReportTemplate');
const UserReportFilter = require('../models/UserReportFilter');
const ReportData = require('../models/ReportData');
const Dashboard = require('../models/Dashboard');
const Candidates = require('../models/candidate');
const Interviews = require('../models/Interview');
const Positions = require('../models/position'); 

// Create a new report template
exports.createReportTemplate = async (req, res) => {
    try {
        const template = new OrganizationReportTemplate({
            ...req.body
        });
        await template.save();
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating report template:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Get all report templates
exports.getReportTemplates = async (req, res) => {
    try {
        const templates = await OrganizationReportTemplate.find();
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error getting report templates:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Get report template by ID
exports.getReportTemplateById = async (req, res) => {
    try {
        const template = await OrganizationReportTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Report template not found' });
        }
        res.status(200).json(template);
    } catch (error) {
        console.error('Error getting report template by ID:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Get user filters for a report template
exports.getUserFilters = async (req, res) => {
    try {
        const template = await OrganizationReportTemplate.findById(req.params.templateId);
        if (!template) {
            return res.status(404).json({ message: 'Report template not found' });
        }
        let userFilter = await UserReportFilter.findOne({
            templateId: req.params.templateId,
            userId: req.params.userId
        });

        if (!userFilter) {
            userFilter = {
                filters: template.defaultFilters
            };
        }

        res.status(200).json(userFilter);
    } catch (error) {
        console.error('Error getting user filters:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Save user filters for a report template
exports.saveUserFilters = async (req, res) => {
    try {
        // Remove ownerID from filters before saving
        const { ownerID, ...filtersWithoutOwner } = req.body.filters;
        
        // Save only the filter preferences
        const userFilter = await UserReportFilter.findOneAndUpdate(
            { 
                userId: req.params.userId,
                templateId: req.params.templateId
            },
            {
                $set: {
                    filters: filtersWithoutOwner,
                    lastUpdated: new Date()
                }
            },
            { upsert: true, new: true }
        );

        res.status(200).json(userFilter);
    } catch (error) {
        console.error('Error saving user filters:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Create or get dashboard with template defaults
async function getOrCreateDashboard(templateId, tenantId) {
    try {
        // Get dashboard configuration
        let dashboard = await Dashboard.findOne({ 
            templateId,
            tenantId
        });
        console.log('Found dashboard:', dashboard ? 'Yes' : 'No');

        if (!dashboard) {
            console.log('No dashboard found, getting template defaults');
            // If no dashboard exists, get template defaults
            const template = await OrganizationReportTemplate.findById(templateId);
            if (!template) {
                console.log('Template not found:', templateId);
                throw new Error('Template not found');
            }

            // Use template defaults to create new dashboard
            const defaultDashboardParams = template.defaultDashboardParams || {};
            dashboard = await Dashboard.create({
                templateId,
                tenantId,
                widgets: defaultDashboardParams.widgets || [],
                preferences: defaultDashboardParams.preferences || {},
                chartPreferences: defaultDashboardParams.chartPreferences || {},
                layout: defaultDashboardParams.layout || 'default',
                dateRange: defaultDashboardParams.dateRange || '30d',
                rightBarPosition: defaultDashboardParams.rightBarPosition || 'right',
                theme: defaultDashboardParams.theme || 'light',
                refreshInterval: parseInt(defaultDashboardParams.refreshInterval || '15'),
                lastUpdated: new Date()
            });
            console.log('Created new dashboard:', JSON.stringify(dashboard, null, 2));
        }

        return dashboard;
    } catch (error) {
        console.error('Error in getOrCreateDashboard:', error);
        throw error;
    }
}


// Get dashboard data
exports.getDashboard = async (req, res) => {
    try {
        const { templateId, tenantId } = req.params;
        console.log('Getting dashboard for:', { templateId, tenantId });

        // Get or create dashboard
        const dashboard = await getOrCreateDashboard(templateId, tenantId);

        // Get report data for activity
        const reportData = await ReportData.findOne({ templateId });
        console.log('Found report data:', reportData ? 'Yes' : 'No');

        const response = {
            dashboard,
            activityData: reportData?.data?.dashboardData?.activity || null
        };
        console.log('Sending response:', JSON.stringify(response, null, 2));
        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting dashboard:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};



// Generate report based on template and filters
exports.generateReport = async (req, res) => {
    try {
        console.log('========= GENERATE REPORT START =========');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        
        // Validate required parameters
        if (!req.params.templateId || !req.params.tenantId) {
            console.error('Missing required parameters');
            return res.status(400).json({ message: 'Missing templateId or tenantId' });
        }

        // Find template
        const template = await OrganizationReportTemplate.findById(req.params.templateId);
        if (!template) {
            console.error('Template not found:', req.params.templateId);
            return res.status(404).json({ message: 'Report template not found' });
        }
        console.log('Found template:', template._id);

        // Create or update UserReportFilter with template's default filters if it doesn't exist
        const existingUserFilter = await UserReportFilter.findOne({
            templateId: req.params.templateId,
            userId: req.params.userId
        });

        if (!existingUserFilter) {
            console.log('Creating new UserReportFilter with default filters:', template.defaultFilters);
            await UserReportFilter.create({
                userId: req.params.userId,
                templateId: req.params.templateId,
                filters: template.defaultFilters || {},
                lastUpdated: new Date()
            });
        }

        // Get existing report data
        const existingReportData = await ReportData.findOne({
            templateId: req.params.templateId,
            tenantId: req.params.tenantId,
            userId: req.params.userId
        }).lean();

        // Use filters from request or default filters
        const filters = req.body.filters || template.defaultFilters || {};
        console.log('Using filters:', filters);

        // Prepare initial data
        const { records, activityData } = await prepareInitialData(template, req.params.tenantId);
        
        // Use template's default columns for headers
        const tableHeaders = template.defaultColumns || [];

        // Prepare new data object
        const newTableData = {
            headers: tableHeaders,
            rows: records.map(record => {
                return tableHeaders.map(column => {
                    if (record.hasOwnProperty(column)) {
                        const value = record[column];
                        if (Array.isArray(value)) {
                            if (value.length > 0 && value[0].hasOwnProperty('name')) {
                                return value.map(item => item.name).filter(Boolean).join(', ') || 'N/A';
                            }
                            return value.join(', ') || 'N/A';
                        }
                        if (value && (column.includes('date') || column.includes('Date'))) {
                            return new Date(value).toLocaleDateString();
                        }
                        return value || 'N/A';
                    }
                    return 'N/A';
                });
            })
        };

        // Check if data has changed
        const hasDataChanged = !existingReportData || 
            JSON.stringify(existingReportData.data.allRecords.map(r => r._id)) !== JSON.stringify(records.map(r => r._id)) ||
            JSON.stringify(existingReportData.data.tableData.headers) !== JSON.stringify(tableHeaders);

        // Save or update report data if changed
        let reportData = existingReportData;
        const currentTime = new Date();

        if (hasDataChanged) {
            const reportDataObject = {
                userId: req.params.userId,
                templateId: req.params.templateId,
                tenantId: req.params.tenantId,
                updatedAt: currentTime,
                data: {
                    dashboardData: { activity: activityData },
                    tableData: newTableData,
                    allRecords: records
                }
            };

            reportData = await ReportData.findOneAndUpdate(
                { 
                    templateId: req.params.templateId, 
                    tenantId: req.params.tenantId, 
                    userId: req.params.userId 
                },
                reportDataObject,
                { upsert: true, new: true }
            );
        }

        // Return report data with hasDataChanged flag and updatedAt
        return res.status(200).json({
            data: reportData.data,
            updatedAt: hasDataChanged ? currentTime : reportData.updatedAt || currentTime,
            hasDataChanged
        });

    } catch (error) {
        console.error('Error generating report:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ 
            message: 'Error generating report', 
            error: error.message 
        });
    }
};

// Helper function to prepare initial data
const prepareInitialData = async (template, tenantId) => {
    if (!['Candidates', 'Interviews', 'Positions'].includes(template.objectType)) {
        return { records: [], activityData: null };
    }

    let Model;
    switch (template.objectType) {
        case 'Candidates':
            Model = Candidates;
            break;
        case 'Interviews':
            Model = Interviews;
            break;
        case 'Positions':
            Model = Positions;
            break;
        default:
            throw new Error(`Invalid object type: ${template.objectType}`);
    }

    const records = await Model.find({ tenantId }).lean();
    const activityData = await generateActivityData(template.objectType);
    console.log(`Found ${records?.length || 0} ${template.objectType}`);
    return { records, activityData };
};

// Generate activity data from candidates
const generateActivityData = async (objectType) => {
    try {

        let Model;
        switch(objectType) {
            case 'Candidates':
                Model = Candidates;
                break;
            case 'Interviews':
                Model = Interviews;
                break;
            case 'Positions':
                Model = Positions;
                break;
            default:
                throw new Error(`Invalid object type: ${objectType}`);
        }
        
        

        // First check if we can find any candidates
       
        const allCandidates = await Model.find({}).lean();


        // Get unique status values from candidates
        const uniqueStatuses = [...new Set(allCandidates.filter(c => c.status).map(c => c.status))];
        console.log('Unique statuses found:', uniqueStatuses);

        // Create status categories with 'Created' first, then other statuses
        const statusCategories = {
            'Created': (c) => true // All candidates are counted as created
        };

        // Add other statuses dynamically
        uniqueStatuses.forEach(status => {
            if (status && status !== 'Unknown') {
                statusCategories[status] = (c) => c.status === status;
            }
        });

        console.log('Status categories:', Object.keys(statusCategories));

        // Count candidates in each category
        const statusCounts = {};
        Object.entries(statusCategories).forEach(([category, condition]) => {
            statusCounts[category] = allCandidates.filter(condition).length;
        });

        console.log('Status counts:', statusCounts);

        // Generate colors for each status
        const generateColors = (count) => {
            const baseColors = [
                { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' },   // Blue
                { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' },   // Green
                { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgba(255, 206, 86, 1)' },   // Yellow
                { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' }, // Purple
                { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' }    // Red
            ];

            // Repeat colors if we have more statuses than colors
            const colors = [];
            for (let i = 0; i < count; i++) {
                colors.push(baseColors[i % baseColors.length]);
            }
            return colors;
        };

        const colors = generateColors(Object.keys(statusCounts).length);

        // Prepare chart data
        const chartData = {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Candidates',
                data: Object.values(statusCounts),
                backgroundColor: colors.map(c => c.bg),
                borderColor: colors.map(c => c.border),
                borderWidth: 1
            }]
        };

        // Return activity data
        return {
            totalCandidates: allCandidates.length,
            statusCounts,
            chartData
        };
    } catch (error) {
        console.error('Error generating activity data:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
};



// Update widget settings by dashboard ID
exports.updateWidgetSettingsById = async (req, res) => {
    try {
        const { dashboardId } = req.params;
        console.log('Updating widget settings for dashboard:', dashboardId);
        console.log('Request body:', req.body);

        const widgetToUpdate = req.body.widgets[0];
        console.log('Widget to update:', widgetToUpdate);

        if (!widgetToUpdate || !widgetToUpdate._id || !widgetToUpdate.widgetType) {
            return res.status(400).json({ message: 'Invalid widget data provided' });
        }

        // Find and update the specific widget by its _id
        const dashboard = await Dashboard.findOneAndUpdate(
            { 
                _id: dashboardId,
                'widgets._id': widgetToUpdate._id 
            },
            { 
                $set: { 
                    'widgets.$.widgetType': widgetToUpdate.widgetType,
                    lastUpdated: new Date()
                }
            },
            { 
                new: true,
                runValidators: true
            }
        );

        if (!dashboard) {
            return res.status(404).json({ message: 'Dashboard or widget not found' });
        }

        console.log('Dashboard updated:', JSON.stringify(dashboard, null, 2));
        res.status(200).json(dashboard);
    } catch (error) {
        console.error('Error updating widget settings:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};





// Get report data by templateId and tenantId
exports.getReport = async (req, res) => {
    try {
        const reportData = await ReportData.findOne({
            templateId: req.params.templateId,
            tenantId: req.params.tenantId,
            userId: req.params.userId
        });

        if (!reportData) {
            return res.status(404).json({ message: 'Report data not found' });
        }

        // Return the report data with its actual updatedAt timestamp
        res.status(200).json({
            data: reportData.data,
            updatedAt: reportData.updatedAt || reportData.generatedAt || new Date()
        });
    } catch (error) {
        console.error('Error getting report data:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ message: 'Error getting report data' });
    }
};


// Get report data by templateId and tenantId
exports.getFilteredReportData = async (req, res) => {
    try {
        console.log('Getting report data with filters:', req.body.filters);
        
        // Find template
        const template = await OrganizationReportTemplate.findById(req.params.templateId);
        if (!template) {
            return res.status(404).json({ message: 'Report template not found' });
        }

        // Get report data
        const reportData = await ReportData.findOne({
            templateId: req.params.templateId,
            tenantId: req.params.tenantId,
            userId: req.params.userId
        });

        if (!reportData) {
            return res.status(404).json({ message: 'Report data not found' });
        }

        // Get all records from report data
        let filteredRecords = [...reportData.data.allRecords];
        const filters = req.body.filters || {};
        const { dateRange, interviewStage, show } = filters;

        // Filter by date range
        if (dateRange && dateRange !== 'all') {
            const currentDate = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'last_week':
                    startDate.setDate(currentDate.getDate() - 7);
                    break;
                case 'last_month':
                    startDate.setMonth(currentDate.getMonth() - 1);
                    break;
                case 'last_3_months':
                    startDate.setMonth(currentDate.getMonth() - 3);
                    break;
                case 'last_6_months':
                    startDate.setMonth(currentDate.getMonth() - 6);
                    break;
                case 'last_year':
                    startDate.setFullYear(currentDate.getFullYear() - 1);
                    break;
                default:
                    if (typeof dateRange === 'object' && dateRange.fromDate && dateRange.toDate) {
                        startDate = new Date(dateRange.fromDate);
                        currentDate.setTime(new Date(dateRange.toDate).getTime());
                    }
                    break;
            }
            
            currentDate.setHours(23, 59, 59, 999);
            startDate.setHours(0, 0, 0, 0);

            filteredRecords = filteredRecords.filter(record => {
                const recordDate = new Date(record.createdAt);
                return recordDate >= startDate && recordDate <= currentDate;
            });
        }

        // Filter by interview stage
        if (template.objectType && interviewStage && interviewStage !== 'all') {
            filteredRecords = filteredRecords.filter(record => record.status === interviewStage);
        }

        // Filter by ownership (my/all)
        if (show === 'my') {
            filteredRecords = filteredRecords.filter(record => record.ownerID === req.params.userId);
        }

        // Use displayColumns if available, otherwise use defaultColumns
        let displayHeaders = template.defaultColumns;
        if (template.displayColumns && template.displayColumns.length > 0) {
            displayHeaders = template.displayColumns;
        }

        // Return filtered data with updated headers
        return res.status(200).json({
            data: {
                dashboardData: reportData.data.dashboardData,
                tableData: {
                    headers: displayHeaders,
                    rows: filteredRecords.map(record => {
                        return displayHeaders.map(column => {
                            if (record.hasOwnProperty(column)) {
                                const value = record[column];
                                if (Array.isArray(value)) {
                                    if (value.length > 0 && value[0].hasOwnProperty('name')) {
                                        return value.map(item => item.name).filter(Boolean).join(', ') || 'N/A';
                                    }
                                    return value.join(', ') || 'N/A';
                                }
                                if (value && (column.includes('date') || column.includes('Date'))) {
                                    return new Date(value).toLocaleDateString();
                                }
                                return value || 'N/A';
                            }
                            return 'N/A';
                        });
                    })
                }
            }
        });
    } catch (error) {
        console.error('Error getting report data:', error);
        res.status(500).json({ message: error.message });
    }
};




// Update dashboard layout
// exports.updateDashboardLayout = async (req, res) => {
//     try {
//         const { templateId, tenantId } = req.params;
//         console.log('Updating dashboard layout for:', { templateId, tenantId });
//         console.log('Request body:', req.body);

//         const { layout, rightBarPosition, theme, dateRange, refreshInterval } = req.body;
//         const updateData = {
//             layout,
//             rightBarPosition,
//             theme,
//             dateRange,
//             refreshInterval,
//             lastUpdated: new Date()
//         };
//         console.log('Layout data to save:', updateData);

//         // Find and update existing dashboard
//         const dashboard = await Dashboard.findOneAndUpdate(
//             { templateId, tenantId },
//             { $set: updateData },
//             { 
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!dashboard) {
//             return res.status(404).json({ message: 'Dashboard not found' });
//         }

//         console.log('Dashboard updated:', JSON.stringify(dashboard, null, 2));
//         res.status(200).json(dashboard);
//     } catch (error) {
//         console.error('Error updating dashboard layout:', error);
//         console.error('Error stack:', error.stack);
//         res.status(500).json({ message: error.message });
//     }
// };


// Update chart preferences
// exports.updateChartPreferences = async (req, res) => {
//     try {
//         const { templateId, tenantId } = req.params;
//         console.log('Updating chart preferences for:', { templateId, tenantId });
//         console.log('Request body:', req.body);

//         const chartPreferences = req.body.chartPreferences || {};
//         console.log('Chart preferences to save:', chartPreferences);

//         // Find and update existing dashboard
//         const dashboard = await Dashboard.findOneAndUpdate(
//             { templateId, tenantId },
//             { 
//                 $set: { 
//                     chartPreferences,
//                     lastUpdated: new Date()
//                 }
//             },
//             { 
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!dashboard) {
//             return res.status(404).json({ message: 'Dashboard not found' });
//         }

//         console.log('Dashboard updated:', JSON.stringify(dashboard, null, 2));
//         res.status(200).json(dashboard);
//     } catch (error) {
//         console.error('Error updating chart preferences:', error);
//         console.error('Error stack:', error.stack);
//         res.status(500).json({ message: error.message });
//     }
// };