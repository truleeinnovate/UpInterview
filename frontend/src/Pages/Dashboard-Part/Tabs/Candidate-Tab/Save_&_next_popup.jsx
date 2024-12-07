import Sidebar from './Save&schedule_schedulelater';
import Sidebar1 from './save&schedule_instant';
import { useState, useRef, useEffect, useCallback } from "react";

import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';

const Popup = ({ onClosepopup , lastName}) => {

    const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(true);
    

  };
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOutsideClick = useCallback((event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
  },[]);

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sidebarOpen, handleOutsideClick]);

  const [sidebarOpen1, setSidebarOpen1] = useState(false);
  const sidebarRef1 = useRef(null);

  const toggleSidebar1 = () => {
    setSidebarOpen1(true);

  };

  const closeSidebar1 = () => {
    setSidebarOpen1(false);
  };

  const handleOutsideClick1 = useCallback((event) => {
    if (sidebarRef1.current && !sidebarRef1.current.contains(event.target)) {
      closeSidebar1();
    }
  },[]);

  useEffect(() => {
    if (sidebarOpen1) {
      document.addEventListener('mousedown', handleOutsideClick1);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick1);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick1);
    };
  }, [sidebarOpen1, handleOutsideClick1]);

    return (
        <>
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-15">
            <div className="relative bg-white p-5 rounded-lg border shadow-lg h-48 text-center" style={{width:"45%"}}>
                <div onClick={onClosepopup} className="absolute top-2 right-2 cursor-pointer">
                    <FaTimes className="text-gray-500" size={20} />
                </div>
                <div className="p-4 relative">
                  <div className="modal-body mt-6 flex flex-col items-center space-y-3">
                    <div>
                      <button className="bg-gray-100 text-black text-lg w-48 p-1 rounded hover:bg-gray-200"
                        onClick={() => {
                          toggleSidebar();
                        }}
                      >
                        Schedule for Later
                      </button>
                    </div>
                    <div>
                      <button className="bg-gray-100 text-black text-lg w-48 p-1 rounded hover:bg-gray-200"
                        onClick={() => {
                          toggleSidebar1();
                        }}
                      >
                        Instant Interview
                      </button>
                    </div>
                  </div>
                </div>
            </div>
        </div>
         <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onOutsideClick={handleOutsideClick} lastName={lastName} ref={sidebarRef} setSidebarOpen={setSidebarOpen} />
         <Sidebar1 isOpen1={sidebarOpen1} onClose1={closeSidebar1} onOutsideClick1={handleOutsideClick1} lastName={lastName} ref={sidebarRef1} setSidebarOpen1={setSidebarOpen1} />
        </>
    );
};
export default Popup;