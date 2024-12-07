import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import EditUser from "./EditUser";
import { IoArrowBack } from "react-icons/io5";
import maleImage from '../../Dashboard-Part/Images/man.png';
import femaleImage from '../../Dashboard-Part/Images/woman.png';
import genderlessImage from '../../Dashboard-Part/Images/transgender.png';

// {f} //

const UserProfileDetails = ({ Users, onCloseUsers }) => {
  useEffect(() => {
    document.title = "User Profile Details";
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("users");
  const handleNavigate = () => {
    navigate("/users", { state: { Users } });
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

  const [userToEdit, setUserToEdit] = useState(null);

  // const handleEditClick = (users) => {
  //   setShowMainContent(false);
  //   setShowNewUserContent(true);
  //   setUserToEdit(users);
  // };
  // const handleEditClick = () => {
  //   console.log("Edit button clicked");
  //   setShowMainContent(false);
  //   console.log("setShowMainContent", false)
  //   setShowNewUserContent(true);
  //   setUserToEdit(Users);
  //   console.log("showNewUserContent:", true); // Should be true
  //   console.log("userToEdit:", Users); // Should log the user data
  // };
  const handleEditClick = ( users) => {
    setUserToEdit(Users);
    setShowMainContent(false);
    setShowNewUserContent({ state: { Users } });
  };
  const handleclose = () => {
    setShowMainContent(true);
    setShowNewUserContent(false);
  };
  const sidebarRef = useRef(null);




  return (
    <>
      <div>
        {showMainContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white shadow-lg overflow-auto w-[97%] h-[94%] sm:w-[100%] sm:h-[100%]"
          >
            <div className="border-b p-2">
              <div className="md:mx-8 lg:mx-8 xl:mx-8 sm:mx-1 my-3 flex justify-between sm:justify-start items-center">
                <button className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden" onClick={onCloseUsers}>
                  <IoArrowBack className="text-2xl" />
                </button>
                <p className="text-xl">
                    <span className="text-orange-500 font-semibold cursor-pointer" onClick={handleNavigate}>
                      User
                    </span>{" "}
                    /{Users.Firstname}
                  </p>
                  <button className="shadow-lg rounded-full sm:hidden" onClick={onCloseUsers}>
                    <MdOutlineCancel className="text-2xl" />
                  </button>
                </div>
              </div>




              <div>
                <div className="mx-10 pt-5 pb-2 ">
                  <p className="text-xl space-x-10">
                    <span
                      className="cursor-pointer text-orange-500 font-semibold pb-3 border-b-2 border-orange-500"
                    >
                      User
                    </span>

                  </p>
                </div>
              </div>




              {/* form starting */}

              <>
                <div className="flex float-end -mt-7 ">
                  <button
                    className=" text-gray-500 mr-7"
                    onClick={handleEditClick}
                  >
                    Edit
                  </button>
                </div>


                <div className="mx-16 sm:mx-5 mt-7 grid grid-cols-4 sm:mt-5">



                  {/* User image only for mobile */}
                  <div className="col-span-4 md:hidden lg:hidden xl:hidden 2xl:hidden sm:flex sm:justify-center">
                    <div>
                      <div className="flex justify-end text-center">
                        <div>
                          <img
                            src={Users.image || (Users.Gender === "Male" ? maleImage : Users.Gender === "Female" ? femaleImage : genderlessImage)}
                            alt="User"
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-[1rem]">
                    <div className="flex mb-5">
                      {/*   First Name */}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">First Name</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.Name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/* Last Name*/}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Last Name</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2  ">
                        <p>
                          <span className="font-normal">{Users.Firstname}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/*  User ID */}
                      <div className="w-1/3 sm:w-1/2  ">
                        <div className="font-medium">User ID</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2    ">
                        <p>
                          <span className="font-normal">{Users.UserId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/*  Password */}
                      <div className="w-1/3 sm:w-1/2    ">
                        <div className="font-medium">Password</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2    ">
                        <p>
                          <span className="font-normal">{Users.Password}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-5">
                      {/*  Gender */}
                      <div className="w-1/3 sm:w-1/2    ">
                        <div className="font-medium">Gender</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2    ">
                        <p>
                          <span className="font-normal">{Users.Gender}</span>
                        </p>
                      </div>
                    </div>


                    <div className="flex mb-5">
                      {/*Email Address */}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Email Address</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2 ">
                        <p>
                          <span className="font-normal">{Users.Email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/* Phone Number */}
                      <div className="w-1/3 sm:w-1/2 ">
                        <div className="font-medium">Phone Number</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.Phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/*  Linkedin URL */}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Linkedin URL</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.LinkedinUrl}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/* Profile*/}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Profile</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.Profile}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/*  Role */}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Role</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.Role}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/*  Time zone */}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Time Zone</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.Timezone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-5">
                      {/*  Language */}
                      <div className="w-1/3 sm:w-1/2">
                        <div className="font-medium">Language</div>
                      </div>
                      <div className="w-1/3 sm:w-1/2">
                        <p>
                          <span className="font-normal">{Users.Language}</span>
                        </p>
                      </div>
                    </div>
                  </div>


                  {/* User image only for desktop */}


                  <div className="col-span-1 sm:hidden">
                    <div>
                      <div className="flex justify-end text-center">
                        <div>
                          <img
                            src={Users.image || (Users.Gender === "Male" ? maleImage : Users.Gender === "Female" ? femaleImage : genderlessImage)}
                            alt="User"
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        )
        }
        {showNewUserContent && (
          <EditUser
            onClose={handleclose}
            user={userToEdit}

          />
        )}
      </div>
    </>
  );
};

export default UserProfileDetails;  // {f} //
