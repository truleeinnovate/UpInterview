import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup";
import { notify } from "../../../services/toastService.js";
import { useInterviewPolicies } from "../../../apiHooks/useInterviewPolicies.js";

const InterviewPolicyForm = ({ onClose, mode }) => {
  const { createPolicy, getPolicy, updatePolicy, isLoading } =
    useInterviewPolicies();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    policyName: "",
    category: "INTERVIEW",
    type: "CANCEL",
    timeBeforeInterviewMin: 0,
    timeBeforeInterviewMax: "",
    feePercentage: 0,
    interviewerPayoutPercentage: 0,
    platformFeePercentage: 0,
    firstRescheduleFree: false,
    gstIncluded: true,
    status: "Active",
  });

  useEffect(() => {
    if (mode === "Edit" && id) {
      const fetchPolicy = async () => {
        try {
          const response = await getPolicy(id);
          const policyData = response?.policy;

          if (policyData) {
            setFormData({
              ...policyData,
              // Fallback for null/undefined values to maintain controlled inputs
              timeBeforeInterviewMax: policyData.timeBeforeInterviewMax ?? "",
              policyName: policyData.policyName || "",
              category: policyData.category || "INTERVIEW",
              type: policyData.type || "CANCEL",
              status: policyData.status || "Active",
            });
          }
        } catch (err) {
          alert("Error fetching policy details");
          onClose();
        }
      };
      fetchPolicy();
    }
  }, [mode, id, getPolicy, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up data (convert strings to numbers)
      const payload = {
        ...formData,
        timeBeforeInterviewMin: Number(formData.timeBeforeInterviewMin),
        timeBeforeInterviewMax: formData.timeBeforeInterviewMax
          ? Number(formData.timeBeforeInterviewMax)
          : undefined,
        feePercentage: Number(formData.feePercentage),
        interviewerPayoutPercentage: Number(
          formData.interviewerPayoutPercentage
        ),
        platformFeePercentage: Number(formData.platformFeePercentage),
      };

      // --- 2. Switch between Create and Update ---
      if (mode === "Edit" && id) {
        await updatePolicy({ id, updateData: payload });
        notify.success("Policy updated successfully!");
      } else {
        await createPolicy(payload);
        notify.success("Policy created successfully!");
      }

      navigate(-1);
    } catch (err) {
      notify.error("Error creating policy");
    }
  };

  return (
    <SidebarPopup
      title={
        mode === "Edit" ? "Edit Interview Policy" : "Create Interview Policy"
      }
      onClose={() => navigate(-1)}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Policy Name */}
        <div>
          <label className="block text-sm font-medium">
            Policy Name (Unique)
          </label>
          <input
            required
            name="policyName"
            value={formData.policyName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="e.g., Late Cancel - 24 Hours"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="INTERVIEW">INTERVIEW</option>
              <option value="MOCK">MOCK</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium">Action Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="CANCEL">CANCEL</option>
              <option value="RESCHEDULE">RESCHEDULE</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Time Min */}
          <div>
            <label className="block text-sm font-medium">
              Min Minutes Before
            </label>
            <input
              type="number"
              name="timeBeforeInterviewMin"
              value={formData.timeBeforeInterviewMin}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          {/* Time Max */}
          <div>
            <label className="block text-sm font-medium">
              Max Minutes Before
            </label>
            <input
              type="number"
              name="timeBeforeInterviewMax"
              value={formData.timeBeforeInterviewMax}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <hr />

        {/* Percentages */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium">Fee %</label>
            <input
              type="number"
              name="feePercentage"
              value={formData.feePercentage}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Interviewer %</label>
            <input
              type="number"
              name="interviewerPayoutPercentage"
              value={formData.interviewerPayoutPercentage}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Platform %</label>
            <input
              type="number"
              name="platformFeePercentage"
              value={formData.platformFeePercentage}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="firstRescheduleFree"
              checked={formData.firstRescheduleFree}
              onChange={handleChange}
              className="accent-custom-blue"
            />
            <span className="text-sm">First Reschedule Free?</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="gstIncluded"
              checked={formData.gstIncluded}
              onChange={handleChange}
              className="accent-custom-blue"
            />
            <span className="text-sm">GST Included in %?</span>
          </label>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-custom-blue text-white py-2 rounded hover:bg-custom-blue disabled:bg-gray-400"
        >
          {isLoading
            ? "Saving..."
            : mode === "Edit"
            ? "Update Policy"
            : "Create Policy"}
        </button>
      </form>
    </SidebarPopup>
  );
};

export default InterviewPolicyForm;
