// FeedbackFormModal.jsx
import React, {useState} from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Expand, Minimize } from 'lucide-react';
import { IoMdClose } from 'react-icons/io';
import CandidateMiniTab from './MiniTabs/Candidate';
import InterviewsMiniTabComponent from './MiniTabs/Interviews';
import FeedbackForm from '../../../videoCall/FeedbackForm';


const tabsList = [
  { id: 1, tab: "Candidate" },
  { id: 2, tab: "Interview Questions" },
  { id: 3, tab: "Feedback Form" },
];

const FeedbackFormModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { state } = location;
  const { mode = 'view', feedback } = state || {};
    

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const isEditMode = mode === 'edit';

  const isViewMode = mode === 'view';


  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };




  const displayData = () => {

    switch (activeTab) {
      case 1: 
        return <CandidateMiniTab isViewMode={isViewMode} />;
      case 2: 
        return <InterviewsMiniTabComponent 
          tab={true} 
          page="Popup" 
          closePopup={handleClose}
          isEditMode={isEditMode}
          isViewMode={isViewMode}
        />;
      case 3: 
        return <FeedbackForm 
          tab={true} 
          page="Popup"
          isEditMode={isEditMode}
          isViewMode={isViewMode}
        />;
      
      default: 
        return null;
    }
  };

  if (!feedback) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className={`${isFullScreen ? "w-[100%]" : "w-[50%]"} bg-gray-50 h-[100%] flex flex-col`}>
        <div className="px-8 flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-[#227a8a]">Interview Feedback</h1>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
            >
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-gray-500" />
              ) : (
                <Expand className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button 
              onClick={handleClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <IoMdClose size={20} />
            </button>
          </div>
        </div>
        
        <ul className="flex items-center gap-8 cursor-pointer py-1 px-8">
          {tabsList.map((EachTab) => (
            <li
              key={EachTab.id}
              onClick={() => setActiveTab(EachTab.id)}
              className={`pb-2 ${activeTab === EachTab.id ? "border-b-2 border-[#227a8a]" : ""}`}
            >
              {EachTab.tab}
            </li>
          ))}
        </ul>
        
        <div className="flex-1 overflow-y-auto">
          {displayData()}
        </div>
      </div>
    </div>
  );
};

export default FeedbackFormModal;