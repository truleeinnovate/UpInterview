import React, { useEffect } from "react";


const Candidateprofiledetails = ({ mockinterview, onCloseprofile }) => {
  // Set the document title
  useEffect(() => {
    document.title = "Mock Profile Details";
  }, []);
  return (
    <>
      <div>
        <div
          className="mx-3 sm:mx-5 mt-5 sm:mt-5 border rounded-lg text-sm"
        >
          <div className="p-2">
            {/* Candidate details */}
            <div className="flex justify-between items-center mb-3">
              {/* Candidate Details heading */}
              <p className="font-bold text-lg">Candidate Details:</p>
            </div>

            <div className="flex mb-5 gap-5">
              <div className="flex w-1/2 gap-5">
                <div className="w-32">
                  Candidate
                </div>
                <div className="text-gray-500">
                  {mockinterview.candidateName}
                </div>
              </div>
              {/* higherQualification */}
              <div className="flex w-1/2 gap-5">
                <div className="w-32">
                  Higher Qualification
                </div>
                <div className="text-gray-500">
                  {mockinterview.higherQualification}
                </div>
              </div>


            </div>

            <div className="flex mb-5 gap-5">
              <div className="flex w-1/2 gap-5">
                <div className="w-32">
                  Technology
                </div>
                <div className="text-gray-500">
                  {mockinterview.technology}
                </div>
              </div>
              {/* technnology */}
              <div className="flex w-1/2 gap-5">
                <div className="w-32">
                  Current Experience
                </div>
                <div className="text-gray-500">
                  {mockinterview.currentExperience}
                </div>
              </div>


            </div>

            {/*jobResponsibilities */}

            <div className="flex mb-5 gap-5">
              <div className="flex w-1/2 gap-5">
                <div className="w-32">
                  Job Responsibilities
                </div>
                <div className="text-gray-500">
                  {mockinterview.jobResponsibilities}
                </div>
              </div>


            </div>

            <hr className="border-t border-gray-300 my-2" />

            {/* System details */}
            <p className="font-bold text-lg mb-3">System Details:</p>

            <div className="flex gap-5">
              <div className="w-1/2 flex">
                <div className="w-36 sm:w-1/2">
                  <div className="font-medium">Created By</div>
                </div>
                <div className="w-[53%] sm:w-1/2">
                  <p className="text-gray-500">
                    {mockinterview.createdBy}
                  </p>
                </div>
              </div>

              <div className="w-1/2 flex mb-3">
                {/* Modified By */}
                <div className="w-36 sm:w-1/2">
                  <div className="font-medium">Modified By</div>
                </div>
                <div className="w-[53%] sm:w-1/2">
                  <p className="text-gray-500">
                    {mockinterview.modifiedBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm">
          <div className="mt-2 mx-3 sm:mx-5">
            <div className="font-bold text-xl mb-3">Skills Details:</div>
            {/* Skills */}
            <div className="text-xs rounded-lg border border-gray-300">
              <div className="sm:mx-0">
                <div className="grid grid-cols-3 p-2 text-sm">
                  <div className="block font-medium leading-6 text-gray-900">
                    Skills
                  </div>
                  <div className="block font-medium leading-6 text-gray-900">
                    Experience
                  </div>
                  <div className="block font-medium leading-6 text-gray-900">
                    Expertise
                  </div>
                </div>
                <div className="text-gray-900 dark:text-gray-400 border-t px-2">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody>
                      {mockinterview?.skills?.map((skillEntry, index) => (
                        <tr key={index} className="grid grid-cols-3 gap-4">
                          <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                            {skillEntry.skill}
                          </td>
                          <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                            {skillEntry.experience}
                          </td>
                          <td className="py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                            {skillEntry.expertise}
                          </td>
                        </tr>
                      )) || (
                          <tr>
                            <td
                              colSpan="3"
                              className="py-4 text-center text-gray-500"
                            >
                              No skills available.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Candidateprofiledetails;
