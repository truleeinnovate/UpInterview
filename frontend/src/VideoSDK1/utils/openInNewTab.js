/**
 * Opens a panel in a new tab
 * @param {string} panelType - Type of panel to open (CANDIDATE, FEEDBACK, INTERVIEWACTIONS)
 * @param {object} data - Data to pass to the panel
 */
export const openPanelInNewTab = (panelType, data = {}) => {
  // Map panel types to their corresponding paths
  const pathMap = {
    'CANDIDATE': '/video-sdk-candidate-details',
    'FEEDBACK': '/video-sdk-feedback',
    'INTERVIEWACTIONS': '/video-sdk-interview-actions'
  };
  
  const path = pathMap[panelType] || '/';
  const url = new URL(window.location.origin + path);
  
  // Add data as URL search params
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });
  
  // Open in new tab
  window.open(url.toString(), '_blank');
};
