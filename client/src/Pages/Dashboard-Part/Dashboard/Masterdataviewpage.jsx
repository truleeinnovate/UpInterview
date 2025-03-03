import React from 'react';
import { MdOutlineCancel } from "react-icons/md";

const PopupDetails = ({ selectedData, selectedTab, closeModal }) => {
  console.log(selectedData, "selectedData");

  const renderDetails = () => {
    switch (selectedTab) {
      case "ProfileMaster":
        return (
          <>
            <div className="font-semibold space-y-8">
              <p>Profile Name</p>
              <p>Created Date</p>
              <p>Created By</p>
              <p>Modified Date</p>
              <p>Modified by</p>
            </div>
            <div className="space-y-8 text-gray-500 -ml-60">
              <p>{selectedData.profileName}</p>
              <p>{selectedData.createdDate}</p>
              <p>{selectedData.createdBy}</p>
              <p>{selectedData.modifiedDate}</p>
              <p>{selectedData.modifiedBy}</p>
            </div>
          </>
        );
      // other cases (SkillMaster, TechnologyMaster, etc.) here...
      case "TaxMaster":
        return (
          <>
            <div className="font-semibold space-y-8">
              <p>Tax ID</p>
              <p>Tax Name</p>
              <p>Tax Type</p>
              <p>Application Region</p>
              <p>Start Date</p>
              <p>End Date</p>
              <p>Is Active</p>
            </div>
            <div className="space-y-8 text-gray-500 -ml-60">
              <p>{selectedData.TaxID}</p>
              <p>{selectedData.TaxName}</p>
              <p>{selectedData.TaxType}</p>
              <p>{selectedData.ApplicationRegion}</p>
              <p>{selectedData.StartDate}</p>
              <p>{selectedData.EndDate}</p>
              <p>{selectedData.IsActive}</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white shadow-lg overflow-auto"
        style={{ width: "97%", height: "94%" }}
      >
        <div className="border-b p-2">
          <div className="mx-8 my-3 flex justify-between items-center">
            <p className="text-xl">
              <span
                className="text-orange-500 font-semibold cursor-pointer"
              >
                {selectedTab}
              </span>{" "}
              / 
            </p>
            <div className="flex flex-col items-center space-y-2">
             
              <button
                className="shadow-lg rounded-full"
                onClick={closeModal}
              >
                <MdOutlineCancel className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 mx-20">
          <div className="mt-2">
            
            {selectedData && (
              <div className="grid grid-cols-2">
                {renderDetails()}
              </div>
            )}

          </div>
          <div className="absolute top-36 left-3/4 transform translate-x-28 -translate-y-10">
                <button
                  className=" text-gray-500 px-4 py-1"
                  
                >
                  Edit
                </button>
              </div>
        </div>
      </div>
    </div>
  );
};

export default PopupDetails;
