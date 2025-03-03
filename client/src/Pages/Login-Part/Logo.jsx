import React from 'react';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";

const Logo = () => {
  return (
    <div className="border-b p-4 flex justify-center items-center">
      <img src={logo} alt="Logo" className="w-20" />
    </div>
  );
};

export default Logo;
