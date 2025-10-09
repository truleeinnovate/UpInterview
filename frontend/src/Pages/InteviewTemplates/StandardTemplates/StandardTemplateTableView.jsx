// v1.0.0 - Ashok - Fixed style issues and added loading view
// v1.0.1 - Ashok - Adjusted table height
// v1.0.2 - Ashok - changed UI
// v1.0.3 - Ashok - commented some options
// v1.0.4 - Ashok - adjusted width of rows in table
// v1.0.5 - Ashok - adjusted width of rows in table

import React, { useEffect, useState } from "react";
import TemplateModal from "./TemplateModal";
import { Eye, Files } from "lucide-react";
import { usePermissions } from "../../../Context/PermissionsContext";
import { useNavigate } from "react-router-dom";
// v1.0.0 <---------------------------------------------------------------------------------
import { ReactComponent as FiMoreHorizontal } from "../../../icons/FiMoreHorizontal.svg";
// v1.0.0 --------------------------------------------------------------------------------->

// v1.0.2 <----------------------------------------------------------
// v1.0.3 <----------------------------------------------------------
// v1.0.4 <----------------------------------------------------------
const formatOptions = [
  //   { label: "Online / Virtual", value: "online" },
  //   { label: "Face to Face / Onsite", value: "offline" },
  //   { label: "Hybrid (Online + Offline)", value: "hybrid" },
  { label: "Recommended (Online)", value: "online" },
  { label: "Hybrid (Mix of Online & Onsite)", value: "hybrid" },
  { label: "On-Site (Traditional)", value: "offline" },
  // { label: "Specialized Technical", value: "hybrid" },
  // { label: "Company-Specific", value: "online" },
  // { label: "Experience Level", value: "offline" },
  // { label: "Leadership", value: "hybrid" },
  // { label: "Employment Type", value: "online" },
  // { label: "Specialized Requirements", value: "offline" },
];
// v1.0.4 ---------------------------------------------------------->
// v1.0.3 ---------------------------------------------------------->
// v1.0.2 ---------------------------------------------------------->

const StandardTemplateTableView = ({ templatesData }) => {
  const navigate = useNavigate();
  const handleCloneClick = (template) => {
    navigate(`/interview-templates/${template._id}/clone`);
  };
  const { effectivePermissions } = usePermissions();
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
  // v1.0.2 <----------------------------------------------------------------------------
  const LoadingView = () => {
    return (
      <div>
        {[...Array(2)].map((_, catIndex) => (
          <div key={catIndex} className="mb-8">
            {/* Category heading shimmer */}
            <div className="bg-gray-50 py-2 mb-4 px-6">
              <div className="h-5 w-40 rounded shimmer"></div>
            </div>

            {/* Table shimmer */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              {/* Sticky header shimmer */}
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
                  <th className="px-3 py-2">
                    <div className="h-3 w-10 rounded shimmer"></div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
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
                    <td className="px-3 py-2">
                      <div className="h-4 w-8 rounded shimmer"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };
  // v1.0.2 ---------------------------------------------------------------------------->
  // v1.0.0 ---------------------------------------------------------------------------->
  const formatOptionsfortable = [
    { label: "Online / Virtual", value: "online" },
    { label: "Face to Face / Onsite", value: "offline" },
    { label: "Hybrid (Online + Onsite)44444", value: "hybrid" },
  ];

  const getFormatLabelfortable = (formatValue) => {
    const option = formatOptionsfortable.find(
      (opt) => opt.value === formatValue
    );
    return option ? option.label : formatValue || "Uncategorized";
  };
  return (
    <>
      {/* v1.0.2 <------------------------------------------------------------------------------ */}
      <div className="w-full">
        <div className="inline-block min-w-full align-middle">
          <div className="h-[calc(100vh-12.6rem)] overflow-y-auto pb-6 scrollbar-thin category-section">
            {loading ? (
              <LoadingView />
            ) : (
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                {/* Single fixed header */}
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[8%]">
                      Format
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[8%]">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[6%]">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* All content inside one tbody */}
                {/* v1.0.4 <--------------------------------------------------- */}
                {/* v1.0.5 <--------------------------------------------------- */}
                <tbody className="divide-y divide-gray-200">
                  {formatOptions
                    .map((opt) => opt.label)
                    .filter((label) => groupedTemplates[label]) // only include existing groups
                    .map((format) => {
                      const templates = groupedTemplates[format];
                      return (
                        <React.Fragment key={format}>
                          {/* Category row */}
                          <tr className="bg-gray-50">
                            <td
                              colSpan="7"
                              className="text-xl text-custom-blue font-bold py-4 px-4"
                            >
                              {format}
                            </td>
                          </tr>

                          {/* Templates under this format */}
                          {templates.map((template) => (
                            <tr
                              key={template.id}
                              className="hover:bg-gray-50 cursor-pointer"
                            >
                              {/* Template column */}
                              <td
                                className="px-3 py-2 text-sm text-gray-700"
                                onClick={() => handleView(template)}
                              >
                                <span className="px-3 py-2 text-sm text-gray-600 truncate max-w-[160px]">
                                  {template.title}
                                </span>
                              </td>

                              {/* Description */}
                              <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-[140px]">
                                {template.description}
                              </td>

                              {/* Rounds */}
                              <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-[140px]">
                                {renderRounds(template.rounds)}
                              </td>

                              {/* Best For */}
                              <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-[160px]">
                                {template.bestFor}
                              </td>

                              {/* Format */}
                              <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-[160px]">
                                {getFormatLabelfortable(template.format)}
                              </td>

                              {/* Status */}
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

                              {/* Action */}
                              <td className="px-3 py-2 relative">
                                <button
                                  className="ml-2 p-1 rounded hover:bg-gray-100"
                                  onClick={(e) => toggleMenu(template._id, e)}
                                >
                                  <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
                                </button>

                                {menuOpen === template._id && (
                                  <div
                                    className={`absolute right-10 w-40 bg-white rounded-md shadow-lg border z-20 ${
                                      menuDirection === "up"
                                        ? "bottom-full mb-2"
                                        : "mt-2"
                                    }`}
                                  >
                                    <ul className="py-1 text-sm text-gray-700">
                                      {effectivePermissions.InterviewTemplates
                                        ?.View && (
                                        <li
                                          onClick={() => handleView(template)}
                                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                          <Eye className="w-4 h-4 text-custom-blue mr-1" />
                                          View Details
                                        </li>
                                      )}
                                      {effectivePermissions.InterviewTemplates
                                        ?.Clone && (
                                        <li
                                          onClick={() =>
                                            handleCloneClick(template)
                                          }
                                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                          <Files className="w-4 h-4 text-custom-blue mr-1" />
                                          Clone
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                </tbody>
                {/* v1.0.4 ---------------------------------------------------> */}
                {/* v1.0.5 ---------------------------------------------------> */}
              </table>
            )}
          </div>
        </div>
      </div>
      {/* v1.0.2 ------------------------------------------------------------------------------> */}

      {selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={closeModal} />
      )}
    </>
  );
};

export default StandardTemplateTableView;
