import React from 'react'
import { AiFillEdit } from 'react-icons/ai'
import { ToggleSwitch } from '../../../../../utils/SubscriptionValidations'

const SubscriptionView = () => {
  return (
    <div className='flex p-6  flex-col'>
        <div className='flex w-full justify-between items-center'>
        <h4 className='font-semibold text-xl text-[#217989] '>Subscription plan / <span className='text-black'>Base{}</span></h4>
        <button>
            <AiFillEdit />
        </button>
        </div>

         <div className="border-2 p-4 rounded-md ">
        
                {/* Basic Plan Details */}
                <div className="w-full pb-8 border-b-2 ">
                  <h2 className="font-semibold text-lg mb-2">Basic Plan Details:</h2>
                 
                 <div className='gap-4 flex flex-col'>
                  <div className="flex w-full  text-lg">
                    <div className="w-1/2 flex items-center ">
                      <span className="w-2/6 ">Plan ID</span>
                      <span className="text-gray-400">1234</span>
                    </div>
                    <div className="w-1/2 flex items-center ">
                    <span className="w-2/6 ">Plan Name</span>
                    <span className="text-gray-400">Base</span>
                   
                    </div>
                  </div>

                  <div className="w-1/2 flex items-center ">
                    <span className="w-2/6 ">Enity Type</span>
                    <span className="text-gray-400">Individual</span>
                    </div>
                    </div>
                </div>
        
                {/* User and License Limits */}
                <div className="pt-6 pb-8 w-full  border-b-2">
                  <h2 className="font-semibold text-lg mb-2">User and License Limits:</h2>
                  <div className="flex w-full gap-4">
        
                    <div className="w-1/2 flex items-center">
                      <label className="w-2/6 text-lg">Max Users<span className="text-red-500">*</span></label>
                      <div className="flex flex-col w-full">
                     
                      
                    
                      </div>
                    </div>
        
                    <div className="w-1/2 flex items-center">
                      <label className="w-2/6 text-lg">Max Licenses<span className="text-red-500">*</span></label>
                      <div className="flex flex-col w-full">
                     
                       
                  
                      </div>
                    </div>
                  </div>
                </div>
        
                {/* Interview Features */}
                <div className="pt-6 pb-8 w-full  border-b-2 mt-4">
                  <h2 className="font-semibold mb-2 text-lg">Interview Features:</h2>
                  <div className="flex w-full gap-4">
                    <div className="w-1/2  flex flex-col gap-4">
                      <div className="flex justify-between items-center  ">
                        <label className="w-2/6 text-lg">Interview Schedules Limit<span className="text-red-500">*</span></label>
                      <div className="flex flex-col w-full">
                       
                       
                   
                         </div>
                      </div>
        
                      <div className="flex justify-between items-center">
                        <label className="w-2/6 text-lg">Outsourced Interview Limit<span className="text-red-500">*</span></label>
                        <div className="flex flex-col w-full">
                       
                      
                        </div>
                      </div>
        
                      <div className="flex justify-between items-center" >
                        <label className="w-2/6 text-lg">Interview Panel Size<span className="text-red-500">*</span></label>
                        <div className="flex flex-col w-full">
                    
                     
                        </div>
                      </div>
        
                    </div>
        
                    <div className="w-1/2 flex flex-col gap-6 mt-5">
        
                   
                        <ToggleSwitch
                          label="Outsourced Interview Allowed"
                          name="outsourcedInterviewAllowed"
                        //   checked={formData.outsourcedInterviewAllowed}
                         
                          readOnly={true}
                        />
                     
        
                      <ToggleSwitch
                        label="Recurring Interviews"
                        name="recurringInterviews"
                        // checked={formData.recurringInterviews}
                       
                        readOnly={true}
                      />
                    </div>
        
                  </div>
                </div>
        
                {/* Mock and Assessment Features */}
                <div className="pt-6 pb-8 w-full  border-b-2">
                  <h2 className="font-semibold mb-4 text-lg">Mock and Assessment Features:</h2>
                  <div className="flex  gap-4">
                    <div className="w-1/2">
                      <ToggleSwitch
                        label="Mock Interview Access"
                        name="mockInterviewAccess"
                        // checked={formData.mockInterviewAccess}
                       
                        readOnly={true}
                      />
                    </div>
                    <div className="w-1/2">
                      <ToggleSwitch
                        label="Assessment Tests Access"
                        name="assessmentTestsAccess"
                        // checked={formData.assessmentTestsAccess}
                       
                        readOnly={true}
                      />
                    </div>
                  </div>
                </div>
        
                {/* Reporting and Analytics */}
                <div className="pt-6 pb-8 w-full  border-b-2">
                  <h2 className="font-semibold mb-4 text-lg">Reporting and Analytics:</h2>
        
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <ToggleSwitch
                        label="Feedback Reporting"
                        name="feedbackReporting"
                        // checked={formData.feedbackReporting}
                       
                        readOnly={true}
                      />
                    </div>
                    <div className="w-1/2">
                      <ToggleSwitch
                        label="Analytics Dashboard Access"
                        name="analyticsDashboardAccess"
                        // checked={formData.analyticsDashboardAccess}
                        
                        readOnly={true}
                      />
                    </div>
                  </div>
                </div>
        
                {/* Interview Features */}
                <div className="pt-6 pb-2 w-full  ">
                  <h2 className="font-semibold mb-2 text-lg">Interview Features:</h2>
                  <div className="flex flex-col gap-4" >
        
                    <div className="flex  gap-4 pb-6">
                      <div className="flex w-1/2 items-center">
                        <label className="w-2/5 text-lg">Bandwidth<span className="text-red-500">*</span></label>
                        <div className="w-full flex flex-col">
                       
                      
                        </div>
                      </div>
        
        
                      <div className="flex w-1/2 items-center ">
                        <ToggleSwitch
                          label="API Access"
                          name="apiAccess"
                        //   checked={formData.apiAccess}
                         
                          readOnly={true}
                        />
        
                      </div>
                    </div>
        
        
        
        
                    <div className="w-full flex gap-4">
        
                      <div className="w-1/2 flex items-center">
                        <label className="w-2/5 text-lg">Bandwidth<span className="text-red-500">*</span></label>
                        <select
                          name="videoQuality"
                        //   value={formData.videoQuality}
                       
                          className="border-b-2 p-1 w-full rounded"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
        
                      <div className="w-1/2">
        
                      <ToggleSwitch
                        label="Third Party Integrations"
                        name="thirdPartyIntegrations"
                        // checked={formData.thirdPartyIntegrations}
                       
                        readOnly={true}
                      />
                      </div>
                    </div>
                  </div>
                </div>
        
              </div>
        
    </div>
  )
}

export default SubscriptionView