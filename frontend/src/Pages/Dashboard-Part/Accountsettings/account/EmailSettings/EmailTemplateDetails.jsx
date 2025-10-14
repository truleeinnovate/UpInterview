// v1.0.0 - Ashok - Fixed z-index issue when loading using createPortal
// v1.0.1 - Ashok - fixed scrolling issue

/* eslint-disable react/prop-types */

import { Eye, Lock, CheckCircle2, XCircle } from "lucide-react";
import Loading from "../../../../../Components/Loading";
// v1.0.0 <---------------------------------------------------
import { createPortal } from "react-dom";
// v1.0.0 --------------------------------------------------->

function EmailTemplates({
  templates,
  onPreview,
  isLoading,
  //   onClone,
  //   onEdit
}) {
  return (
    // v1.0.1 <-------------------------------------------------------------------------
    <div className="overflow-y-auto max-h-[calc(100vh-250px)] space-y-4 px-4 pb-4">
      {/* v1.0.1 -------------------------------------------------------------------------> */}
      {isLoading ? (
        // <div className="flex items-center justify-center h-screen">
        //   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        // </div>

        // v1.0.0 <--------------------------------------------------------------
        // <Loading message="Loading email templates..." />

        createPortal(
          <div>
            <Loading message="Loading email templates..." />
          </div>,
          document.body
        )
      ) : // v1.0.0 <---------------------------------------------------------------

      templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No email templates found matching your search.
        </div>
      ) : (
        templates.map((template) => (
          <div
            key={template._id}
            className="border bg-white rounded-lg px-4 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2 space-y-2 sm:space-y-0">
              <div>
                <div className="flex flex-wrap items-center pt-4  gap-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                    {template.category}
                  </span>
                  {template.isSystem ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-xs rounded-full text-blue-600">
                      <Lock className="h-3 w-3" />
                      System
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-purple-50 text-xs rounded-full text-purple-600">
                      Custom
                    </span>
                  )}
                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                      template.isActive
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {template.isActive ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(template.updatedAt).toLocaleDateString("en-CA")}
                </p>
              </div>
              <div className="flex py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onPreview(template)}
                  className="p-2 text-gray-600 hover:text-custom-blue hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="h-5 w-5" />
                </button>
                {/* <button
                    onClick={() => onClone(template._id)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Clone"
                  >
                    <Copy className="h-5 w-5" />
                  </button> */}
                {/* {!template.isSystem && (
                    <>
                      <button
                        onClick={() => onEdit(template)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </>
                  )} */}
              </div>
            </div>
            <div className="rounded p-3 mb-4 text-sm text-gray-600">
              {/* v1.0.0 <------------------------------------------------------- */}
              <p
                className="line-clamp-1  w-1/2 prose max-w-none pb-1"
                dangerouslySetInnerHTML={{ __html: template.body }}
              ></p>
              {/* v1.0.0 --------------------------------------------------------> */}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default EmailTemplates;
