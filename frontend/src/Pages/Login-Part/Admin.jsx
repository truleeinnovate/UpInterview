import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { usePermify } from '@permify/react-role';
import axios from 'axios';
import image1 from "../Dashboard-Part/Images/image1.png";
import Cookies from 'js-cookie';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";

const Admin = () => {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { can } = usePermify();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/organization/login`, { Email, password });
      if (response.status === 200) {
        const { userId, organizationId } = response.data;
        Cookies.set('userId', userId);
        Cookies.set('organizationId', organizationId);
        navigate('/home');
      }
    } catch (error) {
      setErrorMessage("Invalid email or password");
    }
  };

  return (
    <>
      <div>
        {/* <div className="border-b p-4">
          <p className="font-bold text-xl">LOGO</p>
        </div> */}
        <div className="border-b p-4">
          <img src={logo} alt="Logo" className="w-20" />
        </div>

        <div className="grid grid-cols-2">
          {/* col 1 */}
          <div className="flex justify-center">
            <img src={image1} alt="logo" className='h-[30rem]' />
          </div>
          {/* col 2 */}
          <div className="mt-5">
            <div className="flex justify-center gap-52 mb-8">
              <button className="border-2 border-gray-400 font-medium rounded-md px-10 py-2">User</button>
              {can && can('view') && (
                <button className="border-2 border-gray-400 font-medium rounded-md px-10 py-2">Admin</button>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
              {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
              <form onSubmit={handleLogin}>
                <div className="border border-gray-300 rounded-md mb-4">
                  <label className="block text-gray-600 ml-2">Email or Phone</label>
                  <input
                    type="text"
                    name="contact"
                    placeholder=""
                    className="w-full focus:outline-none rounded-md border-gray-300 px-2"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="border border-gray-300 rounded-md mb-4 relative">
                  <label className="block text-gray-600 ml-2">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    className="w-full focus:outline-none rounded-md border-gray-300 px-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={togglePasswordVisibility}
                    className="text-blue-500 absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="mb-5">
                  <p className="text-blue-500">Forgot Password?</p>
                </div>
                <div className="flex flex-col items-center">
                  <button type="submit" className="bg-blue-500 text-white rounded-full px-16 py-2 mb-2">Login</button>
                  <button type="button" className="bg-gray-500 text-white rounded-full px-16 py-2" onClick={() => navigate('/organization')}>Cancel</button>
                </div>
                <div className="flex justify-center mt-4">
                  <div
                    className="text-sm text-blue-500 cursor-pointer"
                    onClick={() => navigate('/organization')}
                  >
                    If not registered | Sign Up
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;