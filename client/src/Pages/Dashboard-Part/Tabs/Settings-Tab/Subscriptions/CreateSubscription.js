import React, { useState } from "react";
import { ToggleSwitch, validate } from "../../../../../utils/SubscriptionValidations";



// Main Component
const SubscriptionPlan = () => {
  const [formData, setFormData] = useState({
    planName: "",
    entityType: "",
    maxUsers: "",
    maxLicenses: "",
    interviewSchedulesLimit: "",
    outsourcedInterviewAllowed: false,
    outsourcedInterviewLimit: "",
    recurringInterviews: false,
    interviewPanelSize: "",
    mockInterviewAccess: false,
    assessmentTestsAccess: false,
    feedbackReporting: false,
    analyticsDashboardAccess: false,
    bandwidth: "",
    apiAccess: false,
    videoQuality: "low",
    thirdPartyIntegrations: false,
  });

  const [errors, setErrors] = useState({});

  // Handle input and toggle changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(formData,setErrors)) {
      console.log(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription Plan</h1>

      <div className="border-2 p-4 rounded-md ">

        {/* Basic Plan Details */}
        <div className="w-full pb-8 border-b-2">
          <h2 className="font-semibold text-lg mb-2">Basic Plan Details:</h2>
          <div className="flex w-full gap-4">
            <div className="w-1/2 flex items-center">
              <label className="w-2/6 text-lg">Plan Name<span className="text-red-500">*</span></label>
              <div className="flex flex-col w-full">
              <input
                type="text"
                name="planName"
                value={formData.planName}
                onChange={handleChange}
                placeholder="Plan Name"
                // required
                className="border-b-2 p-1   focus:outline-none"
              />
               {errors.planName && <p className="text-red-500 text-sm pt-1">{errors.planName}</p>}
               </div>
          
            </div>
            <div className="w-1/2 flex items-center ">
              <label className="w-2/6 text-lg">Enity Type<span className="text-red-500">*</span></label>
              <div className="flex flex-col w-full">
              <input
                type="text"
                name="entityType"
                value={formData.entityType}
                onChange={handleChange}
                placeholder="Entity Type"
                // required
                className="border-b-2 p-1  focus:outline-none"
              />
                {errors.entityType && <p className="text-red-500 text-sm pt-1">{errors.entityType}</p>}
                </div>
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
              <input
                type="number"
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleChange}
                placeholder="Max Users"
                // required
                className="border-b-2 p-1  focus:outline-none "
              />
               {errors.maxUsers && <p className="text-red-500 text-sm pt-1">{errors.maxUsers}</p>}
            
              </div>
            </div>

            <div className="w-1/2 flex items-center">
              <label className="w-2/6 text-lg">Max Licenses<span className="text-red-500">*</span></label>
              <div className="flex flex-col w-full">
              <input
                type="number"
                name="maxLicenses"
                value={formData.maxLicenses}
                onChange={handleChange}
                placeholder="Max Licenses"
                // required
                className="border-b-2 p-1   focus:outline-none"
              />
               {errors.maxLicenses && <p className="text-red-500  pt-1 text-sm">{errors.maxLicenses}</p>}
          
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
                <input
                  type="number"
                  name="interviewSchedulesLimit"
                  value={formData.interviewSchedulesLimit}
                  onChange={handleChange}
                  placeholder="Interview Schedules Limit"
                  // required
                  className="border-b-2 p-1   focus:outline-none"
                />
                 {errors.interviewSchedulesLimit && <p className="text-red-500 text-sm pt-1">{errors.interviewSchedulesLimit}</p>}
           
                 </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="w-2/6 text-lg">Outsourced Interview Limit<span className="text-red-500">*</span></label>
                <div className="flex flex-col w-full">
                <input
                  type="number"
                  name="outsourcedInterviewLimit"
                  value={formData.outsourcedInterviewLimit}
                  onChange={handleChange}
                  placeholder="Outsourced Interview Limit"
                  // required
                  className="border-b-2 p-1  focus:outline-none"
                />
                 {errors.outsourcedInterviewLimit && <p className="text-red-500 text-sm pt-1">{errors.outsourcedInterviewLimit}</p>}
              
                </div>
              </div>

              <div className="flex justify-between items-center" >
                <label className="w-2/6 text-lg">Interview Panel Size<span className="text-red-500">*</span></label>
                <div className="flex flex-col w-full">
                <input
                  type="number"
                  name="interviewPanelSize"
                  value={formData.interviewPanelSize}
                  onChange={handleChange}
                  placeholder="Interview Panel Size"
                  // required
                  className="border-b-2 p-1   focus:outline-none"
                />
                  {errors.interviewPanelSize && <p className="text-red-500 text-sm pt-1">{errors.interviewPanelSize}</p>}
             
                </div>
              </div>

            </div>

            <div className="w-1/2 flex flex-col gap-6 mt-5">

           
                <ToggleSwitch
                  label="Outsourced Interview Allowed"
                  name="outsourcedInterviewAllowed"
                  checked={formData.outsourcedInterviewAllowed}
                  onChange={handleChange}
                  readOnly={false}
                />
             

              <ToggleSwitch
                label="Recurring Interviews"
                name="recurringInterviews"
                checked={formData.recurringInterviews}
                onChange={handleChange}
                readOnly={false}
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
                checked={formData.mockInterviewAccess}
                onChange={handleChange}
                readOnly={false}
              />
            </div>
            <div className="w-1/2">
              <ToggleSwitch
                label="Assessment Tests Access"
                name="assessmentTestsAccess"
                checked={formData.assessmentTestsAccess}
                onChange={handleChange}
                readOnly={false}
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
                checked={formData.feedbackReporting}
                onChange={handleChange}
                readOnly={false}
              />
            </div>
            <div className="w-1/2">
              <ToggleSwitch
                label="Analytics Dashboard Access"
                name="analyticsDashboardAccess"
                checked={formData.analyticsDashboardAccess}
                onChange={handleChange}
                readOnly={false}
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
                <input
                  type="text"
                  name="bandwidth"
                  value={formData.bandwidth}
                  onChange={handleChange}
                  placeholder="Bandwidth"
                  // required
                  className="border-b-2 p-1 w-full  focus:outline-none"
                />
                {errors.bandwidth && <p className="text-red-500 pt-1 text-sm">{errors.bandwidth}</p>}
              
                </div>
              </div>


              <div className="flex w-1/2 items-center ">
                <ToggleSwitch
                  label="API Access"
                  name="apiAccess"
                  checked={formData.apiAccess}
                  onChange={handleChange}
                  readOnly={false}
                />

              </div>
            </div>




            <div className="w-full flex gap-4">

              <div className="w-1/2 flex items-center">
                <label className="w-2/5 text-lg">Bandwidth<span className="text-red-500">*</span></label>
                <select
                  name="videoQuality"
                  value={formData.videoQuality}
                  onChange={handleChange}
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
                checked={formData.thirdPartyIntegrations}
                onChange={handleChange}
                readOnly={false}
              />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Submit Button */}
      <div className="text-right mt-2">
      <button
        type="submit"
        className="bg-[#217989] text-white px-8 py-2 rounded "
      >
        Save
      </button>
      </div>


    </form>
  );
};

export default SubscriptionPlan;
