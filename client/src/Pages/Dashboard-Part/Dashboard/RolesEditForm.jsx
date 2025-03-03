import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdArrowDropDown } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { validateRolesForm } from "../../../utils/RolesFormValidation";

const RolesEditForm = ({ role, onClose, onRoleUpdated }) => {
  const [formData, setFormData] = useState({
    roleName: role.roleName || "",
    reportsToRole: role.reportsToRoleId ? role.reportsToRoleId.roleName : "",
    description: role.description || "",
    label: role.label || "",
  });

  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState(formData.reportsToRole);
  const [showDropdownRole, setShowDropdownRole] = useState(false);
  const roles = ["Manager", "Admin", "CEO", "HR Lead"]; // Example roles

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear the error for the specific field
    }));
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowDropdownRole(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      reportsToRole: role,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      reportsToRole: "",
    }));
  };

  const toggleDropdownRole = () => {
    setShowDropdownRole(!showDropdownRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateRolesForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Form validation failed:", newErrors);
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/rolesdata/${role._id}`, formData);
      if (response.data) {
        onRoleUpdated();
      }
      onClose();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="fixed top-0 w-full bg-white border-b">
      <div className="flex justify-between sm:justify-start items-center p-4">
        <button onClick={onClose} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
          <IoArrowBack className="text-2xl" />
        </button>
        <h2 className="text-lg font-bold">Edit Role</h2>
        <button type="button" onClick={onClose} className="focus:outline-none sm:hidden">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="fixed top-16 bottom-16 overflow-auto p-4 w-full text-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-5 mb-5">
            <div>
              <label htmlFor="roleName" className="block mb-2 text-sm font-medium text-gray-900 w-36">
                Role Name <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                value={formData.roleName}
                onChange={handleChange}
                name="roleName"
                type="text"
                id="roleName"
                className={`border-b focus:outline-none mb-5 w-full ${errors.roleName ? "border-red-500" : "border-gray-300 focus:border-black"}`}
              />
              {errors.roleName && <p className="text-red-500 text-sm -mt-4">{errors.roleName}</p>}
            </div>
          </div>

          <div className="flex gap-5 mb-5 text-sm">
            <div>
              <label htmlFor="reportsToRole" className="block mb-2 font-medium text-gray-900 w-36">
                Reports To Role <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="relative flex-grow">
              <input
                type="text"
                className={`border-b focus:outline-none mb-5 w-full ${errors.reportsToRole ? "border-red-500" : "border-gray-300 focus:border-black"}`}
                value={selectedRole}
                onClick={toggleDropdownRole}
                readOnly
              />
              <div className="absolute right-0 top-0" onClick={toggleDropdownRole}>
                <MdArrowDropDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
              </div>
              {errors.reportsToRole && <p className="text-red-500 text-sm -mt-4">{errors.reportsToRole}</p>}
            </div>
            {showDropdownRole && (
              <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg h-40 overflow-y-auto">
                {roles.map((role) => (
                  <div key={role} className="py-2 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleRoleSelect(role)}>
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-5 mb-5">
            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black w-36">
                Description
              </label>
            </div>
            <div className="flex-grow">
              <textarea
                rows={8}
                onChange={handleChange}
                value={formData.description}
                name="description"
                id="description"
                className="border p-2 focus:outline-none mb-5 w-full rounded-md"
              ></textarea>
              {formData.description.length > 0 && <p className="text-gray-600 text-sm float-right -mt-4">{formData.description.length}/1000</p>}
            </div>
          </div>

          <div className="footer-buttons flex justify-end">
            <button type="submit" className="footer-button bg-custom-blue">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesEditForm;