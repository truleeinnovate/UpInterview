/* v1.0.0 Ashok - added optional chaining (ex. value?.value).
  to avoid errors when data is undefined or null and removed outer scrollbar using custom hook and 
  fixed popup's z-index issue
*/


import { format, parseISO, isValid } from "date-fns";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Users,
} from "lucide-react";
// v1.0.0 <------------------------------------------------------------
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.0 ------------------------------------------------------------>

const PositionDetails = ({ position, onClose }) => {
  // <-------------------------------------------
  useScrollLock(true);
  // ------------------------------------------->
  return (
    // v1.0.0 <----------------------------------------------------------------------------------------------
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 z-50">
          {/* v1.0.0 ---------------------------------------------------------------------------------------------> */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-custom-blue sm:text-lg">
                {position?.positionInfo?.title || "N/A"}
              </h3>
              <p className="text-gray-600">
                {position?.positionInfo?.companyname || "N/A"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company Name</p>
                    <p className="font-medium text-gray-800">
                      {position?.positionInfo?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    {/* v1.0.0 <-------------------------------------------------------------------------------------------------------- */}
                    <p className="font-medium text-gray-800">
                      {/* {position?.positionInfo?.minexperience}-
                      {position?.positionInfo?.maxexperience} */}
                      {position?.positionInfo?.minexperience != null &&
                      position?.positionInfo?.maxexperience != null
                        ? `${position.positionInfo.minexperience}-${position.positionInfo.maxexperience}`
                        : "N/A"}
                    </p>
                    {/* v1.0.0 --------------------------------------------------------------------------------------------------------> */}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Position Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Company name</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {position?.positionInfo?.companyname || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Location</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {/* v1.0.0 <-------------------------------------------------------- */}
                    {position?.positionInfo?.Location || "Not disclosed"}
                    {/* v1.0.0 --------------------------------------------------------> */}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4 text-custom-blue" />
                    <span className="text-sm">Salary Range</span>
                  </div>
                  {/* v1.0.0 <-------------------------------------------------------------------- */}
                  <p className="text-sm font-medium text-gray-800">
                    {position?.positionInfo?.minSalary &&
                    position?.positionInfo?.maxSalary
                      ? `${position?.positionInfo?.minSalary} - ${position?.positionInfo?.maxSalary}`
                      : position?.positionInfo?.minSalary
                      ? `${position?.positionInfo?.minSalary} - Not Disclosed`
                      : position?.positionInfo?.maxSalary
                      ? `0 - ${position?.positionInfo?.maxSalary}`
                      : "Not Disclosed"}
                  </p>
                  {/* v1.0.0 --------------------------------------------------------------------> */}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <ExternalLink className="w-4 h-4 text-custom-blue" />
                    <span className="text-sm">No of Positions</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {position?.positionInfo?.NoofPositions || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {/* v1.0.0 <--------------------------------------------------------------------- */}
                {position?.positionInfo?.skills?.map((s) => (
                  <span
                    key={s?._id}
                    className="px-3 py-1.5 bg-custom-bg text-custom-blue rounded-full text-sm font-medium"
                  >
                    {s?.skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Job Description</h4>
              <div className="flex flex-wrap gap-2">
                {position?.positionInfo?.jobdescription}
              </div>
            </div>

            {/* have to add feilds here the static data  */}

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">
                Application Progress
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800">
                        Application Submitted
                      </p>
                      <span className="text-xs text-gray-500">
                        {position?.applicationDate &&
                        isValid(parseISO(position?.applicationDate))
                          ? format(
                              parseISO(position?.applicationDate),
                              "MMM dd, yyyy"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-green-100 rounded-full">
                        <div className="h-1 bg-green-500 rounded-full w-full"></div>
                      </div>
                      <span className="text-xs font-medium text-green-600">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                {/* v1.0.0 ---------------------------------------------------------------------> */}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800">
                        Initial Screening
                      </p>
                      <span className="text-xs text-gray-500">
                        Mar 15, 2024
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-blue-100 rounded-full">
                        <div className="h-1 bg-blue-500 rounded-full w-3/4"></div>
                      </div>
                      <span className="text-xs font-medium text-blue-600">
                        In Progress
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800">
                        Technical Interview
                      </p>
                      <span className="text-xs text-gray-500">Pending</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-500">
                        Not Started
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-custom-bg rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Next Steps</h4>
              <p className="text-sm text-custom-blue">
                Technical interview scheduled for next week. Please prepare for
                system design and coding rounds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionDetails;
