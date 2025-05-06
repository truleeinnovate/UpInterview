import { ArrowLeft, ArrowRight, Search, Filter } from 'lucide-react';
import { Plus, Layout, KanbanSquare, Table2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import KanbanView from "./KanbanView";
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Components/Loading';
import Cookies from "js-cookie";

const InterviewTemplates = () => {
  const navigate = useNavigate();
  const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [view, setView] = useState('kanban');
  const [newTemplate, setNewTemplate] = useState({
    templateTitle: '',
    label: '',
    description: '',
  });
  const [rounds, setRounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  const organizationId = Cookies.get("organizationId");

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviewTemplates`,
          {
            params: {
              tenantId: organizationId
            }
          }
        );
        if (response.data && response.data.data) {
          setTemplates(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (organizationId) { 
    fetchTemplates();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTemplates = useMemo(() => {
    if (!templates || !Array.isArray(templates)) return [];
    return templates.filter(template =>
      template?.templateName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_ ]/g, "");
    const label = sanitizedValue.trim().replace(/\s+/g, "_");
    setNewTemplate(prev => ({
      ...prev,
      templateTitle: sanitizedValue,
      label: label
    }));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setNewTemplate(prev => ({
      ...prev,
      description: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!newTemplate.templateTitle || !newTemplate.description || newTemplate.description.length < 20) {
      alert('Please fill in all required fields. Description must be at least 20 characters.');
      return;
    }

    try {
      const templateData = {
        tenantId: "670286b86ebcb318dab2f676",
        templateName: newTemplate.templateTitle,
        label: newTemplate.label,
        description: newTemplate.description,
        status: 'active',
        rounds: rounds.map(round => {
          const roundData = {
            roundName: round.roundName,
            interviewType: round.interviewType,
            instructions: round.instructions || '',
            interviewMode: round.interviewMode || '',
            interviewDuration: round.interviewDuration
          };

          if (round.interviewType === 'Technical') {
            roundData.interviewerType = round.interviewerType || '';
            roundData.selectedInterviewersType = round.selectedInterviewersType || '';
            roundData.selectedInterviewers = round.selectedInterviewers || [];
            roundData.interviewers = round.selectedInterviewerIds?.length > 0
              ? round.selectedInterviewerIds.map(interviewer => ({
                interviewerId: interviewer.interviewerId,
                interviewerName: interviewer.interviewerName
              }))
              : [];
            roundData.interviewerGroupId = round.interviewerGroupId || null;
            roundData.minimumInterviewers = round.minimumInterviewers || '1';
            roundData.questions = round.questions || [];
          } else if (round.interviewType === 'Assessment') {
            roundData.assessmentTemplate = round.assessmentTemplate || '';
            roundData.assessmentQuestions = round.assessmentQuestions || [];
          }

          return roundData;
        })
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/interviewTemplates`, templateData);

      if (response.data && response.data.data) {
        const createdTemplate = response.data.data;

        // Reset form
        setIsSlideoverOpen(false);
        setNewTemplate({
          templateTitle: '',
          label: '',
          description: '',
        });
        setRounds([]);

        // Trigger a refresh of the templates list
        setRefreshTrigger(prev => prev + 1);

        // Open template details for the newly created template after a short delay
        setTimeout(() => {
          navigate(`/interview-templates/${createdTemplate._id}`);
        }, 100);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert(error.response?.data?.message || 'Failed to save template. Please try again.');
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

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Days ago (up to 30 days)
    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    // Months ago (up to 12 months)
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }

    // Years ago
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="">
        <div className="px-9 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-custom-blue rounded-lg p-2">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-xl font-semibold bg-gradient-to-r from-custom-blue to-custom-blue/80 bg-clip-text text-transparent">
                Interview Templates
              </h1>
            </div>
            <button
              onClick={() => setIsSlideoverOpen(true)}
              className="bg-custom-blue text-white px-4 py-2.5 rounded-xl flex items-center gap-2 sm:text-sm whitespace-nowrap hover:bg-custom-blue/80 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              New Template
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
            <div className="flex w-24 justify-center items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setView('kanban')}
                className={`p-2 rounded-md transition-all duration-200 ${view === 'kanban'
                    ? 'bg-white text-custom-blue shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                  }`}
              >
                <KanbanSquare className="h-5 w-5" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-2 rounded-md transition-all duration-200 ${view === 'table'
                    ? 'bg-white text-custom-blue shadow-sm'
                    : 'text-gray-600 hover:bg-white/50'
                  }`}
              >
                <Table2 className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <div className="flex justify-end items-center">
                <div className="searchintabs relative w-96">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <button type="submit" className="p-1">
                      <Search className="text-custom-blue text-lg" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Interview Templates"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded h-10 focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue"
                  />
                </div>
                <div>
                  <span className="p-2 text-xl sm:text-sm md:text-sm">
                    {currentPage}/{totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`p-2 border border-gray-300 rounded hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="text-custom-blue text-xl" />
                  </button>
                  <button
                    className={`p-2 border border-gray-300 rounded hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ArrowRight className="text-custom-blue text-xl" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded relative">
                    <Filter className="text-custom-blue text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-9 pb-9">
        {isLoading ? (
         <Loading />
        ) : (
          <>
            {view === 'kanban' ? (
              <KanbanView
                templates={paginatedTemplates}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-x-auto">
                <table className="min-w-full table-auto divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                        Rounds
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                        Last Modified
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTemplates.map(template => (
                      <tr
                        key={template._id}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {template.templateName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.rounds?.length || 0} rounds
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${template.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : template.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                            }`}>
                            {template.status ? template.status.charAt(0).toUpperCase() + template.status.slice(1) : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatRelativeDate(template.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="relative">
                            <button
                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                              onClick={() => navigate(`/interview-templates/${template._id}`)}
                            >
                              ⋮
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {isSlideoverOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white sm:w-full md:w-1/2 lg:w-1/2 w-1/3 rounded-l-xl h-full flex flex-col">
            <div className="sticky rounded-tl-xl top-0 z-10 w-full flex justify-between items-center px-5 py-6 border-b-2 bg-gradient-to-r from-custom-blue to-custom-blue/80">
              <h2 className="text-2xl text-teal-50 font-semibold">New Template</h2>
              <button onClick={() => setIsSlideoverOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className='text-teal-50' />
              </button>
            </div>
            <form id="new-template-form" onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-4 sm:px-6 flex-1">
                <div className="space-y-6 pt-6 pb-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="templateTitle"
                      placeholder="e.g., Senior Front end Developer"
                      value={newTemplate.templateTitle}
                      onChange={handleTitleChange}
                      required
                      className="w-full mt-1 block border border-gray-300 rounded-md px-3 py-2 shadow-sm sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="label"
                      name="label"
                      placeholder="e.g., Senior_Front_End_Developer"
                      value={newTemplate.label}
                      readOnly
                      className="w-full mt-1 block border rounded-md sm:text-sm shadow-sm px-3 py-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      placeholder="Describe the purpose and structure of this interview template. (Minimum 20 characters required)"
                      value={newTemplate.description}
                      onChange={handleDescriptionChange}
                      rows="4"
                      minLength={20}
                      maxLength={300}
                      required
                      className={`w-full mt-1 block border border-gray-300 rounded-md sm:text-sm shadow-sm px-3 py-2 focus:outline-none ${newTemplate.description.length < 20 ? 'border-gray-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                        }`}
                    />
                    <div className="flex justify-between items-center w-full">
                      <div className="flex-grow">
                        {newTemplate.description.length < 20 && newTemplate.description.length > 0 && (
                          <span className="text-red-500 text-sm">
                            Minimum 20 characters required ({20 - newTemplate.description.length} more needed)
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{newTemplate.description.length}/300</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  onClick={() => setIsSlideoverOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="new-template-form"
                  className="inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-custom-blue hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewTemplates;