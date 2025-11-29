// // v1.0.0 - Ashok - commented Columns, Export CSV, No Groupings
// v1.0.1 - Ashok - fixed generate report button loading state per row

// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Download, Search, Play, Settings, Group, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import ColumnManager from './ColumnManager';

// const ReportsTable = ({ data, columns, title, type, onColumnsChange }) => {
//   const navigate = useNavigate();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortField, setSortField] = useState('');
//   const [sortDirection, setSortDirection] = useState('asc');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showColumnManager, setShowColumnManager] = useState(false);
//   const [tableColumns, setTableColumns] = useState(columns);
//   const [groupByColumn, setGroupByColumn] = useState('');
//   const [expandedGroups, setExpandedGroups] = useState(new Set());
//   const itemsPerPage = 10;

//   // Available columns that can be added to the table
//   const availableColumns = [
//     { key: 'id', label: 'ID', type: 'text', description: 'Unique identifier' },
//     { key: 'createdAt', label: 'Created Date', type: 'date', description: 'When record was created' },
//     { key: 'updatedAt', label: 'Updated Date', type: 'date', description: 'Last modification date' },
//     { key: 'tags', label: 'Tags', type: 'array', description: 'Associated tags' },
//     { key: 'priority', label: 'Priority', type: 'select', description: 'Priority level' },
//     { key: 'assignee', label: 'Assignee', type: 'text', description: 'Assigned person' },
//     { key: 'category', label: 'Category', type: 'select', description: 'Item category' },
//     { key: 'source', label: 'Source', type: 'text', description: 'Data source' },
//     { key: 'notes', label: 'Notes', type: 'text', description: 'Additional notes' },
//     { key: 'score_breakdown', label: 'Score Breakdown', type: 'object', description: 'Detailed scoring' },
//     { key: 'duration_minutes', label: 'Duration (min)', type: 'number', description: 'Duration in minutes' },
//     { key: 'location', label: 'Location', type: 'text', description: 'Physical or virtual location' }
//   ];

//   // Filter data based on search term
//   const filteredData = data.filter(item =>
//     Object.values(item).some(value =>
//       value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   // Sort data
//   const sortedData = [...filteredData].sort((a, b) => {
//     if (!sortField) return 0;

//     const aValue = a[sortField];
//     const bValue = b[sortField];

//     if (sortDirection === 'asc') {
//       return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
//     } else {
//       return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
//     }
//   });

//   // Group data by column
//   const groupDataByColumn = (data, columnKey) => {
//     return data.reduce((groups, item) => {
//       const groupValue = item[columnKey] || 'Ungrouped';
//       if (!groups[groupValue]) {
//         groups[groupValue] = [];
//       }
//       groups[groupValue].push(item);
//       return groups;
//     }, {});
//   };

//   // Group data if groupByColumn is selected
//   const groupedData = groupByColumn ? groupDataByColumn(sortedData, groupByColumn) : null;

//   // Paginate data (either grouped or ungrouped)
//   let totalPages, startIndex, paginatedData;

//   if (groupedData) {
//     // For grouped data, we paginate the groups
//     const groupKeys = Object.keys(groupedData);
//     totalPages = Math.ceil(groupKeys.length / itemsPerPage);
//     startIndex = (currentPage - 1) * itemsPerPage;
//     const paginatedGroupKeys = groupKeys.slice(startIndex, startIndex + itemsPerPage);
//     paginatedData = paginatedGroupKeys.reduce((acc, key) => {
//       acc[key] = groupedData[key];
//       return acc;
//     }, {});
//   } else {
//     totalPages = Math.ceil(sortedData.length / itemsPerPage);
//     startIndex = (currentPage - 1) * itemsPerPage;
//     paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
//   }

//   // Get visible columns only
//   const visibleColumns = tableColumns.filter(col => col.visible !== false);

//   // Get groupable columns (exclude certain types)
//   const getGroupableColumns = () => {
//     return visibleColumns.filter(col =>
//       col.type !== 'number' &&
//       col.type !== 'date' &&
//       col.key !== 'id' &&
//       col.key !== 'description' &&
//       col.key !== 'feedback'
//     );
//   };

//   const toggleGroupExpansion = (groupKey) => {
//     const newExpanded = new Set(expandedGroups);
//     if (newExpanded.has(groupKey)) {
//       newExpanded.delete(groupKey);
//     } else {
//       newExpanded.add(groupKey);
//     }
//     setExpandedGroups(newExpanded);
//   };

//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   const getSortIcon = (field) => {
//     if (sortField !== field) return '↕';
//     return sortDirection === 'asc' ? '↑' : '↓';
//   };
//   // v1.0.0 <----------------------------------------------------
//   const handleGenerateReport = (item) => {
//     if (type === 'templates') {
//       navigate(`/analytics/reports/${item.id}`);
//     }
//   };
//   // v1.0.0 ---------------------------------------------------->

//   const handleColumnsChange = (newColumns) => {
//     setTableColumns(newColumns);
//     if (onColumnsChange) {
//       onColumnsChange(newColumns);
//     }
//   };

//   const renderGroupedTable = () => {
//     return (
//       <div className="space-y-4">
//         {Object.entries(paginatedData).map(([groupKey, groupItems]) => (
//           <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden bg-red-500">
//             {/* Group Header */}
//             <div
//               className="bg-gray-50 px-6 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
//               onClick={() => toggleGroupExpansion(groupKey)}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   {expandedGroups.has(groupKey) ? (
//                     <ChevronDown className="w-4 h-4 text-gray-500" />
//                   ) : (
//                     <ChevronRightIcon className="w-4 h-4 text-gray-500" />
//                   )}
//                   <Group className="w-4 h-4 text-primary-600" />
//                   <span className="font-medium text-gray-900">
//                     {visibleColumns.find(col => col.key === groupByColumn)?.label}: {groupKey}
//                   </span>
//                 </div>
//                 <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
//                   {groupItems.length} items
//                 </span>
//               </div>
//             </div>

//             {/* Group Content */}
//             {expandedGroups.has(groupKey) && (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="bg-gray-25">
//                     <tr>
//                       {visibleColumns.map((column) => (
//                         <th
//                           key={column.key}
//                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
//                           onClick={() => handleSort(column.key)}
//                           style={{ width: column.width !== 'auto' ? column.width : undefined }}
//                         >
//                           <div className="flex items-center space-x-1">
//                             <span>{column.label}</span>
//                             <span className="text-gray-400">{getSortIcon(column.key)}</span>
//                           </div>
//                         </th>
//                       ))}
//                       {type === 'templates' && (
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           <span className="sr-only">Actions</span>
//                         </th>
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {groupItems.map((item, index) => (
//                       <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
//                         {visibleColumns.map((column) => (
//                           <td
//                             key={column.key}
//                             className="px-6 py-4 text-sm text-gray-900"
//                             style={{ width: column.width !== 'auto' ? column.width : undefined }}
//                           >
//                             {column.render ? column.render(item[column.key], item) : item[column.key]}
//                           </td>
//                         ))}
//                         {type === 'templates' && (
//                           <td className="px-6 py-4 text-sm text-gray-900 text-right">
//                             <button
//                               onClick={() => handleGenerateReport(item)}
//                               className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white rounded-md hover:bg-primary-600 transition-colors text-xs"
//                             >
//                               <Play className="w-3 h-3" />
//                               <span>Generate</span>
//                             </button>
//                           </td>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderRegularTable = () => {
//     return (
//       <div className="overflow-x-auto bg-red-500">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               {visibleColumns.map((column) => (
//                 <th
//                   key={column.key}
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
//                   onClick={() => handleSort(column.key)}
//                   style={{ width: column.width !== 'auto' ? column.width : undefined }}
//                 >
//                   <div className="flex items-center space-x-1">
//                     <span>{column.label}</span>
//                     <span className="text-gray-400">{getSortIcon(column.key)}</span>
//                   </div>
//                 </th>
//               ))}
//               {type === 'templates' && (
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   <span className="sr-only">Actions</span>
//                 </th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {paginatedData.map((item, index) => (
//               <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
//                 {visibleColumns.map((column) => (
//                   <td
//                     key={column.key}
//                     className="px-6 py-4 text-sm text-gray-900"
//                     style={{ width: column.width !== 'auto' ? column.width : undefined }}
//                   >
//                     {column.render ? column.render(item[column.key], item) : item[column.key]}
//                   </td>
//                 ))}
//                 {type === 'templates' && (
//                   <td className="px-6 py-4 text-sm text-gray-900 text-right">
//                     <button
//                       onClick={() => handleGenerateReport(item)}
//                       className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white rounded-md hover:bg-primary-600 transition-colors text-xs"
//                     >
//                       <Play className="w-3 h-3" />
//                       <span>Generate</span>
//                     </button>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-custom-blue">{title}</h3>
//             <div className="flex items-center space-x-2">
//               {/* v1.0.0 <------------------------------------------------------------- */}
//               {/* <button
//                 onClick={() => setShowColumnManager(true)}
//                 className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 <Settings className="w-4 h-4" />
//                 <span>Columns</span>
//               </button> */}
//               {/* <button className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue transition-colors">
//                 <Download className="w-4 h-4" />
//                 <span>Export CSV</span>
//               </button> */}
//               {/* v1.0.0 -------------------------------------------------------------> */}
//             </div>
//           </div>

//           {/* Search and Group By */}
//           <div className="flex items-center space-x-4">
//             {/* <div className="relative flex-1">
//               <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
//               />
//             </div> */}

//             {/* Group By Dropdown */}
//             {/* v1.0.0 <-------------------------------------------------------------------- */}
//             {/* <div className="flex items-center space-x-2">
//               <Group className="w-4 h-4 text-gray-500" />
//               <select
//                 value={groupByColumn}
//                 onChange={(e) => {
//                   setGroupByColumn(e.target.value);
//                   setCurrentPage(1); // Reset to first page when grouping changes
//                   if (e.target.value) {
//                     // Expand all groups by default when grouping is enabled
//                     const groups = groupDataByColumn(sortedData, e.target.value);
//                     setExpandedGroups(new Set(Object.keys(groups)));
//                   } else {
//                     setExpandedGroups(new Set());
//                   }
//                 }}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
//               >
//                 <option value="">No Grouping</option>
//                 {getGroupableColumns().map(column => (
//                   <option key={column.key} value={column.key}>
//                     Group by {column.label}
//                   </option>
//                 ))}
//               </select>
//             </div> */}
//             {/* v1.0.0 --------------------------------------------------------------------> */}
//           </div>

//           {/* Group By Info */}
//           {groupByColumn && (
//             <div className="mt-3 flex items-center justify-between text-sm">
//               <div className="flex items-center space-x-2 text-gray-600">
//                 <Group className="w-4 h-4" />
//                 <span>Grouped by: <strong>{visibleColumns.find(col => col.key === groupByColumn)?.label}</strong></span>
//                 <span>({Object.keys(groupedData || {}).length} groups)</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => {
//                     const groups = groupDataByColumn(sortedData, groupByColumn);
//                     setExpandedGroups(new Set(Object.keys(groups)));
//                   }}
//                   className="text-primary-600 hover:text-primary-800 text-xs"
//                 >
//                   Expand All
//                 </button>
//                 <span className="text-gray-300">|</span>
//                 <button
//                   onClick={() => setExpandedGroups(new Set())}
//                   className="text-primary-600 hover:text-primary-800 text-xs"
//                 >
//                   Collapse All
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Table Content */}
//         {groupByColumn ? renderGroupedTable() : renderRegularTable()}

//         {/* Pagination */}
//         {/* <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
//           <div className="text-sm text-gray-700">
//             {groupByColumn ? (
//               <>Showing {Object.keys(paginatedData).length} groups of {Object.keys(groupedData || {}).length} total groups</>
//             ) : (
//               <>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results</>
//             )}
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//               disabled={currentPage === 1}
//               className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <span className="px-3 py-1 text-sm font-medium">
//               {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//               disabled={currentPage === totalPages}
//               className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div> */}
//       </div>

//       {/* Column Manager Modal */}
//       <ColumnManager
//         isOpen={showColumnManager}
//         onClose={() => setShowColumnManager(false)}
//         columns={tableColumns}
//         onColumnsChange={handleColumnsChange}
//         availableColumns={availableColumns}
//         type="table"
//       />
//     </>
//   );
// };

// export default ReportsTable;

// Components/Analytics/ReportsTable.jsx
// import React, { useState, useEffect } from "react";
// import { Play, Download, Settings } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { config } from "../../config";
// // import { useGenerateReport } from "../../apiHooks/useReportTemplates";
// // import { generateAndNavigateReport } from "./utils/handleGenerateReport";

// const ReportsTable = ({
//   data = [],
//   columns: propColumns = [],
//   title,
//   type,
//   onGenerate,
//   loadingId,
// }) => {
//   console.log("ReportsTable data =================================> :", data);
//   console.log("ReportsTable propColumns ==========================> :", propColumns);
//   // const navigate = useNavigate();
//   const [tableColumns, setTableColumns] = useState([]);
//   const [tableData, setTableData] = useState([]);
//   // const [loading, setLoading] = useState(false);

//   // const generateReportMutation = useGenerateReport(); // generate mutation

//   // If type === "templates" → this is listing templates → show Generate button
//   // If type === "data" → this is showing generated report → show data only
//   useEffect(() => {
//     if (type === "templates" && data && data.length > 0) {
//       // For template list: use passed columns (label, description, category, etc.)
//       setTableColumns(propColumns || []);
//       setTableData(data);
//     }
//   }, [data, propColumns, type]);

//   // NEW: When user clicks "Generate"
//   // const handleGenerateReport = async (template) => {
//   //   setLoading(true);
//   //   try {
//   //     const res = await axios.get(`${config.REACT_APP_API_URL}/analytics/generate/${template.id}`);

//   //     if (res.data.success) {
//   //       const { columns, data: reportData, report } = res.data;

//   //       // Update table to show REAL report
//   //       setTableColumns(
//   //         columns.map((col) => ({
//   //           key: col.key,
//   //           label: col.label,
//   //           width: col.width || "180px",
//   //           render: (value) => (value === null || value === undefined ? "-" : value),
//   //         }))
//   //       );

//   //       setTableData(
//   //         reportData.map((item) => ({
//   //           id: item.id,
//   //           ...item,
//   //         }))
//   //       );

//   //       // Optional: Show success message
//   //       // toast.success(`${report.label} generated – ${report.totalRecords} records}`);
//   //     }
//   //   } catch (err) {
//   //     alert("Failed to generate report: " + (err.response?.data?.message || err.message));
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // In ReportsTable.jsx → handleGenerateReport

//   // const handleGenerateReport = async (template) => {
//   //   // setLoading(true);
//   //   try {
//   //     const response = await generateReportMutation.mutateAsync(template.id);
//   //     const { columns, data: reportData, report } = response;
//   //     // DO NOT PASS render FUNCTION HERE
//   //     navigate(`/analytics/reports/${template.id}`, {
//   //       state: {
//   //         reportTitle: report.label,
//   //         reportDescription: report.description || "",
//   //         totalRecords: report.totalRecords,
//   //         generatedAt: report.generatedAt,
//   //         // Only pass serializable data
//   //         columns: columns.map((col) => ({
//   //           key: col.key,
//   //           label: col.label,
//   //           width: col.width || "180px",
//   //           type: col.type || "text",
//   //           // DO NOT include render: () => ...
//   //         })),
//   //         data: reportData.map((item) => ({
//   //           id: item.id,
//   //           ...item,
//   //         })),
//   //       },
//   //     });
//   //   } catch (error) {
//   //     alert("Failed to generate report: " + (error.message || "Server error"));
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // Regular table render (no grouping, no search – clean & fast)
//   const renderTable = () => (
//     <div className="overflow-x-auto">
//       <table className="w-full">
//         <thead className="bg-gray-50 border-b border-gray-200">
//           <tr>
//             {tableColumns.map((col) => (
//               <th
//                 key={col.key}
//                 className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
//                 style={{ width: col.width }}
//               >
//                 {col.label}
//               </th>
//             ))}
//             {type === "templates" && (
//               <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
//                 Actions
//               </th>
//             )}
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {tableData.map((item, index) => (
//             <tr
//               key={item.id || index}
//               className="hover:bg-gray-50 transition-colors"
//             >
//               {tableColumns.map((col) => (
//                 <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
//                   {col.render
//                     ? col.render(item[col.key], item)
//                     : item[col.key] ?? "-"}
//                 </td>
//               ))}
//               {type === "templates" && (
//                 <td className="px-6 py-4 text-right">
//                   <button
//                     // onClick={() => handleGenerateReport(item)}
//                     onClick={() => onGenerate(item)}
//                     // disabled={loading}
//                     disabled={loadingId === item.id}
//                     className="flex items-center gap-2 px-4 py-2 w-[120px] bg-custom-blue text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:opacity-70 transition-all mx-auto"
//                   >
//                     <Play className="w-3.5 h-3.5" />
//                     {/* {loading ? "Generating..." : "Generate"} */}
//                     {loadingId === item.id ? "Generating..." : "Generate"}
//                   </button>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Empty State */}
//       {tableData.length === 0 && (
//         <div className="text-center py-12 text-gray-500">
//           <p>No data available</p>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//         <h3 className="text-lg font-semibold text-custom-blue">
//           {title ||
//             (type === "templates" ? "Report Templates" : "Report Results")}
//         </h3>
//         {type !== "templates" && tableData.length > 0 && (
//           <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:opacity-90 text-sm">
//             <Download className="w-4 h-4" />
//             Export CSV
//           </button>
//         )}
//       </div>

//       {/* Table */}
//       {renderTable()}
//     </div>
//   );
// };

// export default ReportsTable;

import React from "react"; // Removed useState, useEffect
import { Play, Download } from "lucide-react";

const ReportsTable = ({
  data = [],
  columns: propColumns = [], // Rename prop to avoid confusion
  title,
  type,
  onGenerate,
  loadingId,
}) => {
  // Debug logs to verify data is arriving
  console.log("ReportsTable Render - Data:", data);
  console.log("ReportsTable Render - Columns:", propColumns);

  // 1. REMOVED internal state (tableColumns, tableData) and useEffect.
  // We use 'data' and 'propColumns' directly.

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {/* 2. Use propColumns directly */}
            {propColumns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {/* Only show Actions column if this is the Templates list */}
            {type === "templates" && (
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* 3. Use data directly */}
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className="hover:bg-gray-50 transition-colors"
            >
              {propColumns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                  {col.render
                    ? col.render(item[col.key], item)
                    : item[col.key] ?? "-"}
                </td>
              ))}

              {/* Only show Generate button if this is the Templates list */}
              {type === "templates" && (
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onGenerate(item)}
                    disabled={loadingId === item.id}
                    className="flex items-center gap-2 px-4 py-2 w-[120px] bg-custom-blue text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:opacity-70 transition-all mx-auto"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {loadingId === item.id ? "Generating..." : "Generate"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty State */}
      {(!data || data.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p>No data available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-custom-blue">
          {title ||
            (type === "templates" ? "Report Templates" : "Report Results")}
        </h3>
        {/* Show Export button only for Data views, not Template lists */}
        {type !== "templates" && data.length > 0 && (
          <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:opacity-90 text-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {renderTable()}
    </div>
  );
};

export default ReportsTable;
