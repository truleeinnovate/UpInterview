import React from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core';
import { ReactComponent as CgInfo } from '../../../../icons/CgInfo.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Timer, XCircle, Laptop, Hourglass, UserCheck, Clock } from 'lucide-react';

const MockInterviewKanban = ({ mockinterviews, mockinterviewData, loading, mockinterviewDataView, onRescheduleClick, onCancel }) => {

  const navigate = useNavigate();
  const location = useLocation();
  return (
    <DndContext collisionDetection={closestCenter}>


      <div className="w-full  bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Mock Interviews</h3>
          <span className="px-2 py-1 bg-white rounded-lg text-sm text-gray-600 shadow-sm">
            {mockinterviewData?.length} Interviews
          </span>
        </div>


        {loading ? (
          <div className="py-10 text-center">
            <div className="wrapper12">
              <div className="circle12"></div>
              <div className="circle12"></div>
              <div className="circle12"></div>
              <div className="shadow12"></div>
              <div className="shadow12"></div>
              <div className="shadow12"></div>
            </div>
          </div>
        ) : mockinterviewData.length === 0 ? (
          <div className="py-10 text-center">
            <div className="flex flex-col items-center justify-center p-5">
              <p className="text-9xl rotate-180 text-blue-500">
                <CgInfo />
              </p>
              <p className="text-center text-lg font-normal">
                You don't have mockinterview yet. Create new
                mockinterview.
              </p>
              <p

                onClick={() => navigate('/mockinterview-create')}
                className="mt-3 cursor-pointer text-white bg-blue-400 px-4 py-1 rounded-md"
              >
                Add Schedule
              </p>
            </div>
          </div>
        ) : mockinterviews.length === 0 ? (
          <div className="col-span-3 py-10 text-center">
            <p className="text-lg font-normal">
              No data found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
            {mockinterviews.map((mockinterview) => (
              <div key={mockinterview._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >


                {/* interview card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">

                    <div className="ml-3"
                    //   onClick={() =>
                    //     handleMockInterviewClick(mockinterview)
                    //   }
                    >
                      <h4 className="text-sm font-medium text-gray-900">{mockinterview?.rounds?.roundTitle || '?'}</h4>

                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/mockinterview-details/${mockinterview._id}`, { state: { from: location.pathname } })}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>


                    {/* <button
                onClick={() => position?._id && navigate(`/candidate/${position._id}`)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="360° View"
              >
                <FaUserCircle className="w-4 h-4" />
              </button> */}

                    <button
                      onClick={() => navigate(`/mock-interview/${mockinterview._id}/edit`, { state: { from: location.pathname } })}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>


                    <button
                      onClick={() => onRescheduleClick(mockinterview)}
                      className="p-1.5  hover:bg-gray-50 rounded-lg transition-colors"
                      title="Open in New Tab"
                    >
                      <Timer className="w-4 h-4 text-custom-blue" />
                    </button>

                    <button
                      onClick={() => onCancel()}
                      className="p-1.5 text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Open in New Tab"
                    >
                      <XCircle className="w-4 h-4 " />
                    </button>

                  </div>

                </div>

                <div className="space-y-2 text-sm">


                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Laptop className="w-4 h-4 text-gray-500" />
                      <div>{mockinterview?.technology || "N/A"}</div>
                    </div>


                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Hourglass  className="w-4 h-4 text-gray-500" />
                      <span>{mockinterview?.rounds?.status || "N/A"}</span>
                    </div>
                    <div>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      <span>{mockinterview.interviewer}</span>
                    </div>


                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{mockinterview?.createdDate.split(" ")[0] || "N/A"}</span>
                    </div>
                    <div>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Timer className="w-4 h-4 text-gray-500" />
                      <span>{mockinterview?.rounds?.duration || "N/A"} mints</span>
                    </div>
                    <div>
                    </div>
                  </div>





                  {/* <div className="absolute right-2 bottom-0 ">
                                    {mockinterview.Status === "Scheduled" && (
                                      <>
                                        <Tooltip
                                          title="Scheduled"
                                          enterDelay={300}
                                          leaveDelay={100}
                                          arrow
                                        >
                                          <span>
                                            <WiTime4 className="text-3xl ml-1 mr-1 text-yellow-300" />
                                          </span>
                                        </Tooltip>
                                      </>
                                    )}
                                    {mockinterview.Status ===
                                      "ScheduleCancel" && (
                                        <>
                                          <Tooltip
                                            title="Cancel"
                                            enterDelay={300}
                                            leaveDelay={100}
                                            arrow
                                          >
                                            <span>
                                              <MdCancel className="text-3xl ml-1 mr-1 text-red-500" />
                                            </span>
                                          </Tooltip>
                                        </>
                                      )}
                                    {mockinterview.Status === "ReSchedule" && (
                                      <>
                                        <Tooltip
                                          title="Reschedule"
                                          enterDelay={300}
                                          leaveDelay={100}
                                          arrow
                                        >
                                          <span>
                                            <GrPowerReset className="text-3xl ml-1 mr-1 text-violet-500" />
                                          </span>
                                        </Tooltip>
                                      </>
                                    )}
                                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* </div> */}
    </DndContext>
  )
}

export default MockInterviewKanban