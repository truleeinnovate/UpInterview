import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import classNames from "classnames";
import { config } from "../../../config";
import {
  // useOrganizationAddresses,
  useOrganizationDetails,
  useUpdateOrganization,
} from "../../../apiHooks/useOrganization";

const AddressesPopup = ({
  isOpen,
  onClose,
  setAddress,
  address,
  organizationId,
}) => {
  // const [offices, setOffices] = useState([]);
  // const [fetching, setFetching] = useState(true);

  const { addOrUpdateOrganization, isLoading: isUpdating } =
    useUpdateOrganization();

  // Fetch logic identical to CompanyEditProfile's useEffect
  // const fetchData = async () => {
  //   if (!isOpen || !organizationId) return;
  //   try {
  //     setFetching(true);
  //     const response = await axios.get(
  //       `${config.REACT_APP_API_URL}/Organization/organization-details/${organizationId}`,
  //     );
  //     // We take the offices array directly from the response
  //     setOffices(response.data.offices || []);
  //   } catch (error) {
  //     console.error("Error fetching address data:", error);
  //   } finally {
  //     setFetching(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, [organizationId, isOpen]);

  // console.log("address", address);

  // Fetch addresses using TanStack Query
  const {
    data: response,
    isLoading: isFetching,
    isError,
    error,
  } = useOrganizationDetails(organizationId, isOpen);

  const offices = response?.offices || [];

  // console.log("offices offices", offices);

  // Update logic to toggle isDefault and update the organization
  // const handleSetDefault = async (selectedIndex) => {
  //   if (isUpdating) return;

  //   // 1. Prepare updated array (E-commerce selection logic)
  //   const updatedOffices = offices.map((office, idx) => ({
  //     ...office,
  //     isDefault: idx === selectedIndex,
  //   }));
  //   setAddress(updatedOffices[selectedIndex]);

  //   // try {
  //   //   // 2. Call the same update method used in CompanyEditProfile
  //   //   const response = await addOrUpdateOrganization({
  //   //     id: organizationId,
  //   //     data: { offices: updatedOffices },
  //   //   });

  //   //   if (response.status === "success") {
  //   //     // 3. Update local state to reflect the change visually
  //   //     // setOffices(updatedOffices);
  //   //     console.log("updatedOffices", updatedOffices);
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Error updating organization addresses:", error);
  //   // }
  // };

  // Update logic to handle address selection
  const handleSetDefault = (selectedIndex) => {
    if (!offices || selectedIndex >= offices.length) return;

    // 1. Get the selected address from the offices array
    const selectedAddress = offices[selectedIndex];

    // 2. Update the parent component's address state
    if (setAddress) {
      setAddress(selectedAddress);
    }

    // Optional: add small delay before closing to let parent re-render
    setTimeout(() => {
      onClose();
    }, 80);
    // 3. Close the popup - this is already correct in your code
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-custom-blue" />
            <h2 className="text-lg font-bold text-gray-800">
              Company Addresses
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-grow">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-custom-blue animate-spin" />
              <p className="mt-2 text-sm text-gray-500 font-medium">
                Loading addresses...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1  md:grid-cols-2  lg:grid-cols-3   xl:grid-cols-3  2xl:grid-cols-3  gap-4">
              {offices.map((office, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); // ← ADD THIS
                    e.stopPropagation(); // ← ADD THIS
                    // if (!office.isDefault) {
                    //   handleSetDefault(index);
                    // }
                    if (address?._id !== office?._id) {
                      handleSetDefault(index);
                    }
                  }}
                  className={classNames(
                    "relative p-5 rounded-xl border-2 transition-all duration-200 bg-white",
                    address?._id === office?._id
                      ? "border-custom-blue ring-1 ring-custom-blue shadow-md"
                      : "border-gray-200 hover:border-custom-blue/50 hover:shadow-sm cursor-pointer",
                    isUpdating && "opacity-60 pointer-events-none",
                  )}
                >
                  {/* Selection Badge */}
                  <div className="absolute top-4 right-4">
                    {address?._id === office?._id ? (
                      <CheckCircle2 className="w-5 h-5 text-custom-blue fill-custom-blue/10" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Type Label */}
                  <span
                    className={classNames(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mb-3 inline-block",
                      office.type === "headquarters"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {office.type}
                  </span>

                  <div className="space-y-3 pr-6 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div className="text-gray-700">
                        <p className="font-bold text-gray-900 leading-tight">
                          {office.address || "No Address Provided"}
                        </p>
                        <p className="mt-1">
                          {office.city}, {office.state} {office.zip}
                        </p>
                        <p className="text-xs text-gray-500">
                          {office.country}
                        </p>
                      </div>
                    </div>

                    {office.phone && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {office.countryCode} {office.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div>
            {offices.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  No addresses found.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end items-center gap-4">
          {isUpdating && (
            <div className="flex items-center gap-2 text-custom-blue text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving changes...
            </div>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressesPopup;
