console.log('process.env.REACT_APP_API_URL frontend api link:', process.env.REACT_APP_API_URL)

export const config = {
  REACT_APP_CLIENT_ID: "86vj2ix33jf4aq",
  REACT_APP_CLIENT_SECRET: "WPL_AP1.dEr0dEfWdtgyK9ER.5Fe8uA==",
  REACT_APP_REDIRECT_URI: "https://frontend-001-c7hzake8ghdbfeeh.canadacentral-01.azurewebsites.net/callback",
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
};

export const linkedInConfig = {
  clientId: "86vj2ix33jf4aq",
  redirectUri: "https://purple-sand-0e5d43e00.4.azurestaticapps.net/callback",
  scope: 'openid profile email w_member_social',
  state: Math.random().toString(36).substring(7)
};