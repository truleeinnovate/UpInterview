// import React, { useState } from "react";
// import { config } from '../../config.js';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import axios from 'axios';
// import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";
// import Slideshow from './Slideshow';


// const Admin = () => {
//   const [Email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const navigate = useNavigate();

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');

//     try {
//       // Validate input
//       if (!Email || !password) {
//         setErrorMessage('Email and password are required');
//         return;
//       }

//       // Show loading state
//       const response = await axios.post(
//         `${config.REACT_APP_API_URL}/Organization/login`,
//         {
//           email: Email.trim().toLowerCase(),
//           password: password
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         const { userId, organizationId, token, isProfileCompleted, roleName } = response.data;

//         if (userId) Cookies.set('userId', userId, { expires: 7 });
//         if (organizationId) Cookies.set('organizationId', organizationId, { expires: 7 });
//         if (token) Cookies.set('token', token, { expires: 7 });
 
//         // Check profile status
//         if (typeof isProfileCompleted === 'undefined') {
//           navigate('/home');
//         } else if (isProfileCompleted === true) {
//           navigate('/home');
//         } else if (isProfileCompleted === false && roleName) {
//           navigate('/profile4', { state: { isProfileComple: true, roleName } });
//         } else {
//           navigate('/home');
//         }
//       } else {
//         setErrorMessage(response.data.message || 'Login failed');
//       }



//     } catch (error) {
//       console.error('Login error:', error);

//       // Handle specific error cases
//       if (error.response?.status === 500) {
//         setErrorMessage('Server error. Please try again later.');
//       } else if (error.response?.status === 401) {
//         setErrorMessage('Invalid email or password');
//       } else {
//         setErrorMessage(
//           error.response?.data?.message ||
//           'Unable to connect to server. Please try again.'
//         );
//       }
//     }
//   };

//   return (
//     <>
//       <div>
//         <div className="border-b p-4">
//           <img src={logo} alt="Logo" className="w-20" />
//         </div>
//         <div className="grid grid-cols-2">
//           {/* col 1 */}
//           <div>
//             <Slideshow />
//           </div>
//           {/* col 2 */}
//           <div className="mt-5">
//             <div className="flex justify-center gap-52 mb-8">
//               <button className="border-2 border-gray-400 font-medium rounded-md px-10 py-2">User</button>
//               {/* {can && can('view') && (
//                 <button className="border-2 border-gray-400 font-medium rounded-md px-10 py-2">Admin</button>
//               )} */}
//             </div>
//             <div className="max-w-md mx-auto">
//               <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
//               {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
//               <form onSubmit={handleLogin}>
//                 <div className="border border-gray-300 rounded-md mb-4">
//                   <label className="block text-gray-600 ml-2">Email or Phone</label>
//                   <input
//                     type="text"
//                     name="contact"
//                     placeholder=""
//                     className="w-full focus:outline-none rounded-md border-gray-300 px-2"
//                     value={Email}
//                     onChange={(e) => setEmail(e.target.value)}
//                   />
//                 </div>

//                 <div className="border border-gray-300 rounded-md mb-4 relative">
//                   <label className="block text-gray-600 ml-2">Password</label>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     placeholder=""
//                     className="w-full focus:outline-none rounded-md border-gray-300 px-2"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                   <button
//                     onClick={togglePasswordVisibility}
//                     className="text-blue-500 absolute right-4 top-1/2 transform -translate-y-1/2"
//                   >
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>

//                 <div className="mb-5">
//                   <p className="text-blue-500" onClick={() => navigate('/forgetPassword')}>Forgot Password ?</p>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <button type="submit" className="bg-blue-500 text-white rounded-full px-16 py-2 mb-2">Login</button>
//                   <button type="button" className="bg-gray-500 text-white rounded-full px-16 py-2" onClick={() => navigate('/organization')}>Cancel</button>
//                 </div>
//                 <div className="flex justify-center mt-4">
//                   <div
//                     className="text-sm text-blue-500 cursor-pointer"
//                     onClick={() => navigate('/organization')}
//                   >
//                     If not registered | Sign Up
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Admin;



import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Slideshow from './Slideshow';

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous error messages

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/Organization/Login`, {
        email,
        password
      });

      if (response.data.success) {
        const { userId, organizationId, token, isProfileCompleted, roleName, contactDataFromOrg } = response.data;

        if (userId) Cookies.set('userId', userId, { expires: 7 });
        if (organizationId) Cookies.set('organizationId', organizationId, { expires: 7 });
        if (token) Cookies.set('token', token, { expires: 7 });
 
        // Check profile status
        if (typeof isProfileCompleted === 'undefined') {
          navigate('/home');
        } else if (isProfileCompleted === true) {
          navigate('/home');
        } else if (isProfileCompleted === false && roleName) {
          navigate('/profile4', { state: { isProfileComplete: true, roleName,contactDataFromOrg } });
        } else {
          navigate('/home');
        }
      } else {
        setErrorMessage(response.data.message || 'Login failed');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Login failed. Please try again.");
      } else {
        setErrorMessage("An error occurred. Please check your connection.");
      }
    }
  };

  return (
    <>
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-1">
          {/* Left Column - Slideshow */}
          <div>
            <Slideshow />
          </div>
          {/* Right Column - Login Form */}
          <div className='flex text-sm flex-col sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]'>
            <div className="mb-8 mt-5 flex justify-center">
              <button className="border border-gray-400 font-medium rounded-md px-10 py-2">User</button>
            </div>
            <div>
              <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
              {errorMessage && <p className="text-red-500 text-center mb-3">{errorMessage}</p>}
              
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="border border-gray-300 rounded-md mb-4">
                  <label className="block text-gray-600 ml-2">Work Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder=""
                    className="w-full p-2 focus:outline-none rounded-md border-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Password Field */}
                <div className="border border-gray-300 rounded-md mb-4 relative">
                  <label className="block text-gray-600 ml-2">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder=""
                    className="w-full p-2 focus:outline-none rounded-md border-gray-300 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                   autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="mb-5">
                  <p className="text-custom-blue cursor-pointer text-xs" onClick={() => navigate('/forgetPassword')}>
                    Forgot Password?
                  </p>
                </div>

                {/* Login & Cancel Buttons */}
                <div className="flex flex-col items-center">
                  <button type="submit" className="bg-custom-blue text-white rounded-full px-16 py-2 mb-2">
                    Login
                  </button>
                  <button type="button" className="bg-white text-custom-blue rounded-full px-16 py-2 border border-gray-400" onClick={() => navigate('/organization')}>
                    Cancel
                  </button>
                </div>

                {/* Signup Link */}
                <div className="flex justify-center mt-4">
                  <p className="text-sm text-custom-blue cursor-pointer" onClick={() => navigate('/organization')}>
                    If not registered | Sign Up
                  </p>
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
