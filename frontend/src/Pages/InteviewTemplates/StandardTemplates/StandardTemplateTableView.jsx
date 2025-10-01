import React, { useState } from "react";
import TemplateModal from "./TemplateModal";
import { Eye } from "lucide-react";
import { usePermissions } from "../../../Context/PermissionsContext";
import { useNavigate } from "react-router-dom";

const formatOptions = [
  { label: "Online / Virtual", value: "online" },
  { label: "Face to Face / Onsite", value: "offline" },
  { label: "Hybrid (Online + Offline)", value: "hybrid" },
];

const StandardTemplateTableView = ({ templatesData }) => {
  const { effectivePermissions } = usePermissions();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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

  return (
    <>
      <div className="w-full">
        <div className="inline-block min-w-full align-middle">
          <div className="h-[calc(100vh-12rem)] overflow-y-auto pb-6 scrollbar-thin category-section">
            {Object.entries(groupedTemplates).map(([format, formatTemplates]) => (
              <div key={format} className="mb-8">
                <h2 className="category-title">{format}</h2>
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-100 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[20%]">
                        Template
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[25%]">
                        Description
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[10%]">
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
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Eye
                              className="w-4 h-4 cursor-pointer"
                              onClick={() => handleView(template)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
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