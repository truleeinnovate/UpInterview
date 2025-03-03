import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineCancel } from "react-icons/md";

const MasterProfileDetails = () => {
    const location = useLocation();
    const userData = location.state.userData;
    console.log(userData)
    const navigate = useNavigate();
    const closeModalAndNavigate = () => {
        navigate("/masterdata");

    };
    return (
        <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div
                    className="bg-white shadow-lg overflow-auto"
                    style={{ width: "70%", height: "94%" }}
                >
                    <div className="border-b p-2">
                        <div className="mx-8 my-3 flex justify-between items-center">

                            {userData.SkillName && (
                                <p className="text-xl">
                                    <span
                                        className="text-orange-500 font-semibold cursor-pointer"
                                    >
                                        SkillMaster
                                    </span>{" "}
                                    /{userData.SkillName}
                                </p>
                            )}

                            {userData.TechnologyMasterName && (
                                <p className="text-xl">
                                    <span
                                        className="text-orange-500 font-semibold cursor-pointer"
                                    >
                                        TechnologyMaster
                                    </span>{" "}
                                    /{userData.TechnologyMasterName}
                                </p>
                            )}
                              {userData.RoleName && (
                                <p className="text-xl">
                                    <span
                                        className="text-orange-500 font-semibold cursor-pointer"
                                    >
                                       RoleMaster
                                    </span>{" "}
                                    /{userData.RoleName}
                                </p>
                            )}
                              {userData.IndustryName && (
                                <p className="text-xl">
                                    <span
                                        className="text-orange-500 font-semibold cursor-pointer"
                                    >
                                        IndustryMaster
                                    </span>{" "}
                                    /{userData.IndustryName}
                                </p>
                            )}
                              {userData.LocationName && (
                                <p className="text-xl">
                                    <span
                                        className="text-orange-500 font-semibold cursor-pointer"
                                    >
                                        LocationMaster
                                    </span>{" "}
                                    /{userData.LocationName}
                                </p>
                            )}
                               {userData.profileName && (
                                <p className="text-xl">
                                    <span
                                        className="text-orange-500 font-semibold cursor-pointer"
                                    >
                                        ProfileMaster
                                    </span>{" "}
                                    /{userData.profileName}
                                </p>
                            )}
                            {/* Cancel icon */}
                            <button
                                className="shadow-lg rounded-full"
                                onClick={closeModalAndNavigate}
                            >
                                <MdOutlineCancel className="text-2xl" />
                            </button>
                        </div>
                    </div>
                    <>
                        <div className="mx-16 mt-7 grid grid-cols-4">
                            <div className="col-span-3">
                                <div className="flex mb-5">
                                    {/*     ID*/}
                                    <div className="w-1/3">
                                        <div className="font-medium">  ID</div>
                                    </div>
                                    <div className="w-1/3">
                                        <p>
                                            <span className="font-normal">{userData._id}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Display specific fields based on the type of data */}
                                {userData.SkillName && (
                                    <div className="flex mb-5">
                                        <div className="w-1/3"><div className="font-medium">Skill Name</div></div>
                                        <div className="w-1/3"><p><span className="font-normal">{userData.SkillName}</span></p></div>
                                    </div>
                                )}
                                {userData.TechnologyMasterName && (
                                    <div className="flex mb-5">
                                        <div className="w-1/3"><div className="font-medium">Technology Name</div></div>
                                        <div className="w-1/3"><p><span className="font-normal">{userData.TechnologyMasterName}</span></p></div>
                                    </div>
                                )}
                                {userData.RoleName && (
                                    <div className="flex mb-5">
                                        <div className="w-1/3"><div className="font-medium">Role Name</div></div>
                                        <div className="w-1/3"><p><span className="font-normal">{userData.RoleName}</span></p></div>
                                    </div>
                                )}
                                {userData.IndustryName && (
                                    <div className="flex mb-5">
                                        <div className="w-1/3"><div className="font-medium">Industry Name</div></div>
                                        <div className="w-1/3"><p><span className="font-normal">{userData.IndustryName}</span></p></div>
                                    </div>
                                )}
                                {userData.LocationName && (
                                    <div className="flex mb-5">
                                        <div className="w-1/3"><div className="font-medium">Location Name</div></div>
                                        <div className="w-1/3"><p><span className="font-normal">{userData.LocationName}</span></p></div>
                                    </div>
                                )}
                                 {userData.profileName && (
                                    <div className="flex mb-5">
                                        <div className="w-1/3"><div className="font-medium">ProfileName</div></div>
                                        <div className="w-1/3"><p><span className="font-normal">{userData.profileName}</span></p></div>
                                    </div>
                                )}
                                <div className="flex mb-5">
                                    {/*   Created Date */}
                                    <div className="w-1/3">
                                        <div className="font-medium">Created Date</div>
                                    </div>
                                    <div className="w-1/3">
                                        <p>
                                            <span className="font-normal">{new Date(userData.CreatedDate).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mb-5">
                                    {/*    Created By*/}
                                    <div className="w-1/3">
                                        <div className="font-medium">  Created By</div>
                                    </div>
                                    <div className="w-1/3">
                                        <p>
                                            <span className="font-normal">{userData.CreatedBy}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mb-5">
                                    {/* Modified Date */}
                                    <div className="w-1/3">
                                        <div className="font-medium"> Modified Date</div>
                                    </div>
                                    <div className="w-1/3">
                                        <p>
                                            <span className="font-normal">{userData.ModifiedDate}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mb-5">
                                    {/*Modified by */}
                                    <div className="w-1/3">
                                        <div className="font-medium">Modified by
                                        </div>
                                    </div>
                                    <div className="w-1/3">
                                        <p>
                                            <span className="font-normal">{userData.ModifiedBy}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                </div>
            </div>
        </div>
    );
};

export default MasterProfileDetails;