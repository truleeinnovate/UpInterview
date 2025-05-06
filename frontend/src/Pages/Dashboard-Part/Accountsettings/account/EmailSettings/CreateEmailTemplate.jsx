/* eslint-disable react/prop-types */
import axios from 'axios';
import { useState } from 'react'
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateEmailTemplate = ({ show, onClose, refreshData }) => {

  // State to hold the form data as an object
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template Name is required';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Body is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/emailTemplate/templates`, formData);
      alert('Template saved successfully!');
      setFormData({});
      refreshData();
      navigate('/account-settings');

      onClose(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const [selectedGender, setSelectedGender] = useState("");
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };
  const genders = ["Male", "Female", "Others"];
  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setShowDropdownGender(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      Gender: gender,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      Gender: "",
    }));
  };
  return (
    <div
      className={"fixed inset-0 bg-black bg-opacity-15 z-50"}
    >
      <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
        {/* Header */}
        <div className="fixed top-0 w-full bg-custom-blue text-white border-b">
          <div className="flex justify-between sm:justify-start items-center p-4">
            <button onClick={() => onClose(false)} className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8">
              <ArrowLeft className="text-2xl" />
            </button>
            <h2 className="text-lg font-bold">Add Templates</h2>
            <button onClick={() => onClose(false)} className="focus:outline-none sm:hidden">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="fixed top-16 bottom-16 overflow-auto p-5 text-sm right-0 left-0">
          <div>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-3">

                <div className="col-span-3 sm:mt-26">

                  <div className="flex gap-5 mb-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 w-36">Template Name <span className='text-red-500'>*</span></label>
                    </div>
                    <div className="flex-grow">
                      <div>
                        <input
                          name="name"
                          placeholder='Enter name'
                          type="text"
                          className="border-b focus:outline-none mb-5 w-full"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                        {errors.name && <p className="text-red-500 text-sm pt-1">{errors.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium leading-6 text-gray-900  w-36"
                      >
                        Gender <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="relative flex-grow">
                      <div className="relative">
                        <input
                          type="text"
                          className={`border-b focus:outline-none mb-5 w-full ${errors.Gender
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                            }`}
                          id="gender"
                          autoComplete="off"
                          value={selectedGender}
                          onClick={toggleDropdowngender}
                          readOnly
                        />
                        <div
                          className="absolute right-0 top-0"
                          onClick={toggleDropdowngender}
                        >
                          <ChevronDown className="text-lg text-gray-500 mt-1 cursor-pointer" />
                        </div>
                      </div>
                      {showDropdowngender && (
                        <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg">
                          {genders.map((gender) => (
                            <div
                              key={gender}
                              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleGenderSelect(gender)}
                            >
                              {gender}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.Gender && (
                        <p className="text-red-500 text-sm -mt-4">{errors.Gender}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-5 mb-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 w-36">Subject <span className='text-red-500'>*</span></label>
                    </div>
                    <div className="flex-grow">
                      <div>
                        <textarea type="text" className="border p-2 focus:outline-none mb-5 w-full  rounded-md"
                          name="subject"
                          value={formData.subject}
                          placeholder='Enter subject of the template...'
                          onChange={handleInputChange}
                        />
                        {errors.subject && <p className="text-red-500 text-sm pt-1">{errors.subject}</p>}
                      </div>
                    </div>
                  </div>


                  <div className="flex gap-5 mb-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 w-36">Body <span className='text-red-500'> *</span></label>
                    </div>
                    <div className="flex-grow">
                      <div>
                        <textarea className="border p-2 focus:outline-none mb-5 w-full  rounded-md" rows="14"
                          value={formData.body}
                          name="body"
                          placeholder='Enter email template body...'
                          onChange={handleInputChange}
                        />
                        {errors.body && <p className="text-red-500 text-sm pt-1">{errors.body}</p>}
                      </div>
                    </div>
                  </div>



                  <div className="footer-buttons flex justify-end">
                    <button type="submit" className="footer-button  bg-custom-blue">
                      Save
                    </button>
                  </div>
                </div>
              </div>

            </form>
          </div>




        </div>
      </div>
    </div>
  )
}

export default CreateEmailTemplate