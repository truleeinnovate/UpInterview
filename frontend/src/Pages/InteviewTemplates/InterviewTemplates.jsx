import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import KanbanView from './KanbanView';
import Loading from '../../Components/Loading';
import { useCustomContext } from '../../Context/Contextfetch';
import InterviewTable from './InterviewTemplatesTable';
import { Button } from '../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';

// SVG Icons
import { ReactComponent as IoIosArrowBack } from '../../icons/IoIosArrowBack.svg';
import { ReactComponent as IoIosArrowForward } from '../../icons/IoIosArrowForward.svg';
import { ReactComponent as FiFilter } from '../../icons/FiFilter.svg';
import { ReactComponent as FaList } from '../../icons/FaList.svg';
import { ReactComponent as TbLayoutGridRemove } from '../../icons/TbLayoutGridRemove.svg';

const InterviewTemplates = () => {
  const { templates, templatesLoading } = useCustomContext();
  const [view, setView] = useState('table');
  const navigate = useNavigate();


  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeArrow, setActiveArrow] = useState(null);
  const itemsPerPage = 10;

  const filteredTemplates = useMemo(() => {
    if (!templates || !Array.isArray(templates)) return [];
    return templates.filter(template =>
      template?.templateName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTemplates.length);
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setActiveArrow('prev');
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setActiveArrow('next');
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

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            {/* Header */}
            <motion.div
              className="flex justify-between items-center py-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-semibold text-custom-blue">Interview Templates</h1>
              <Button
                size="sm"
                className="bg-custom-blue hover:bg-custom-blue/90 text-white"
                onClick={() => navigate('new')}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Template
              </Button>

            </motion.div>
            {/* Toolbar */}
            <motion.div
              className="lg:flex xl:flex 2xl:flex items-center lg:justify-between xl:justify-between 2xl:justify-between mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex items-center sm:hidden md:hidden">
                <Tooltip title="List" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={() => setView('table')}>
                    <FaList
                      className={`text-xl mr-4 ${view === 'table' ? 'text-custom-blue' : ''}`}
                    />
                  </span>
                </Tooltip>
                <Tooltip title="Kanban" enterDelay={300} leaveDelay={100} arrow>
                  <span onClick={() => setView('kanban')}>
                    <TbLayoutGridRemove
                      className={`text-xl ${view === 'kanban' ? 'text-custom-blue' : ''}`}
                    />
                  </span>
                </Tooltip>
              </div>
              <div className="flex items-center">
                <div className="sm:mt-0 flex justify-end w-full sm:w-auto">
                  <div className="max-w-lg w-full">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Search interview templates..."
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <span className="p-2 text-xl sm:text-sm md:text-sm">
                    {currentPage + 1}/{totalPages}
                  </span>
                </div>
                <div className="flex">
                  <Tooltip title="Previous" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 mr-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === 0 ? 'cursor-not-allowed' : ''
                        } ${activeArrow === 'prev' ? 'text-custom-blue' : ''}`}
                      onClick={handlePreviousPage}
                    >
                      <IoIosArrowBack className="text-custom-blue" />
                    </span>
                  </Tooltip>
                  <Tooltip title="Next" enterDelay={300} leaveDelay={100} arrow>
                    <span
                      className={`border p-2 text-xl sm:text-md md:text-md rounded-md ${currentPage === totalPages - 1 ? 'cursor-not-allowed' : ''
                        } ${activeArrow === 'next' ? 'text-custom-blue' : ''}`}
                      onClick={handleNextPage}
                    >
                      <IoIosArrowForward className="text-custom-blue" />
                    </span>
                  </Tooltip>
                </div>
                <div className="ml-2 text-xl sm:text-md md:text-md border rounded-md p-2">
                  <Tooltip title="Filter" enterDelay={300} leaveDelay={100} arrow>
                    <span>
                      <FiFilter className="text-custom-blue" />
                    </span>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Main Content */}
      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          {templatesLoading ? (
            <Loading />
          ) : (
            <motion.div className="bg-white">
              {paginatedTemplates.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-lg">
                  No templates found.
                </div>
              ) : view === 'kanban' ? (
                <KanbanView templates={paginatedTemplates} />
              ) : (
                <InterviewTable
                  templates={paginatedTemplates}
                  formatRelativeDate={formatRelativeDate}
                />
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Outlet />
    </div>
  );
};

export default InterviewTemplates;