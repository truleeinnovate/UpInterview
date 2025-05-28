import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Pencil } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import KanbanView from './KanbanView';
import Loading from '../../Components/Loading';
import { useCustomContext } from '../../Context/Contextfetch';
import { Button } from '../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';
import { FilterPopup } from '../../Components/Shared/FilterPopup/FilterPopup.jsx';
import Header from '../../Components/Shared/Header/Header.jsx';
import Toolbar from '../../Components/Shared/Toolbar/Toolbar.jsx';
import TableView from '../../Components/Shared/Table/TableView.jsx';
import { ReactComponent as IoIosArrowBack } from '../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../icons/IoIosArrowForward.svg';
import { ReactComponent as FaList } from '../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../icons/TbLayoutGridRemove.svg';
import { ReactComponent as MdKeyboardArrowUp } from '../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../icons/MdKeyboardArrowDown.svg';

const InterviewTemplates = () => {
  const { templates, templatesLoading } = useCustomContext();
  const navigate = useNavigate();
  const [view, setView] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ status: [] });
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const filterIconRef = useRef(null);
  const itemsPerPage = 10;

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleApplyFilters = () => {
    const filters = { status: selectedStatus };
    setSelectedFilters(filters);
    setIsFilterActive(filters.status.length > 0);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearAll = () => {
    setSelectedStatus([]);
    setSelectedFilters({ status: [] });
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleFilterIconClick = () => {
    if (templates?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (!templates || !Array.isArray(templates)) return [];
    return templates.filter((template) => {
      const matchesSearchQuery = template?.templateName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(
          template.status ? template.status.charAt(0).toUpperCase() + template.status.slice(1) : 'Active'
        );
      return matchesSearchQuery && matchesStatus;
    });
  }, [templates, searchQuery, selectedFilters]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTemplates.length);
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  const tableColumns = [
    {
      key: 'templateName',
      header: 'Template Name',
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => navigate(`/interview-templates/${row._id}`)}
        >
          {value || 'N/A'}
        </div>
      ),
    },
    {
      key: 'rounds',
      header: 'Rounds',
      render: (value) => (value?.length || 0),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
            value === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : value === 'draft'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
              : 'bg-slate-50 text-slate-700 border border-slate-200/60'
          }`}
        >
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Active'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      render: (value) => formatRelativeDate(value) || 'N/A',
    },
  ];

  const tableActions = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => navigate(`/interview-templates/${row._id}`),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed top-16 left-0 right-0 bg-background">
        <main className="px-6 max-w-7xl mx-auto">
          <div className="sm:px-0">
            <Header
              title="Interview Templates"
              onAddClick={() => navigate('new')}
              addButtonText="New Template"
            />
            <Toolbar
              view={view}
              setView={setView}
              searchQuery={searchQuery}
              onSearch={(e) => setSearchQuery(e.target.value)}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePreviousPage}
              onNextPage={handleNextPage}
              onFilterClick={handleFilterIconClick}
              isFilterActive={isFilterActive}
              isFilterPopupOpen={isFilterPopupOpen}
              dataLength={templates?.length}
              searchPlaceholder="Search interview templates..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === 'kanban' ? (
                <KanbanView templates={paginatedTemplates} />
              ) : (
                <TableView
                  data={paginatedTemplates}
                  columns={tableColumns}
                  actions={tableActions}
                  loading={templatesLoading}
                  emptyState="No templates found."
                  className="table-fixed w-full"
                />
              )}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                <div className="space-y-3">
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                    >
                      <span className="font-medium text-gray-700">Status</span>
                      {isStatusOpen ? (
                        <MdKeyboardArrowUp className="text-xl text-gray-700" />
                      ) : (
                        <MdKeyboardArrowDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isStatusOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {['Archived', 'Draft', 'Active'].map((status) => (
                          <label
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStatus.includes(status)}
                              onChange={() => handleStatusToggle(status)}
                              className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{status}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </FilterPopup>
            </motion.div>
        </div>
      </main>
      <Outlet />
    </div>
  );
};

export default InterviewTemplates;