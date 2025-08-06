// console.log('process.env.REACT_APP_API_URL frontend api link:', process.env.REACT_APP_API_URL)
// console.log('process.env.REACT_APP_REDIRECT_URI frontend api link:', process.env.REACT_APP_REDIRECT_URI)
// export const config = {
//   REACT_APP_CLIENT_ID: "86vj2ix33jf4aq",
//   REACT_APP_CLIENT_SECRET: "WPL_AP1.dEr0dEfWdtgyK9ER.5Fe8uA==",
//   REACT_APP_REDIRECT_URI: "https://app.upinterview.io/callback",
//   REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
// };

// export const linkedInConfig = {
//   clientId: config.REACT_APP_CLIENT_ID,
//   redirectUri: config.REACT_APP_REDIRECT_URI,
//   scope: 'openid profile email w_member_social',
//   state: Math.random().toString(36).substring(7)
// };

export const config = {
  REACT_APP_CLIENT_ID: "77eq6sdds9ol1a",
  REACT_APP_CLIENT_SECRET: "WPL_AP1.rW1TQVlAI93U3fuN.61yPig==",
  // offline linked in redirect uri
  // REACT_APP_REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI,
  // online linked in redirect uri
  REACT_APP_REDIRECT_URI: "https://app.upinterview.io/callback",
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  REACT_APP_API_URL_FRONTEND: process.env.REACT_APP_API_URL_FRONTEND || "http://localhost:3000",
  // Google OAuth configuration
  REACT_APP_GOOGLE_AUTH_URL: process.env.REACT_APP_GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth?',
  REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  REACT_APP_GOOGLE_REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
  REACT_APP_GOOGLE_SCOPES: process.env.REACT_APP_GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar.events'
};



export const linkedInConfig = {
  clientId: config.REACT_APP_CLIENT_ID,
  redirectUri: config.REACT_APP_REDIRECT_URI,
  scope: 'openid profile email w_member_social',
  state: Math.random().toString(36).substring(7)
};