import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { IoArrowBack } from "react-icons/io5";
const SharingRuleDetails = ({ rule, onClose }) => {
    if (!rule) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white shadow-lg overflow-auto w-[97%] h-[94%] sm:w-[100%] sm:h-[100%]">
                <div className="border-b p-2">
                    <div className="md:mx-8 lg:mx-8 xl:mx-8 sm:mx-1 my-3 flex justify-between sm:justify-start items-center">
                        <button className="sm:w-8 md:hidden lg:hidden xl:hidden 2xl:hidden" onClick={onClose}>
                            <IoArrowBack className="text-2xl" />
                        </button>
                        <p className="text-xl">
                            <span
                                className="text-orange-500 font-semibold cursor-pointer"
                            >
                                Sharing Rule
                            </span>{" "}
                            /
                            {rule.name}
                        </p>
                        {/* Cancel icon */}
                        <button
                            className="shadow-lg rounded-full sm:hidden"
                            onClick={onClose}
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
                                className="cursor-pointer text-orange-500 font-semibold pb-3 border-b-2 border-orange-500" >
                                Details
                            </span>
                        </p>
                    </div>
                </div>
                {/* content */}
                <div className="mx-16 sm:mx-5 mt-7 grid grid-cols-4 sm:mt-5">
                    <div className="sm:col-span-4 md:col-span-3 lg:col-span-3 xl:col-span-3 2xl:col-span-3 sm:mt-[1rem]">
                        <div className="flex mb-5">
                            <div className="w-1/3 sm:w-1/2">
                                <div className="font-medium">Rule Name</div>
                            </div>
                            <div className="w-1/3 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">{rule.name}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex mb-5">
                            <div className="w-1/3 sm:w-1/2">
                                <div className="font-medium">Object Name</div>
                            </div>
                            <div className="w-1/3 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">{rule.objectName}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex mb-5">
                            <div className="w-1/3 sm:w-1/2">
                                <div className="font-medium">Rule Type</div>
                            </div>
                            <div className="w-1/3 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">{rule.ruleType}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex mb-5">
                            <div className="w-1/3 sm:w-1/2">
                                <div className="font-medium">Records Owned By</div>
                            </div>
                            <div className="w-1/3 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">{rule.recordsOwnedBy}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex mb-5">
                            <div className="w-1/3 sm:w-1/2">
                                <div className="font-medium">Shared With</div>
                            </div>
                            <div className="w-1/3 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">{rule.shareWith}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex mb-5">
                            <div className="w-1/3 sm:w-1/2">
                                <div className="font-medium">Access</div>
                            </div>
                            <div className="w-1/3 sm:w-1/2">
                                <p>
                                    <span className="font-normal text-gray-500">{rule.access}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharingRuleDetails;