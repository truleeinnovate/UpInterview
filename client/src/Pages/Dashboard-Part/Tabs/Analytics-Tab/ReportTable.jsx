/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import { useState, useCallback, useMemo } from 'react';
import { BiChevronLeft, BiChevronRight, BiSort } from 'react-icons/bi';

const ReportTable = ({ reportData }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!reportData?.data?.tableData) {
    console.log('No table data available:', reportData);
    return <div className="p-4 text-center text-gray-600">No data available</div>;
  }

  const { headers, rows } = reportData.data.tableData;

  if (!headers?.length || !rows?.length) {
    return <div className="p-4 text-center text-gray-600">No records found</div>;
  }

  // Memoized sorting logic
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Memoized sorted rows
  const sortedRows = useMemo(() => {
    const rowsCopy = [...rows];
    if (!sortConfig.key) return rowsCopy;
    
    const columnIndex = headers.indexOf(sortConfig.key);
    if (columnIndex === -1) return rowsCopy;

    return rowsCopy.sort((a, b) => {
      const aValue = a[columnIndex];
      const bValue = b[columnIndex];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [rows, headers, sortConfig]);

  // Memoized pagination values
  const paginationValues = useMemo(() => {
    const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRows = sortedRows.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentRows
    };
  }, [sortedRows, currentPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center gap-2">
                    {header}
                    <BiSort className={`text-gray-400 ${
                      sortConfig.key === header ? 'opacity-100' : 'opacity-50'
                    }`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginationValues.currentRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginationValues.totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{paginationValues.startIndex + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(paginationValues.endIndex, sortedRows.length)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{sortedRows.length}</span>{' '}
                results
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BiChevronLeft className="h-5 w-5" />
              </button>
              {[...Array(paginationValues.totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    currentPage === index + 1
                      ? 'z-10 bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationValues.totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  currentPage === paginationValues.totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
