// v1.0.0 - Ashok - Fixed style issues and added loading view
// v1.0.1 - Ashok - Adjusted table height

import React, { useEffect, useState } from "react";
import TemplateModal from "./TemplateModal";
import { Eye, FileText } from "lucide-react";
import { usePermissions } from "../../../Context/PermissionsContext";
import { useNavigate } from "react-router-dom";
// v1.0.0 <---------------------------------------------------------------------------------
import { ReactComponent as FiMoreHorizontal } from "../../../icons/FiMoreHorizontal.svg";
// v1.0.0 --------------------------------------------------------------------------------->

const formatOptions = [
  { label: "Online / Virtual", value: "online" },
  { label: "Face to Face / Onsite", value: "offline" },
  { label: "Hybrid (Online + Offline)", value: "hybrid" },
];

const StandardTemplateTableView = ({ templatesData, handleClone }) => {
  const { effectivePermissions } = usePermissions();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // v1.0.0 <------------------------------------------------------------
  const handleDelete = (template) => {
    console.log("Deleting:", template);
  };

  const handleDetails = (template) => {
    console.log("Viewing details:", template);
  };

  const [menuOpen, setMenuOpen] = useState(null);
  const [menuDirection, setMenuDirection] = useState("down");

  const toggleMenu = (id, e) => {
    if (menuOpen === id) {
      setMenuOpen(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // decide direction
    if (spaceBelow < 150 && spaceAbove > spaceBelow) {
      setMenuDirection("up");
    } else {
      setMenuDirection("down");
    }

    setMenuOpen(id);
  };

  const [loading, setLoading] = useState(true);

  // Simulate API call delay (replace with actual loading condition)
  useEffect(() => {
    if (templatesData && templatesData.length > 0) {
      setLoading(false);
    }
  }, [templatesData]);
  // v1.0.0 ------------------------------------------------------------>

  const closeModal = () => {
    setSelectedTemplate(null);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const getFormatLabel = (formatValue) => {
    const option = formatOptions.find((opt) => opt.value === formatValue);
    return option ? option.label : formatValue || "Uncategorized";
  };

  // Render rounds as roundTitle values joined by " → "
  const renderRounds = (rounds) => {
    if (!Array.isArray(rounds) || rounds.length === 0) return "No rounds";
    return rounds.map((item, index) => (
      <span key={index}>
        {item.roundTitle}
        {index !== rounds.length - 1 && " → "}
      </span>
    ));
  };

  // Group templates by format
  const groupedTemplates = templatesData.reduce((acc, template) => {
    const format = getFormatLabel(template.format);
    if (!acc[format]) {
      acc[format] = [];
    }
    acc[format].push(template);
    return acc;
  }, {});

  const handleView = (template) => {
    if (effectivePermissions.InterviewTemplates?.View) {
      navigate(`/interview-templates/${template._id}`);
    }
  };
  // v1.0.0 <----------------------------------------------------------------------------
  const LoadingView = () => {
    return (
      <div>
        {[...Array(2)].map(
          (
            _,
            catIndex // show 2 category sections while loading
          ) => (
            <div key={catIndex} className="mb-8">
              {/* Category heading shimmer */}
              <div className="border-b-2 border-gray-100 py-2 mb-4 px-6">
                <div className="h-5 w-40 rounded shimmer"></div>
              </div>

              {/* Table shimmer */}
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-100 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">
                      <div className="h-3 w-20 rounded shimmer"></div>
                    </th>
                    <th className="px-3 py-2">
                      <div className="h-3 w-24 rounded shimmer"></div>
                    </th>
                    <th className="px-3 py-2">
                      <div className="h-3 w-28 rounded shimmer"></div>
                    </th>
                    <th className="px-3 py-2">
                      <div className="h-3 w-16 rounded shimmer"></div>
                    </th>
                    <th className="px-3 py-2">
                      <div className="h-3 w-14 rounded shimmer"></div>
                    </th>
                    <th className="px-3 py-2">
                      <div className="h-3 w-12 rounded shimmer"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="h-4 w-32 rounded shimmer"></div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 w-48 rounded shimmer"></div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 w-40 rounded shimmer"></div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 w-28 rounded shimmer"></div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 w-20 rounded shimmer"></div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-4 w-16 rounded shimmer"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    );
  };
  // v1.0.0 ---------------------------------------------------------------------------->

  return (
    <>
      <div className="w-full">
        <div className="inline-block min-w-full align-middle">
          {/* v1.0.1 <---------------------------------------------------------------------------------------- */}
          <div className="h-[calc(100vh-15.6rem)] overflow-y-auto pb-6 scrollbar-thin category-section">
          {/* v1.0.1 ----------------------------------------------------------------------------------------> */}
            {loading ? (
              <LoadingView />
            ) : (
              Object.entries(groupedTemplates).map(
                ([format, formatTemplates]) => (
                  <div key={format} className="mb-8">
                    <h2 className="border-b-2 border-custom-blue text-xl text-custom-blue font-bold py-2 mb-4 px-6">
                      {format}
                    </h2>
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <thead className="bg-gray-100 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                            Template
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                            Description
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[24%]">
                            Rounds
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">
                            Best For
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[15%]">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formatTemplates.map((template) => (
                          <tr
                            key={template.id}
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="px-3 py-2 text-sm text-gray-700">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium text-gray-800"
                                    onClick={() => handleView(template)}
                                  >
                                    {template.title}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {template.description}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {renderRounds(template.rounds)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {template.bestFor}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  template.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {capitalizeFirstLetter(template.status)}
                              </span>
                            </td>
                            {/* v1.0.0 <---------------------------------------------------------------------- */}
                            <td className="px-3 py-2 relative">
                              {/* Three dot menu trigger */}
                              <button
                                className="ml-2 p-1 rounded hover:bg-gray-100"
                                onClick={(e) => toggleMenu(template._id, e)}
                              >
                                <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
                              </button>

                              {/* Dropdown Menu */}
                              {menuOpen === template._id && (
                                <div
                                  className={`absolute right-10 w-40 bg-white rounded-md shadow-lg border z-20 
                                    ${
                                      menuDirection === "up"
                                        ? "bottom-full mb-2"
                                        : "mt-2"
                                    }`}
                                >
                                  <ul className="py-1 text-sm text-gray-700">
  {effectivePermissions.InterviewTemplates?.View && (
    <li
      onClick={() => handleView(template)}
      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
    >
      <Eye className="w-4 h-4 text-custom-blue mr-1" />
      View Details
    </li>
  )}
  {effectivePermissions.InterviewTemplates?.Clone && (
    <li
      onClick={() => handleClone(template)}
      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
    >
      <FileText className="w-4 h-4 text-custom-blue mr-1" />
      Clone
    </li>
  )}
</ul>
                                </div>
                              )}
                            </td>
                            {/* v1.0.0 ----------------------------------------------------------------------> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={closeModal} />
      )}
    </>
  );
};

export default StandardTemplateTableView;
