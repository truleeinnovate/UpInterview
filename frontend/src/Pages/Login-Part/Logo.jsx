// v1.0.0 - Ashok - changed logo url from local to cloud storage url
import React from "react";
// import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";

const Logo = () => {
  return (
    <>
      <div className="fixed top-0 left-0 z-50 w-full bg-white border-b p-4 flex justify-center items-center">
        {/* v1.0.0 <------------------------------------------------------------------------------------- */}
        {/* <img src={logo} alt="Logo" className="w-20" /> */}
        <img
          src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
          alt="Logo"
          className="w-20"
        />
        {/* v1.0.0 -------------------------------------------------------------------------------------> */}{" "}
      </div>
      <div className="mb-12"></div>
    </>
  );
};

export default Logo;
