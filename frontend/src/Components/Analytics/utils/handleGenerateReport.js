// Created by Ashok

export const generateAndNavigateReport = async ({
  template,
  generateReportMutation,
  navigate,
  setLoadingId,
}) => {
  setLoadingId(template.id);

  try {
    const response = await generateReportMutation.mutateAsync(template.id);
    const { columns, data: reportData, report } = response;
    console.log("responseoftemplateid data", response);

    navigate(`/analytics/reports/${template.id}`, {
      state: {
        reportTitle: report.label,
        reportDescription: report.description || "",
        totalRecords: report.totalRecords,
        generatedAt: report.generatedAt,
        templateId: template.id,

        columns: columns.map((col) => ({
          key: col.key,
          label: col.label,
          width: col.width || "180px",
          type: col.type || "text",
        })),

        data: reportData.map((item) => ({
          id: item.id,
          ...item,
        })),
      },
    });
  } catch (error) {
    alert("Failed to generate report: " + (error.message || "Server error"));
  } finally {
    setLoadingId(null);
  }
};
