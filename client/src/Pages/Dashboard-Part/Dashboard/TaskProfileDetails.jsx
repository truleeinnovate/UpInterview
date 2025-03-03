import React, { useState,useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";


const TaskProfileDetails =  ({task, onClosetask}) => {
    const [showMainContent, setShowMainContent] = useState(true);
    useEffect(() => {
        document.title = "Task Profile Details";
      }, []);
      const navigate = useNavigate();
      const location = useLocation();
      const handleNavigate = () => {
        navigate("/Task", { state: { task } });
      };
    
    return (
        <>
          {showMainContent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
               <div
              className="bg-white shadow-lg overflow-auto w-[97%] h-[94%] sm:w-[100%] sm:h-[100%]"
            >
                <div className="border-b p-2">
                <div className="md:mx-8 lg:mx-8 xl:mx-8 sm:mx-1 my-3 flex justify-between sm:justify-start items-center">
                <button className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden" onClick={onClosetask}>
                    <IoArrowBack className="text-xl" />
                  </button>
                  <p className="text-xl">
                      <span
                        className="text-orange-500 font-semibold cursor-pointer"
                        onClick={handleNavigate}
                      >
                     Task
                      </span>{" "}
                      /
                     
                    </p>
                    {/* Cancel icon */}
                    <button
                    className="shadow-lg rounded-full sm:hidden"
                    onClick={onClosetask}
                    >
                      <MdOutlineCancel className="text-2xl" />
                    </button>
                  </div>
                </div>
                <>
                {/* <div className="mx-10 pt-5 pb-2 sm:hidden md:hidden">
                    <button className=" text-gray-500 mr-20"
                   
                    >
                      Edit
                    </button>
                  </div> */}
                  <div className="mx-16 mt-7 grid grid-cols-4">
                    <div className="col-span-3">
                    <div className="flex mb-5">
                        {/*  Task ID */}
                        <div className="w-1/3 sm:w-1/2">
                          <div className="font-medium">Task ID</div>
                        </div>
                        <div className="w-1/3 sm:w-1/2">
                          <p>
                            <span className="font-normal">{task.title}</span>
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
                            <span className="font-normal">{task.assigned}</span>
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
                            <span className="font-normal">{task.priority}</span>
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
                            <span className="font-normal">{task.status}</span>
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
                            <span className="font-normal">{task.dueDate}</span>
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
                            <span className="font-normal"></span>
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
                
                </>
              </div>
            </div>
          )
          }
    
        </>
      )
}

export default TaskProfileDetails