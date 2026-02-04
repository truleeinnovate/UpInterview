// src/components/DetailsTab.jsx
// v1.0.0  -  Ashraf  -  page alignments changes
// v1.0.1  -  Ashok   -  Improved responsiveness
// v1.0.2  -  Ashok   -  Changed ui structure
// v1.0.3  -  Ashok   -  Position issue fixed

import { format } from "date-fns";
import { usePositions } from "../../../../../apiHooks/usePositions";
import Cookies from "js-cookie";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  FileText,
  MessageSquareText,
  MessageCircleQuestion,
  Trophy,
  Star,
  IdCard,
  Edit,
} from "lucide-react";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { Button } from "../../../../../Components/Buttons/Button";
import { useNavigate } from "react-router-dom";

function DetailsTab({ assessment, assessmentQuestions }) {
    const navigate = useNavigate();
  const { positionData } = usePositions();

  const matchedPosition = positionData?.find(
    (pos) => pos?._id === assessment?.Position?._id,
  );

  if (!assessment)
    return (
      <div className="p-4 text-gray-600">Loading assessment details...</div>
    );

  const isEachSection = assessment.passScoreBy === "Each Section";
  const scoringData = isEachSection
    ? assessmentQuestions.sections?.map((section, idx) => ({
        sectionName: `Section ${idx + 1}: ${section.sectionName}`,
        totalScore: section.totalScore || "-",
        passScore: section.passScore || "-",
      })) || []
    : [
        {
          sectionName: "Overall",
          totalScore: assessment.totalScore || "-",
          passScore: assessment.passScore || "-",
        },
      ];

  // Get user token information and check organization field
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const isOrganization = tokenPayload?.organization === true;

  return (
    // v1.0.2 <-------------------------------------------------------------------------------
    // <div className="space-y-8 sm:px-0 px-6 py-6 bg-white rounded-lg shadow-sm">
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    //     {/* Basic Details Section */}
    //     <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">
    //         Basic Details
    //       </h3>
    //       <dl className="space-y-4">
    //         <div className="flex justify-between items-start">
    //           <dt className="text-sm font-medium text-gray-600 flex-1">
    //             Position
    //           </dt>
    //           <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
    //             {matchedPosition?.title.charAt(0).toUpperCase() +
    //               matchedPosition?.title.slice(1) || "-"}
    //           </dd>
    //         </div>
    //         <div className="flex justify-between items-start">
    //           <dt className="text-sm font-medium text-gray-600 flex-1">
    //             Duration
    //           </dt>
    //           <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
    //             {assessment.Duration}
    //           </dd>
    //         </div>
    //         <div className="flex justify-between items-start">
    //           <dt className="text-sm font-medium text-gray-600 flex-1">
    //             Difficulty Level
    //           </dt>
    //           <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
    //             {assessment.DifficultyLevel}
    //           </dd>
    //         </div>
    //         <div className="flex justify-between items-start">
    //           <dt className="text-sm font-medium text-gray-600 flex-1">
    //             Expiry Date
    //           </dt>
    //           <dd className="text-sm font-medium text-gray-900 flex-1 text-right">
    //             {assessment.ExpiryDate
    //               ? format(new Date(assessment.ExpiryDate), "MMM dd, yyyy")
    //               : "-"}
    //           </dd>
    //         </div>
    //       </dl>
    //     </div>

    //     {/* Scoring Section */}
    //     <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
    //       <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">
    //         Scoring
    //       </h3>
    //       <div className="space-y-6">
    //         {scoringData.map((score, idx) => (
    //           <div
    //             key={idx}
    //             className={`${
    //               isEachSection
    //                 ? "pb-4 mb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
    //                 : ""
    //             }`}
    //           >
    //             <h4 className="text-sm font-semibold text-gray-700 mb-3">
    //               {score.sectionName}
    //             </h4>
    //             <dl className="space-y-3">
    //               <div className="flex justify-between">
    //                 <dt className="text-sm font-medium text-gray-600">
    //                   Total Score
    //                 </dt>
    //                 <dd className="text-sm font-medium text-gray-900">
    //                   {score.totalScore}
    //                 </dd>
    //               </div>
    //               <div className="flex justify-between">
    //                 <dt className="text-sm font-medium text-gray-600">
    //                   Pass Score
    //                 </dt>
    //                 <dd className="text-sm font-medium text-gray-900">
    //                   {score.passScore}
    //                 </dd>
    //               </div>
    //               {!isEachSection && (
    //                 <div className="flex justify-between">
    //                   <dt className="text-sm font-medium text-gray-600">
    //                     Questions
    //                   </dt>
    //                   <dd className="text-sm font-medium text-gray-900">
    //                     {assessment.NumberOfQuestions || "-"}
    //                   </dd>
    //                 </div>
    //               )}
    //             </dl>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Additional Information Section */}
    //   {/* v1.0.1 <----------------------------------------------------------------------------- */}
    //   {/* <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
    //     <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">Additional Information</h3>
    //     <div className="space-y-6">
    //       <div>
    //         <h4 className="text-sm font-semibold text-gray-800 mb-3">Instructions</h4>
    //         <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
    //           {assessment.Instructions ? (
    //             <div>
    //               {assessment.Instructions.split('\n').map((paragraph, pIndex) => (
    //                 <div key={pIndex} className="mb-3 last:mb-0">
    //                   {paragraph.startsWith('•') ? (
    //                     <ul className="list-disc pl-5 space-y-1">
    //                       {paragraph
    //                         .split('•')
    //                         .filter((item) => item.trim())
    //                         .map((item, iIndex) => (
    //                           <li key={iIndex}>{item.trim()}</li>
    //                         ))}
    //                     </ul>
    //                   ) : (
    //                     <p>{paragraph}</p>
    //                   )}
    //                 </div>
    //               ))}
    //             </div>
    //           ) : (
    //             <p className="text-gray-500 italic">None provided</p>
    //           )}
    //         </div>
    //       </div>
    //       <div>
    //         <h4 className="text-sm font-semibold text-gray-800 mb-3">Additional Notes</h4>
    //         <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
    //           {assessment.AdditionalNotes || <p className="text-gray-500 italic">None provided</p>}
    //         </div>
    //       </div>
    //     </div>
    //   </div> */}
    //   <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
    //     <h3 className="text-lg font-semibold text-gray-800 mb-5 pb-2 border-b border-gray-200">
    //       Additional Information
    //     </h3>
    //     <div className="space-y-6">
    //       <div>
    //         <h4 className="text-sm font-semibold text-gray-800 mb-3">
    //           Instructions
    //         </h4>
    //         <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200 break-words whitespace-pre-wrap overflow-x-auto">
    //           {assessment.Instructions ? (
    //             <div>
    //               {assessment.Instructions.split("\n").map(
    //                 (paragraph, pIndex) => (
    //                   <div key={pIndex} className="mb-3 last:mb-0">
    //                     {paragraph.startsWith("•") ? (
    //                       <ul className="list-disc pl-5 space-y-1">
    //                         {paragraph
    //                           .split("•")
    //                           .filter((item) => item.trim())
    //                           .map((item, iIndex) => (
    //                             <li key={iIndex}>{item.trim()}</li>
    //                           ))}
    //                       </ul>
    //                     ) : (
    //                       <p className="break-words">{paragraph}</p>
    //                     )}
    //                   </div>
    //                 )
    //               )}
    //             </div>
    //           ) : (
    //             <p className="text-gray-500 italic">None provided</p>
    //           )}
    //         </div>
    //       </div>

    //       <div>
    //         <h4 className="text-sm font-semibold text-gray-800 mb-3">
    //           Additional Notes
    //         </h4>
    //         <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200 break-words whitespace-pre-wrap overflow-x-auto">
    //           {assessment.AdditionalNotes || (
    //             <p className="text-gray-500 italic">None provided</p>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   {/* v1.0.1 -----------------------------------------------------------------------------> */}
    // </div>
    // <div className="overflow-y-auto max-h-[calc(100vh-88px)] p-4 pb-20">
    <div className="overflow-hidden h-full pb-20">
      <div className="flex items-center justify-between w-full mt-4 mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Assessment Template Details
        </h3>
        <Button
          title="Edit Candidate"
          onClick={() =>
            navigate(`/assessment-templates/edit/${assessment._id}`)
          }
          className="inline-flex items-center border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
          <span className="sm:hidden inline ml-1">Assessment Template</span>
        </Button>
      </div>
      <div className="space-y-8">
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {/* Basic Details Section */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4">Basic Details</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BriefcaseIcon className="w-4 h-4 text-custom-blue mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Position</p>
                  <p className="font-medium text-sm text-gray-800">
                    {matchedPosition?.title
                      ? matchedPosition.title.charAt(0).toUpperCase() +
                        matchedPosition.title.slice(1)
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockIcon className="w-4 h-4 text-custom-blue mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-sm text-gray-800">
                    {assessment.Duration}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ChartBarIcon className="w-4 h-4 text-custom-blue mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Difficulty Level</p>
                  <p className="font-medium text-sm text-gray-800">
                    {assessment.DifficultyLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDaysIcon className="w-4 h-4 text-custom-blue mt-1" />
                <div>
                  <p className="text-xs text-gray-500">Expiry Date</p>
                  <p className="font-medium text-sm text-gray-800">
                    {" "}
                    {assessment.ExpiryDate
                      ? format(new Date(assessment.ExpiryDate), "MMM dd, yyyy")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Section */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4">Scoring</h4>
            <div className="space-y-4">
              {scoringData.map((score, idx) => (
                <div
                  key={idx}
                  className={`${
                    isEachSection
                      ? "pb-4 mb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
                      : ""
                  }`}
                >
                  <h4 className="text-xs font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    {score.sectionName}
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Trophy className="w-4 h-4 text-custom-blue mt-1" />

                      <div>
                        <p className="text-xs text-gray-500">Total Score</p>
                        <p className="font-medium text-sm text-gray-800">
                          {score.totalScore}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="w-4 h-4 text-custom-blue mt-1" />

                      <div>
                        <p className="text-xs text-gray-500">Pass Score</p>
                        <p className="font-medium text-sm text-gray-800">
                          {score.passScore}
                        </p>
                      </div>
                    </div>

                    {!isEachSection && (
                      <div className="flex items-start gap-3">
                        <MessageCircleQuestion className="w-4 h-4 text-custom-blue mt-1" />
                        <div>
                          <p className="text-xs text-gray-500"> Questions</p>
                          <p className="font-medium text-sm text-gray-800">
                            {assessment.NumberOfQuestions || "-"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4 pb-2 flex items-start gap-2">
            <div className="p-2 bg-custom-bg rounded-lg">
              <MessageSquareText className="w-5 h-5 text-gray-500" />
            </div>
            Additional Information
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                Instructions
              </h4>
              <div className="text-sm text-gray-700 p-4 rounded-lg border border-gray-200 break-words whitespace-pre-wrap overflow-x-auto">
                {assessment.Instructions ? (
                  <div>
                    {assessment.Instructions.split("\n").map(
                      (paragraph, pIndex) => (
                        <div key={pIndex} className="mb-3 last:mb-0">
                          {paragraph.startsWith("•") ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {paragraph
                                .split("•")
                                .filter((item) => item.trim())
                                .map((item, iIndex) => (
                                  <li key={iIndex}>{item.trim()}</li>
                                ))}
                            </ul>
                          ) : (
                            <p className="break-words">{paragraph}</p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">None provided</p>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="p-2 bg-custom-bg rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <h4>Additional Notes</h4>
              </div>
              <div className="text-sm text-gray-700 bg-custom-bg p-4 rounded-lg break-words whitespace-pre-wrap overflow-x-auto">
                {assessment.AdditionalNotes || (
                  <p className="text-gray-500 italic">None provided</p>
                )}
              </div>
            </div>

            {/* External ID Field - Only show for organization users */}
            {assessment?.externalId && isOrganization && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="p-2 bg-custom-bg rounded-lg">
                    <IdCard className="w-5 h-5 text-gray-500" />
                  </div>
                  <h4>External ID</h4>
                </div>
                <div className="text-sm text-gray-700 bg-custom-bg p-4 rounded-lg break-words">
                  {assessment.externalId}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    // v1.0.2 ------------------------------------------------------------------------------->
  );
}

export default DetailsTab;
