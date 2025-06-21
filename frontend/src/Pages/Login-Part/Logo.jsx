import React from 'react';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";

const Logo = () => {
  return (
    <>
      <div className="fixed top-0 left-0 z-50 w-full bg-white border-b p-4 flex justify-center items-center">
        <img src={logo} alt="Logo" className="w-20" />
      </div>
      <div className="mb-12"></div>
    </>
  );
};

export default Logo;