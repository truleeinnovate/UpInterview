import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";


const RolesProfileDetails = ({ roles, onCloseroles }) => {
  useEffect(() => {
    document.title = "Roles Profile Details";
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("roles");
  const handleNavigate = () => {
    navigate("/roles", { state: { roles } });
  };

  const formData = location.state?.formData;
  const selectedPosition = formData?.position;

  useEffect(() => {
    const fetchPositionDetails = async () => {
      try {
        const response = await fetch(`YOUR_API_ENDPOINT/${selectedPosition}`);
        console.log(response);
      } catch (error) {
        console.error("Error fetching position details:", error);
      }
    };

    if (selectedPosition) {
      fetchPositionDetails();
    }
  }, [selectedPosition]);


  const [showMainContent, setShowMainContent] = useState(true);
  const [showNewUserContent, setShowNewUserContent] = useState(false);
  const handleEditClick = () => {
    setShowMainContent(false);
    setShowNewUserContent(true);
  };






  return (
    <>
      {showMainContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white shadow-lg overflow-auto w-[97%] h-[94%] sm:w-[100%] sm:h-[100%]">
            <div className="border-b p-2">
              <div className="md:mx-8 lg:mx-8 xl:mx-8 sm:mx-1 my-3 flex justify-between sm:justify-start items-center">
                <button className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden" onClick={onCloseroles}>
                  <IoArrowBack className="text-2xl" />
                </button>
                <p className="text-xl">
                  <span
                    className="text-orange-500 font-semibold cursor-pointer"
                    onClick={handleNavigate}
                  >
                    Role
                  </span>{" "}
                  /
                  {roles.roleName}
                </p>
                {/* Cancel icon */}
                <button
                  className="shadow-lg rounded-full sm:hidden"
                  onClick={onCloseroles}
                >
                  <MdOutlineCancel className="text-2xl" />
                </button>
              </div>
            </div>
            {/* Header Name */}
            <div>
              <div className="mx-10 pt-5 pb-2 ">
                <p className="text-xl space-x-10">
                  <span
                    className="cursor-pointer text-orange-500 font-semibold pb-3 border-b-2 border-orange-500"
                  >
                    Role
                  </span>

                </p>
              </div>
            </div>

            {/* Content */}
            <>

              <div className="flex float-end -mt-7  ">
                <button
                  className=" text-gray-500 mr-7"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              </div>

              <div className="mx-16 sm:mx-5 mt-7 grid grid-cols-4 sm:mt-5">
                <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-[1rem]">
                  <div className="flex mb-5">
                    {/*  Role Name */}
                    <div className="w-1/3 sm:w-1/2">
                      <div className="font-medium">Role Name</div>
                    </div>
                    <div className="w-1/3 sm:w-1/2">
                      <p>
                        <span className="font-normal">{roles.roleName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-5">
                    {/* reports*/}
                    <div className="w-1/3 sm:w-1/2">
                      <div className="font-medium">Reports to role</div>
                    </div>
                    <div className="w-1/3 sm:w-1/2">
                      <p>
                        <span className="font-normal">{roles.reportsToRoleId ? roles.reportsToRoleId.roleName : 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-5">
                    {/* Description */}
                    <div className="w-1/3 sm:w-1/2">
                      <div className="font-medium">Description</div>
                    </div>
                    <div className="w-1/3 sm:w-1/2">
                      <p>
                        <span className="font-normal">{roles.description}</span>
                      </p>
                    </div>
                  </div>


                </div>

              </div>

            </>
          </div>
        </div >
      )
      }

    </>
  )
}

export default RolesProfileDetails