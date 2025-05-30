import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Tab } from '@headlessui/react';
import {Minimize,Expand,ChevronDown,X} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AssessmentsTab from './Assessment-View-AssessmentTab.jsx';
import AssessmentResultsTab from './AssessmentResultTab.jsx';
import DetailsTab from './AssessmentDetailTab.jsx';
import QuestionsTab from './AsseessmentQuestionsTab.jsx';
import Activity from '../../../Tabs/CommonCode-AllTabs/Activity.jsx';
import { useCustomContext } from '../../../../../Context/Contextfetch.js';
import { config } from '../../../../../config.js';

function AssessmentView() {
  const { assessmentData } = useCustomContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [toggleStates, setToggleStates] = useState([]);

  const toggleArrow1 = (index) => {
    setToggleStates((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const foundAssessment = assessmentData?.find((a) => a._id === id);

      if (foundAssessment) {
        setAssessment(foundAssessment);
        setIsModalOpen(true);
      }
    };

    loadData();
  }, [id, assessmentData]);

  useEffect(() => {
    if (assessment) {
      axios
        .get(`${config.REACT_APP_API_URL}/assessment-questions/list/${assessment._id}`)
        .then((response) => {
          if (response.data.success) {
            const data = response.data.data;
            setAssessmentQuestions(data);
            setToggleStates(new Array(data.sections.length).fill(false));
          }
        })
        .catch((error) => {
          console.error('Error fetching assessment questions:', error);
        });
    }
  }, [assessment]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const tabs = [
    {
      id: 'Details',
      name: 'Details',
      icon: '📋',
      content: <DetailsTab assessment={assessment} assessmentQuestions={assessmentQuestions} />,
    },
    {
      id: 'Questions',
      name: 'Questions',
      icon: '❓',
      content: (
        <QuestionsTab
          sections={assessmentQuestions.sections || []}
          toggleStates={toggleStates}
          toggleArrow1={toggleArrow1}
        />
      ),
    },
    {
      id: 'Assessments',
      name: 'Assessments',
      icon: '📑',
      content: <AssessmentsTab assessment={assessment} />,
    },
    {
      id: 'Results',
      name: 'Results',
      icon: '📈',
      content: (
        <AssessmentResultsTab
          assessment={assessment}
          toggleStates={toggleStates}
          toggleArrow1={toggleArrow1}
          isFullscreen={isFullscreen}
          assessmentQuestions={assessmentQuestions}
        />
      ),
    },
    {
      id: 'Activity',
      name: 'Activity',
      icon: '📊',
      content: <Activity parentId={id} />,
    },
  ];

  if (!assessment) return <div className="text-center items-center">Loading assessment details...</div>;

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleCloseModal}
          />
          <div
            className={`fixed inset-y-0 right-0 flex max-w-full ${
              isFullscreen ? 'w-full' : 'w-1/2'
            } transition-all duration-300`}
          >
            <div className="w-full relative">
              <div className="h-full bg-white shadow-xl flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Assessment Template Details</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Expand className="w-5 h-5 text-gray-500" />
                  )}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <Tab.List className="flex space-x-3 border-b border-gray-200 px-2">
                      {tabs.map((tab, idx) => (
                        <Tab
                          key={idx}
                          className={({ selected }) =>
                            `py-4 px-4 text-sm font-medium border-b-2 focus:outline-none flex items-center ${
                              selected
                                ? 'border-custom-blue text-custom-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`
                          }
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.name}
                        </Tab>
                      ))}
                    </Tab.List>
                    <Tab.Panels className="p-4">
                      {tabs.map((tab, idx) => (
                        <Tab.Panel key={idx} className="focus:outline-none">
                          {tab.content}
                        </Tab.Panel>
                      ))}
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssessmentView;