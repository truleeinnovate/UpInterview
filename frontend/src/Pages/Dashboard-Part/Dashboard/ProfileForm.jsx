import React, { useState, useEffect } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import axios from 'axios';
import { fetchMasterData } from '../../../utils/fetchMasterData';

const ProfileForm = ({ onClose, onDataAdded }) => {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isObjectsTableVisible, setIsObjectsTableVisible] = useState(true);
  const [tabsData, setTabsData] = useState([]);
  const [objectsData, setObjectsData] = useState([]);
  const [formData, setFormData] = useState({
    label: '',
    Name: '',
    Description: '',
    Tabs: [],
    Objects: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchObjectsData = async () => {
      try {
        const data = await fetchMasterData('api/objects');
        setObjectsData(data.objects);
      } catch (error) {
        console.error('Error fetching objects data:', error);
      }
    };

    const fetchTabsData = async () => {
      try {
        const data = await fetchMasterData('api/tabs');
        setTabsData(data.tabs);
      } catch (error) {
        console.error('Error fetching tabs data:', error);
      }
    };

    fetchObjectsData();
    fetchTabsData();
  }, []);

  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  const toggleObjectsTableVisibility = () => {
    setIsObjectsTableVisible(!isObjectsTableVisible);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Remove error if a valid value is entered
    if (value) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTabChange = (index, value) => {
    const updatedTabs = [...formData.Tabs];
    updatedTabs[index] = { name: tabsData[index], status: value || 'Hidden' };
    setFormData({
      ...formData,
      Tabs: updatedTabs
    });

    if (value) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.Tabs;
        return newErrors;
      });
    }
  };


  const handleObjectChange = (index, field, value) => {
    const updatedObjects = [...formData.Objects];
    if (!updatedObjects[index]) {
      updatedObjects[index] = { name: objectsData[index], permissions: { View: false, Create: false, Edit: false, Delete: false } };
    }
    updatedObjects[index].permissions[field] = value;
    setFormData({
      ...formData,
      Objects: updatedObjects
    });

    // Remove error if a valid selection is made
    if (value) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.Objects;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const labelRegex = /^[a-zA-Z0-9_ ]*$/;
    const nameRegex = /^[a-zA-Z0-9_]*$/;

    if (!formData.label) {
      newErrors.label = 'Label is required.';
    } else if (!labelRegex.test(formData.label)) {
      newErrors.label = 'Label cannot contain special characters.';
    }

    if (!formData.Name) {
      newErrors.Name = 'Name is required.';
    } else if (!nameRegex.test(formData.Name)) {
      newErrors.Name = 'Name cannot contain spaces or special characters.';
    }

    if (formData.Tabs.length !== tabsData.length || formData.Tabs.some(tab => !tab.status)) {
      newErrors.Tabs = 'Please select a status for each tab.';
    }

    if (formData.Objects.length === 0) {
      newErrors.Objects = 'Please select at least one object.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, formData);
      if (response.data) {
        onDataAdded();
      }
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button onClick={onClose} className="text-xl flex items-center">
          <IoMdArrowRoundBack />
          <span className="ml-2">Profile</span>
        </button>
        <div className="flex-1"></div>
      </div>

      {/* Form */}
      <div className="fixed top-16 bottom-16 overflow-auto p-5 text-sm w-full">
        <form onSubmit={handleSubmit}>
          {/* Label Name */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="label"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Label <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="label"
                id="label"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-80 border-gray-300 focus:border-black"
              />
              {errors.label && <p className="text-red-500 text-sm">{errors.label}</p>}
            </div>
          </div>

          {/* Name */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="Name"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Name <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="Name"
                id="Name"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-80 border-gray-300 focus:border-black"
              />
              {errors.Name && <p className="text-red-500 text-sm">{errors.Name}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="flex gap-5 mb-5">
            <div>
              <label
                htmlFor="Description"
                className="block text-sm font-medium leading-6 text-gray-900 w-36"
              >
                Description
              </label>
            </div>
            <div className="flex-grow">
              <input
                type="text"
                name="Description"
                id="Description"
                autoComplete="off"
                onChange={handleChange}
                className="border-b focus:outline-none mb-5 w-80 border-gray-300 focus:border-black"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Assign Permissions</h3>
            
            {errors.Tabs && <p className="text-red-500 text-sm px-4">{errors.Tabs}</p>}
            <div className="border border-gray-300 mb-4 w-96 rounded-md">
              <div className="flex justify-between items-center py-2 px-4">
                <h4 className="text-xl font-semibold">Tabs</h4>
                <p className="text-sm cursor-pointer" onClick={toggleTableVisibility}>
                  <FaAngleDown />
                </p>
              </div>
              <div className="border-b "></div>
              
              {isTableVisible && (
                <table className="w-full mb-4 border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-sm border-b border-r p-2">
                        Tabs
                        <select className="text-sm p-1 ml-10 border-none">
                          <option>System Tab</option>
                          <option>Custom Tab</option>
                          <option>Master Tab</option>
                        </select>
                      </th>
                      <th className="text-center text-sm border-b  pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabsData.map((tab, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 border-r">{tab}</td>
                        <td className="py-2">
                          <select
                            className="border-none text-center p-1"
                            onChange={(e) => handleTabChange(index, e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="Visible">Visible</option>
                            <option value="Hidden">Hidden</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {errors.Objects && <p className="text-red-500 text-sm px-4">{errors.Objects}</p>}
            <div className="border w-full rounded-md">
              
              <div className="flex justify-between items-center px-4 py-2">
                <h4 className="text-md font-semibold">Objects</h4>

                <p className="text-sm cursor-pointer" onClick={toggleObjectsTableVisibility}>
                  <FaAngleDown />
                </p>
              </div>
              <div className="border-b "></div>
             
              {isObjectsTableVisible && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-sm border-b border-r py-2 px-4 ">
                        Objects
                        <select className="text-sm  ml-2 border-none float-end">
                          <option>System Object</option>
                          <option>Custom Object</option>
                          <option>Master Object</option>
                        </select>
                      </th>
                      <th className="text-center text-sm border-b border-r pb-2 py-2">Read</th>
                      <th className="text-center text-sm border-b border-r pb-2 py-2">Create</th>
                      <th className="text-center text-sm border-b border-r pb-2 py-2">Edit</th>
                      <th className="text-center text-sm border-b pb-2 py-2">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objectsData.map((object, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 border-r">{object}</td>
                        <td className="py-2 border-r text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => handleObjectChange(index, 'View', e.target.checked)}
                          />
                        </td>
                        <td className="py-2 border-r text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => handleObjectChange(index, 'Create', e.target.checked)}
                          />
                        </td>
                        <td className="py-2 border-r text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => handleObjectChange(index, 'Edit', e.target.checked)}
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            onChange={(e) => handleObjectChange(index, 'Delete', e.target.checked)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="footer-buttons flex justify-end">
            <button type="submit" className="footer-button">
              Save
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default ProfileForm;