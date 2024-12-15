import React, { useState, memo } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import image1 from "../Dashboard-Part/Images/image1.png";
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";

const Organization = memo(() => {
  const [selectedFirstName, setSelectedFirstName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = process.env.NODE_ENV === 'production'
    ? 'https://basic-backend-001-fadbheefgmdffzd4.uaenorth-01.azurewebsites.net'
    : 'http://localhost:4041';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        firstName: selectedFirstName.trim(),
      };

      const axiosInstance = axios.create({
        baseURL: backendUrl,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
        timeout: 15000
      });

      const response = await axiosInstance.post('/organization', formData);

      if (!response?.data?.user?._id || !response?.data?.organization?._id) {
        throw new Error("Invalid response from server");
      }
      navigate('/price');

    } catch (error) {
      console.error('Error saving organization:', error);
      
      let errorMessage = 'An error occurred while saving the organization';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        console.error('Server error:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
        console.error('Network error:', error.request);
      } else {
        errorMessage = error.message;
        console.error('Error:', error.message);
      }
      
      setErrorMessage(errorMessage);
    }
  };

  return (
    <>
      <div className="border-b p-4">
        <img src={logo} alt="Logo" className="w-20" />
      </div>
      <div className="container mx-auto grid grid-cols-2 items-center justify-center p-4">
        <div className="col-span-1 flex justify-center">
          <img src={image1} alt="Interview" className="h-[29rem]" />
        </div>
        <div className="col-span-1 mt-3" style={{ width: "75%" }}>
          <p className="text-3xl font-medium mb-4 text-center">Sign Up</p>
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative">
                <input
                  type="text"
                  id="first_name"
                  className="block rounded px-8 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer"
                  value={selectedFirstName}
                  onChange={(e) => setSelectedFirstName(e.target.value)}
                />
                <label
                  htmlFor="first_name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-2.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                  First Name
                </label>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="text-sm mb-4">
                If already registered | <span className="cursor-pointer text-blue-500 underline" onClick={() => navigate('/admin')}>Login</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-20 py-2 bg-blue-500 text-white rounded-3xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

export default Organization;
