// v1.0.0 - Ashok - fixed the default profile icon issue
// v1.0.1 - Ashok - fixed style issue

import React from "react";

import {
  User,
  Mail,
  Phone,
  Building2,
  Pencil,
  Check,
  X,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const Sidebar = ({ candidate, editMode, onEdit, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!candidate) return null;

  return (
    // <aside
    //   className={`
    //   fixed lg:relative  lg:block xl:relative 2xl:relative
    //   w-[100%] sm:w-[100%] md:w-[100%] lg:w-[25%] xl:w-[25%] 2xl:w-[25%]
    //    h-full md:h-screen lg:h-screen xl:h-screen 2xl:h-screen sm:pt-4
    //   md:pt-3
    //   bg-white
    //   shadow-md lg:shadow-lg
    //   transition-transform duration-300
    //   z-40
    //   ${
    //     isOpen
    //       ? "translate-x-0"
    //       : "-translate-x-full lg:translate-x-0 xl:translate-x-0 2xl:translate-x-0"
    //   }
    // `}
    // >
    //   <div className="h-full overflow-y-auto ">
    //     <div className="px-9 py-2 border-b border-gray-100">
    //       <div className="flex justify-between items-center mb-3">
    //         <div className="flex items-center gap-1.5">
    //           <button
    //             onClick={() => navigate("/candidate")}
    //             className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
    //             title="Back to Dashboard"
    //           >
    //             <ArrowLeft className="w-5 h-5" />
    //           </button>
    //           <h2 className="text-lg font-bold  text-custom-blue">Profile</h2>
    //         </div>
    //         <div className="flex gap-1.5">
    //           <button
    //             onClick={() => navigate(`edit`)}
    //             className="p-1.5 rounded-full bg-custom-bg text-custom-blue  transition-colors"
    //           >
    //             {editMode ? (
    //               <Check className="w-5 h-5" />
    //             ) : (
    //               <Pencil className="w-5 h-5" />
    //             )}
    //           </button>
    //           <button
    //             onClick={() => onClose()}
    //             className="sm:block md:block lg:hidden xl:hidden 2xl:hidden p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
    //           >
    //             <X className="w-5 h-5" />
    //           </button>
    //         </div>
    //       </div>

    //       <div className="mb-3">
    //         <div className="w-16 h-16 bg-custom-blue rounded-full mx-auto flex items-center justify-center mb-2 shadow-lg">
    //           {/* v1.0.0 ------------------------------------------------- */}
    //           {candidate?.ImageData ? (
    //             <img
    //               className="w-full h-full object-cover rounded-full"
    //               src={candidate?.ImageData?.path}
    //               alt={candidate?.FirstName || "candidate"}
    //             />
    //           ) : (
    //             <User className="w-8 h-8 text-custom-bg opacity-75" />
    //           )}
    //           {/* v1.0.0 ------------------------------------------------- */}
    //         </div>

    //         <h3 className="text-center font-bold text-lg">
    //           {candidate?.FirstName.charAt(0).toUpperCase() +
    //             candidate?.FirstName.slice(1)}{" "}
    //           {candidate?.LastName.charAt(0).toUpperCase() +
    //             candidate?.LastName.slice(1)}
    //         </h3>

    //         <p className="text-center text-base  pt-1 pb-2 text-gray-600">
    //           {candidate.CurrentRole || "position"}
    //         </p>
    //       </div>
    //     </div>

    //     <div className="px-9 py-2 space-y-2  sm:mb-36  lg:md:10">
    //       <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
    //         <div className="space-y-2">
    //           <div className="flex items-center">
    //             <Mail className="text-gray-500 mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
    //             <div className="min-w-0 flex-1 pb-2 pt-2">
    //               <span className="block truncate text-sm">
    //                 {candidate?.Email || "?"}
    //               </span>
    //             </div>
    //           </div>

    //           <div className="flex items-center">
    //             <Phone className="text-green-500 mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
    //             <div className="min-w-0 flex-1  pb-2 pt-2">
    //               <span className="block truncate text-sm">
    //                 {candidate?.Phone || "N/A"}
    //               </span>
    //             </div>
    //           </div>

    //           <div className="flex items-center">
    //             <GraduationCap className="text-black mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
    //             <div className="min-w-0 flex-1 pb-2 pt-2">
    //               <span className="block truncate text-sm">
    //                 {candidate?.HigherQualification || "?"}
    //               </span>
    //             </div>
    //           </div>

    //           <div className="flex items-center">
    //             <Building2 className="text-custom-blue mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
    //             <div className="min-w-0 flex-1  pb-2 pt-2">
    //               <span className="block truncate text-sm">
    //                 {candidate?.UniversityCollege || "?"}
    //               </span>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="bg-white  rounded-lg p-3 sm:p-4 shadow-sm border  border-gray-100">
    //         <h3 className="font-bold mb-2 sm:mb-3 text-gray-700 text-lg text-center sm:text-base">
    //           Skills
    //         </h3>
    //         <div className="flex flex-wrap gap-1.5 sm:gap-2">
    //           {candidate.skills?.map((skill, index) => (
    //             <span
    //               key={index}
    //               className="px-2 sm:px-3 py-1 bg-custom-bg text-custom-blue rounded-full sm:text-sm text-base font-medium border border-blue-100 shadow-sm"
    //             >
    //               {skill.skill}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </aside>
    <aside
      className={`
      w-full lg:w-[25%] xl:w-[25%] 2xl:w-[25%]
      h-auto lg:h-screen sm:pt-4 md:pt-3
      bg-white
      shadow-md lg:shadow-lg
      transition-transform duration-300
      z-40
      lg:block
    `}
    >
      <div className="px-9 py-2 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/candidate")}
              className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-custom-blue">Profile</h2>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => navigate(`edit`)}
              className="p-1.5 rounded-full bg-custom-bg text-custom-blue transition-colors"
            >
              {editMode ? (
                <Check className="w-5 h-5" />
              ) : (
                <Pencil className="w-5 h-5" />
              )}
            </button>
            {/* <button
            onClick={() => onClose()}
            className="sm:block md:block lg:hidden xl:hidden 2xl:hidden p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button> */}
          </div>
        </div>

        <div className="mb-3">
          <div className="w-16 h-16 bg-custom-blue rounded-full mx-auto flex items-center justify-center mb-2 shadow-lg">
            {candidate?.ImageData ? (
              <img
                className="w-full h-full object-cover rounded-full"
                src={candidate?.ImageData?.path}
                alt={candidate?.FirstName || "candidate"}
              />
            ) : (
              <User className="w-8 h-8 text-custom-bg opacity-75" />
            )}
          </div>

          <h3
            className="text-center font-bold text-lg cursor-default truncate max-w-[180px] mx-auto"
            title={`${capitalizeFirstLetter(
              candidate?.FirstName
            )} ${capitalizeFirstLetter(candidate?.LastName)}`}
          >
            {candidate?.FirstName.charAt(0).toUpperCase() +
              candidate?.FirstName.slice(1)}{" "}
            {candidate?.LastName.charAt(0).toUpperCase() +
              candidate?.LastName.slice(1)}
          </h3>

          <p className="text-center text-base pt-1 pb-2 text-gray-600">
            {candidate.CurrentRole || "position"}
          </p>
        </div>
      </div>

      <div className="px-9 py-2 space-y-2">
        <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center">
              <Mail className="text-gray-500 mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
              <div className="min-w-0 flex-1 pb-2 pt-2">
                <span className="block truncate text-sm">
                  {candidate?.Email || "Not Provided"}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <Phone className="text-green-500 mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
              <div className="min-w-0 flex-1 pb-2 pt-2">
                <span className="block truncate text-sm">
                  {candidate?.Phone || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <GraduationCap className="text-black mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
              <div className="min-w-0 flex-1 pb-2 pt-2">
                <span className="block truncate text-sm">
                  {candidate?.HigherQualification || "Not Provided"}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <Building2 className="text-custom-blue mr-4 ml-3 w-5 h-5 sm:h-4 flex-shrink-0" />
              <div className="min-w-0 flex-1 pb-2 pt-2">
                <span className="block truncate text-sm">
                  {candidate?.UniversityCollege || "Not Provided"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold mb-2 sm:mb-3 text-gray-700 text-lg text-center sm:text-base">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {candidate.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py- bg-custom-bg text-custom-blue rounded-full sm:text-sm text-sm font-medium border border-blue-100 shadow-sm"
              >
                {skill.skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
