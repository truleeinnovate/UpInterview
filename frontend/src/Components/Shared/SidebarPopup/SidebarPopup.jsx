// v1.0.0 - Ashok - Improved responsiveness
/* v1.0.1 - Ashok - Added setIsFullscreen using this for some popup's alignments are aligned
                    added createPortal it avoids z-index issues at any level
*/
// v1.0.2 - Ashok - Added subtitle and Icon
// v1.0.3 - Ashok - fixed padding
// v1.0.4 - Ashok - fixed some responsiveness issue
// v1.0.5 - Ashok - tried to give padding at the bottom because some mobile screens require padding bottom

// import { useState } from "react";
// import { Minimize, Expand, X, ExternalLink } from "lucide-react";
// import { FaEdit } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { createPortal } from "react-dom";

// function SidebarPopup({
//   title,
//   subTitle = "", // v1.0.2 <--------------------------->
//   children,
//   onClose,
//   id, // needed for edit
//   showEdit = false,
//   showExternal = false,
//   setIsFullscreen, // v1.0.1 <--------------------------->
//   icon = null, // v1.0.2 <--------------------------->
// }) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const navigate = useNavigate();

//   // v1.0.1 <-----------------------------------------------------------------------------------------
//   // const toggleExpand = () => setIsExpanded(!isExpanded);
//   // setIsFullscreen(isExpanded); // v1.0.1

//   const toggleExpand = () => {
//     setIsExpanded((prev) => {
//       const newValue = !prev;
//       if (setIsFullscreen) {
//         setIsFullscreen(newValue); // call only if provided
//       }
//       return newValue;
//     });
//   };

//   const popupContent = (
//     <div className="fixed inset-0 z-50 flex justify-end">
//       {/* Backdrop */}
//       <div
//         className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* Content */}
//       {/* v1.0.0 <----------------------------------------------------------------------------- */}
//       <div
//         className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full h-screen flex flex-col ${
//           isExpanded
//             ? "w-full"
//             : // : "w-full sm:w-full md:w-full lg:w-full xl:w-1/2 2xl:w-1/2"
//               "w-full sm:w-full md:w-full lg:w-full xl:w-1/2 2xl:w-1/2"
//         }`}
//         // v1.0.0 ----------------------------------------------------------------------------->
//       >
//         {/* v1.0.4 <---------------------------------------------------------- */}
//         <div className="sticky top-0 bg-white px-4 py-3 z-10">
//         {/* v1.0.4 ----------------------------------------------------------> */}
//           <div className="flex justify-between items-center px-2">
//             {/* v1.0.2 <----------------------------------------------------------- */}
//             <div className="flex items-center gap-3">
//               {icon && (
//                 <span className="p-2 bg-indigo-100 rounded-xl text-custom-blue w-10 h-10 flex-shrink-0">
//                   {icon}
//                 </span>
//               )}
//               <div>
//                 <h2 className="sm:text-xl text-2xl font-semibold text-custom-blue">
//                   {title}
//                 </h2>
//                 <p className="text-sm text-gray-500">{subTitle}</p>
//               </div>
//             </div>
//             {/* v1.0.2 <----------------------------------------------------------- */}

//             {/* Action buttons */}
//             <div className="flex items-center gap-2">
//               {showEdit && id && (
//                 <button
//                   onClick={() => navigate(`/candidate/edit/${id}`)}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                   title="Edit"
//                 >
//                   <FaEdit className="w-5 h-5 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100" />
//                 </button>
//               )}

//               {/* Expand/Minimize (always visible) */}
//               <button
//                 onClick={toggleExpand}
//                 // v1.0.0 <-----------------------------------------------------------------------------
//                 // className="sm:hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 className="sm:hidden md:hidden lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 // v1.0.0 ----------------------------------------------------------------------------->
//                 title={isExpanded ? "Minimize" : "Expand"}
//               >
//                 {isExpanded ? (
//                   <Minimize className="w-5 h-5 text-gray-500" />
//                 ) : (
//                   <Expand className="w-5 h-5 text-gray-500" />
//                 )}
//               </button>

//               {showExternal && id && (
//                 <button
//                   onClick={() =>
//                     window.open(`/candidate/full-screen/${id}`, "_blank")
//                   }
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                   title="Open in Fullscreen"
//                 >
//                   <ExternalLink className="w-5 h-5 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100" />
//                 </button>
//               )}

//               {/* Close (always visible) */}
//               <button
//                 onClick={onClose}
//                 className="p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100"
//                 title="Close"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Popup content */}
//         {/* v1.0.5 <----------------------------------------------------------------- */}
//         <div className="flex-grow overflow-y-auto px-4 sm:pb-12">{children}</div>
//         {/* v1.0.5 <----------------------------------------------------------------- */}
//       </div>
//     </div>
//   );

//   return createPortal(popupContent, document.body);
//   // v1.0.1 ----------------------------------------------------------------------------------------->
// }

// export default SidebarPopup;

// v1.0.0 - Ashok - Improved responsiveness
/* v1.0.1 - Ashok - Added setIsFullscreen using this for some popup's alignments are aligned
                    added createPortal it avoids z-index issues at any level
*/
// v1.0.2 - Ashok - Added subtitle and Icon
// v1.0.3 - Ashok - fixed padding
// v1.0.4 - Ashok - fixed some responsiveness issue
// v1.0.5 - Ashok - tried to give padding at the bottom because some mobile screens require padding bottom
// v1.0.6 - Ashok - Made Edit button fully reusable (supports onEdit or editPath, optional, safe fallback)

import { useState } from "react";
import { Minimize, Expand, X, ExternalLink } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

function SidebarPopup({
  title,
  titleRight = "", // custom element
  subTitle = "",
  children,
  onClose,
  id,
  showEdit = false, // if false => Edit button won't render
  showExternal = false,
  setIsFullscreen,
  icon = null,
  onEdit, // optional callback for edit
  editPath, // optional route prefix for edit
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const newValue = !prev;
      if (setIsFullscreen) setIsFullscreen(newValue);
      return newValue;
    });
  };

  const handleEdit = () => {
    if (!id) return; // no id, do nothing
    if (onEdit) {
      onEdit(id); // use callback if provided
    } else if (editPath) {
      navigate(`${editPath}/${id}`); // fallback to route path
    } else {
      console.warn(
        "No onEdit or editPath provided for SidebarPopup edit action."
      );
    }
  };

  const popupContent = (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Main Popup */}
      <div
        className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full h-screen flex flex-col ${
          isExpanded
            ? "w-full"
            : "w-full sm:w-full md:w-full lg:w-full xl:w-1/2 2xl:w-1/2"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 py-3 z-10">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              {icon && (
                <span className="p-2 bg-indigo-100 rounded-xl text-custom-blue w-10 h-10 flex-shrink-0">
                  {icon}
                </span>
              )}
              <div>
                <h2 className="flex items-center sm:text-xl text-2xl font-semibold text-custom-blue">
                  {title}
                  {titleRight && <div className="ml-2">{titleRight}</div>}
                </h2>
                {subTitle && (
                  <p className="text-sm text-gray-500 mt-2">{subTitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Fully safe Edit button */}
              {showEdit && id && (onEdit || editPath) && (
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FaEdit className="w-5 h-5 text-gray-500 hover:text-gray-600" />
                </button>
              )}

              {/* Expand / Minimize */}
              <button
                onClick={toggleExpand}
                className="sm:hidden md:hidden lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* External Link */}
              {showExternal && id && (
                <button
                  onClick={() =>
                    window.open(`/candidate/full-screen/${id}`, "_blank")
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Open in Fullscreen"
                >
                  <ExternalLink className="w-5 h-5 text-gray-500 hover:text-gray-600" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-4 sm:pb-12">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
}

export default SidebarPopup;
