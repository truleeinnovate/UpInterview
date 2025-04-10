console.log('process.env.REACT_APP_API_URL frontend api link:', process.env.REACT_APP_API_URL)
console.log('process.env.REACT_APP_REDIRECT_URI frontend api link:', process.env.REACT_APP_REDIRECT_URI)

// Get the current environment
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  REACT_APP_CLIENT_ID: "86vj2ix33jf4aq",
  REACT_APP_CLIENT_SECRET: "WPL_AP1.dEr0dEfWdtgyK9ER.5Fe8uA==",
  // For deployment, use the deployment URL
  REACT_APP_REDIRECT_URI: isProduction 
    ? process.env.REACT_APP_REDIRECT_URI || 
      'https://frontend-001-c7hzake8ghdbfeeh.canadacentral-01.azurewebsites.net/callback'
    : process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback",
  // For deployment, use the backend deployment URL
  REACT_APP_API_URL: isProduction 
    ? process.env.REACT_APP_API_URL || 
      'https://backend-001-a6bjhub5amgygjgd.canadacentral-01.azurewebsites.net'
    : process.env.REACT_APP_API_URL || 'http://localhost:5000'
};

export const linkedInConfig = {
  clientId: config.REACT_APP_CLIENT_ID,
  redirectUri: config.REACT_APP_REDIRECT_URI,
  scope: 'openid profile email w_member_social',
  state: Math.random().toString(36).substring(7)
};