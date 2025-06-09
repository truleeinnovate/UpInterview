import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Modal from 'react-modal';
import classNames from 'classnames';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';




const TaskProfileDetails =  ({task, onClosetask}) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const navigate = useNavigate();
    const [showMainContent] = useState(true);
    useEffect(() => {
        document.title = "Task Profile Details";
      }, []);

    const handleClose = () => {
          navigate('/task');
        };
      
        const modalClass = classNames(
          'fixed bg-white shadow-2xl border-l border-gray-200',
          {
            'inset-0': isFullScreen,
            'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
          }
        );
    return (
        <>
        <Modal
              isOpen={true}
              onRequestClose={handleClose}
              className={modalClass}
              overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
            >
              <div className={classNames('flex flex-col h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}> 
                <div className="p-4 sm:p-6 flex justify-between items-center mb-6 bg-white z-50 pb-4">
                  <h2 className="text-lg sm:text-2xl font-bold">Task Profile Details</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      {isFullScreen ? (
                        <ArrowsPointingInIcon className="h-5 w-5" />
                      ) : (
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {showMainContent && (
            <div className="mx-16 mt-7 grid grid-cols-4">
            <div className="col-span-3">
            <div className="flex mb-5">
                {/*  Task ID */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Task ID</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{task._id}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/*  Title */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Title</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{task.title}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Assigned To*/}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Assigned To</div>
                </div> 
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{task.assignedTo}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Priority */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Priority</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{task.priority}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Status */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Status</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{task.status}</span>
                  </p>
                </div>
              </div>

              <div className="flex mb-5">
                {/* Due Date */}
                <div className="w-1/3 sm:w-1/2">
                  <div className="font-medium">Due Date</div>
                </div>
                <div className="w-1/3 sm:w-1/2">
                  <p>
                    <span className="font-normal">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

          
            </div>
            {/* <div className="col-span-1">
              <div>
                <div className="flex justify-end text-center mt-3">
                  <div>
                    <img className="w-32 h-32" src={task.image} alt="" />
                  </div>
                </div>
              </div>
            </div> */}
          </div>
          )
          }
              </div>
            </Modal>
    
        </>
      )
}

export default TaskProfileDetails