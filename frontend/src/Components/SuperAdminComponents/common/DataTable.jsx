// v1.0.0 - Ashok - Fixed pagination border issue
import { useState } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

function DataTable({
  columns,
  data,
  searchable = true,
  pagination = true,
  itemsPerPageOptions = [10, 25, 50],
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

  // Handle column sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter data based on search term
  const filteredData =
    searchable && searchTerm
      ? data?.filter((item) =>
          Object.values(item).some(
            (value) =>
              value &&
              value.toString().toLowerCase().includes(searchTerm?.toLowerCase())
          )
        )
      : data;

  // Sort data
  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;

        const compareResult = aValue > bValue ? 1 : -1;
        return sortDirection === "asc" ? compareResult : -compareResult;
      })
    : filteredData;

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginatedData = pagination
    ? sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : sortedData;

  return (
    <div className="w-full">
      {/* Table controls */}
      {searchable && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
          <div className="relative w-full sm:w-64 bg-red-500 border border-gray-300 rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-2 sm:text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {pagination && (
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Show:</span>
              <select
                // v1.0.0 <----------------------------------------------------------------------------------------------------------------------
                className="focus:ring-primary-500 focus:border-custom-blue block sm:text-sm border border-gray-300 rounded-md px-2 py-1"
                // v1.0.0 ---------------------------------------------------------------------------------------------------------------------->
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {itemsPerPageOptions?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns?.map((column) => (
                    <th
                      key={column?.field}
                      onClick={() =>
                        column?.sortable !== false && handleSort(column?.field)
                      }
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        column?.sortable !== false
                          ? "cursor-pointer hover:bg-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {column?.header}
                        {sortField === column?.field && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData?.length > 0 ? (
                  paginatedData?.map((row, rowIndex) => (
                    <tr key={row?.id || rowIndex} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td
                          key={`${row?._id || rowIndex}-${column?.field}`}
                          className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap"
                        >
                          {column?.render
                            ? column?.render(row)
                            : row[column?.field]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns?.length}
                      className="text-center py-4 text-sm text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Showing{" "}
            {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData?.length)}{" "}
            to {Math.min(currentPage * itemsPerPage, sortedData?.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="btn-secondary py-1 px-2 text-sm disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))]?.map((_, i) => {
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageToShow}
                  className={`py-1 px-3 text-sm rounded-md ${
                    pageToShow === currentPage
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow}
                </button>
              );
            })}
            <button
              className="btn-secondary py-1 px-2 text-sm disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
