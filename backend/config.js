module.exports = {
  // REACT_APP_CLIENT_ID: "77eq6sdds9ol1a",
  // REACT_APP_CLIENT_SECRET: "WPL_AP1.rW1TQVlAI93U3fuN.61yPig==",
  // // offline linked in redirect uri
  // // REACT_APP_REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI,
  // // online linked in redirect uri
  // REACT_APP_API_URL_FRONTEND: process.env.REACT_APP_API_URL_FRONTEND || "http://localhost:3000"
  // LinkedIn OAuth configuration
  REACT_APP_CLIENT_ID: process.env.REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_SECRET: process.env.REACT_APP_CLIENT_SECRET,
  REACT_APP_REDIRECT_URI: process.env.REACT_APP_REDIRECT_URI,

  JWT_SECRET: process.env.JWT_SECRET,

  // API URLs
  REACT_APP_API_URL_FRONTEND: process.env.REACT_APP_API_URL_FRONTEND,
  
  // 

  SERVICE_CHARGE_PERCENT: parseFloat(process.env.PLATFORM_SERVICE_CHARGE_PERCENT) || 10,
  GST_RATE: parseFloat(process.env.GST_RATE) || 0.18,
};
