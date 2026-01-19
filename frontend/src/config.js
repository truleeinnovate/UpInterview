// console.log('process.env.REACT_APP_API_URL frontend api link:', process.env.REACT_APP_API_URL)
// console.log('process.env.REACT_APP_REDIRECT_URI frontend api link:', process.env.REACT_APP_REDIRECT_URI)
// export const config = {
//   REACT_APP_CLIENT_ID: "86vj2ix33jf4aq",
//   REACT_APP_CLIENT_SECRET: "WPL_AP1.dEr0dEfWdtgyK9ER.5Fe8uA==",
//   REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
// };

// export const linkedInConfig = {
//   clientId: config.REACT_APP_CLIENT_ID,
//   redirectUri: config.REACT_APP_REDIRECT_URI,
//   scope: 'openid profile email w_member_social',
//   state: Math.random().toString(36).substring(7)
// };

export const config = {
  // LinkedIn OAuth configuration
  REACT_APP_CLIENT_ID: process.env.REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_SECRET: process.env.REACT_APP_CLIENT_SECRET,
  REACT_APP_REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI,

  // API URLs
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_API_URL_FRONTEND: process.env.REACT_APP_API_URL_FRONTEND,

  // Google OAuth configuration
  REACT_APP_GOOGLE_AUTH_URL: process.env.REACT_APP_GOOGLE_AUTH_URL,
  REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  REACT_APP_GOOGLE_REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
  REACT_APP_GOOGLE_SCOPES: process.env.REACT_APP_GOOGLE_SCOPES,

  REACT_APP_SUPPORT_PHONE_NUMBER: process.env.REACT_APP_SUPPORT_PHONE_NUMBER || "+91 9019723366",

  //   REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  //   REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  //   REACT_APP_VIDEOSDK_API_KEY: process.env.REACT_APP_VIDEOSDK_API_KEY,


  // interviewrequest expire dynamic hours

  INSTANT_EXPIRE_BEFORE_MINUTES: 5,

  SCHEDULED_SLA_RULES: [
    { minHoursLeft: 48, acceptHours: 24 },
    { minHoursLeft: 24, acceptHours: 12 },
    { minHoursLeft: 6, acceptHours: 6 },
    { minHoursLeft: 2, acceptHours: 2 }
  ],

  DEFAULT_ACCEPT_HOURS: 2
};



export const linkedInConfig = {
  clientId: config.REACT_APP_CLIENT_ID,
  redirectUri: config.REACT_APP_REDIRECT_URI,
  scope: 'openid profile email w_member_social',
  state: Math.random().toString(36).substring(7)
};

