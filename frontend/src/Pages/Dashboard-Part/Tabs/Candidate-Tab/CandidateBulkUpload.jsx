import React, { useState, useRef } from "react";
import Papa from "papaparse";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { useCandidates } from "../../../../apiHooks/useCandidates";
import { validateCandidateForm } from "../../../../utils/CandidateValidation";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import LoadingButton from "../../../../Components/LoadingButton";
import { notify } from "../../../../services/toastService";
import { Upload, AlertCircle, CheckCircle2, Download } from "lucide-react";

const CandidateBulkUpload = ({ onClose }) => {
  const [csvData, setCsvData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { addOrUpdateCandidate } = useCandidates();
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;

  const downloadTemplate = () => {
    const headers = [
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "CountryCode",
      "Date_Of_Birth",
      "Gender",
      "HigherQualification",
      "UniversityCollege",
      "CurrentExperience",
      "RelevantExperience",
      "CurrentRole",
      "skills",
    ];

    const sampleSkills =
      '[{"skill":"JavaScript","experience":"0-1 Years","expertise":"Basic"},{"skill":"React","experience":"0-1 Years","expertise":"Basic"},{"skill":"MongoDB","experience":"0-1 Years","expertise":"Basic"}]';

    const exampleRow = [
      "John",
      "Doe",
      "johndoe@example.com",
      "9999999999",
      '"+91"',
      "15-08-2000",
      "Male",
      "Bachlore of Engineering (BE/BTech)",
      "Example University",
      "2",
      "1",
      "Agile Coach",
      `"${sampleSkills.replace(/"/g, '""')}"`,
    ];

    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "Candidate_Bulk_Upload_Template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = (file) => {
    if (!file) return;
    setCsvData([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify.error("Please upload a valid CSV file.");
      return;
    }

    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        validateRows(results.data);
      },
      error: (error) => {
        notify.error("Error parsing CSV: " + error.message);
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const validateRows = (rows) => {
    const results = rows.map((row, index) => {
      let formattedDOB = "";
      if (row.Date_Of_Birth) {
        const parts = row.Date_Of_Birth.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 2 && parts[2].length === 4) {
            formattedDOB = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else if (parts[0].length === 4) {
            formattedDOB = row.Date_Of_Birth;
          }
        }
      }

      const formattedData = {
        FirstName: row.FirstName?.trim() || "",
        LastName: row.LastName?.trim() || "",
        Email: row.Email?.trim() || "",
        Phone: row.Phone?.trim() || "",
        CountryCode: row.CountryCode?.replace(/"/g, "").trim() || "+91",
        HigherQualification: row.HigherQualification?.trim() || "",
        CurrentExperience: Number(row.CurrentExperience) || 0,
        RelevantExperience: Number(row.RelevantExperience) || 0,
        CurrentRole: row.CurrentRole?.trim() || "",
        Gender: row.Gender?.trim() || "",
        UniversityCollege: row.UniversityCollege?.trim() || "",
        Date_Of_Birth: formattedDOB,
      };

      let skills = [];
      if (row.skills) {
        try {
          const sanitizedSkills = row.skills
            .replace(/'/g, '"')
            .replace(/(\w+):/g, '"$1":');
          const parsedSkills = JSON.parse(sanitizedSkills);
          skills = parsedSkills.map((s) => ({
            skill: s.skill || "",
            experience: s.experience || "0",
            expertise: s.expertise || "Medium",
          }));
        } catch (e) {
          skills = row.skills.split(",").map((s) => ({
            skill: s.trim(),
            experience: "1",
            expertise: "Medium",
          }));
        }
      }

      const { formIsValid, newErrors } = validateCandidateForm(
        formattedData,
        skills,
        {},
      );

      return {
        data: { ...formattedData, skills, ownerId: userId, tenantId: orgId },
        errors: newErrors,
        isValid: formIsValid,
        rowNumber: index + 2,
      };
    });

    setCsvData(results);
  };

  const handleUpload = async () => {
    const validEntries = csvData.filter((item) => item.isValid);
    if (validEntries.length === 0) {
      notify.error("No valid rows found to upload.");
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const entry of validEntries) {
        try {
          await addOrUpdateCandidate({
            data: entry.data,
            profilePicFile: null,
            resumeFile: null,
          });
          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      if (successCount > 0)
        notify.success(`Successfully uploaded ${successCount} candidates.`);
      if (failCount > 0)
        notify.error(`${failCount} candidates failed to save.`);
      if (failCount === 0) onClose();
    } catch (error) {
      notify.error("Bulk upload interrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  // const previewHeaders = csvData.length > 0 ? Object.keys(csvData[0].data) : [];
  const previewHeaders =
    csvData.length > 0
      ? Object.keys(csvData[0].data).filter(
          (h) => h !== "ownerId" && h !== "tenantId",
        )
      : [];

  return (
    <SidebarPopup title="Bulk Upload Candidates" onClose={onClose}>
      <div className="p-6 min-h-full flex flex-col">
        <div className="flex flex-col bg-custom-blue/10 border border-custom-blue/20 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-custom-blue font-medium">
              How to use bulk upload
            </h4>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-xs font-semibold bg-custom-blue text-white px-3 py-1.5 rounded hover:bg-custom-blue/90 transition-all shadow-sm"
            >
              <Download size={14} /> Download CSV Template
            </button>
          </div>
          <ul className="space-y-1">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 text-custom-blue text-xs font-semibold">
                1.
              </span>
              <span className="text-sm text-custom-blue">
                Download the CSV template above
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 text-custom-blue text-xs font-semibold">
                2.
              </span>
              <span className="text-sm text-custom-blue">
                Fill in your candidate data following the example format
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 text-custom-blue text-xs font-semibold">
                3.
              </span>
              <span className="text-sm text-custom-blue">
                Save the file as .csv and upload it here
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 text-custom-blue text-xs font-semibold">
                4.
              </span>
              <span className="text-sm text-custom-blue">
                Review the preview and submit
              </span>
            </li>
          </ul>
        </div>

        <div
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-custom-blue bg-custom-blue/10 scale-[1.01]"
              : "border-gray-300 hover:border-custom-blue hover:bg-gray-50"
          }`}
        >
          <Upload
            className={`w-12 h-12 mb-2 ${
              isDragging ? "text-custom-blue" : "text-gray-400"
            }`}
          />
          <p className="text-sm font-medium text-gray-700">
            {fileName || "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click to upload or drag and drop
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>

        {/* {csvData.length > 0 && (
          <div className="mt-8 border rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                Preview & Validation
              </span>
              <span className="text-xs text-gray-500">
                {csvData.length} total rows
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Candidate
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Validation Errors
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? "hover:bg-gray-50" : "bg-red-50"}
                    >
                      <td className="px-4 py-3">
                        {row.isValid ? (
                          <CheckCircle2 className="text-green-500 w-5 h-5" />
                        ) : (
                          <AlertCircle className="text-red-500 w-5 h-5" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {row.data.FirstName} {row.data.LastName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {row.data.Email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-red-600 italic">
                        {Object.values(row.errors).join(", ") || (
                          <span className="text-green-600">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}
        {csvData.length > 0 && (
          <div className="mt-8 border rounded-lg overflow-hidden mb-6 flex flex-col">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-gray-500">
                Preview & Validation
              </span>
              <span className="text-xs text-gray-500">
                {csvData.length} rows
              </span>
            </div>

            <div className="overflow-x-auto max-w-full border-t">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap border-r">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap border-r">
                        Errors
                      </th>
                      {previewHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase whitespace-nowrap border-r"
                        >
                          {header.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {csvData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.isValid ? "hover:bg-gray-50" : "bg-red-50"
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap border-r text-center">
                          {row.isValid ? (
                            <CheckCircle2 className="text-green-500 w-5 h-5 mx-auto" />
                          ) : (
                            <AlertCircle className="text-red-500 w-5 h-5 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-red-600 italic whitespace-nowrap border-r max-w-xs overflow-hidden text-ellipsis">
                          {Object.values(row.errors).join(", ") || (
                            <span className="text-green-600">None</span>
                          )}
                        </td>
                        {previewHeaders.map((header) => (
                          <td
                            key={header}
                            className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap border-r"
                          >
                            {header === "skills"
                              ? row.data[header].map((s) => s.skill).join(", ")
                              : String(row.data[header] || "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex justify-end gap-3 pt-4 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <LoadingButton
            onClick={handleUpload}
            isLoading={isProcessing}
            disabled={!csvData.some((r) => r.isValid) || isProcessing}
            loadingText="Uploading..."
          >
            Upload {csvData.filter((r) => r.isValid).length} Candidates
          </LoadingButton>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default CandidateBulkUpload;
