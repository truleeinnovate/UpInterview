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
  REACT_APP_REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI || "https://app.upinterview.io/callback",
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || "http://localhost:5000"
};

export const linkedInConfig = {
  clientId: config.REACT_APP_CLIENT_ID,
  redirectUri: config.REACT_APP_REDIRECT_URI,
  scope: 'openid profile email w_member_social',
  state: Math.random().toString(36).substring(7)
};