// utils/openInNewTab.js
export const openPanelInNewTab = (panelType, data) => {
  // Create base URL with existing meeting parameters
  const baseUrl = new URL(window.location.href.split('?')[0]);
  const searchParams = new URLSearchParams(window.location.search);
  
  // Add panel type to URL
  searchParams.set('panel', panelType.toLowerCase());
  
  // If it's a candidate panel, add candidate data
  if (panelType === 'CANDIDATE' && data?._id) {
    searchParams.set('candidateId', data._id);
  }
  
  // Set the new search params
  baseUrl.search = searchParams.toString();
  
  // Open in new tab
  window.open(baseUrl.toString(), '_blank');
};