const ConnectedApp = require('../models/ConnectedApp1.js');
const generateRandomString = require('./generateRandomString');
const formatDate = (date) => date.toISOString().split('T')[0];

const getAccessToken = async (clientId) => {
    const app = await ConnectedApp.findOne({ clientId });
    if (!app) {
        throw new Error('App not found');
    }
    return { accessToken: app.accessToken, expiry: formatDate(app.expiry) };
};

const renewAccessToken = async (clientId, clientSecret) => {
    const app = await ConnectedApp.findOne({ clientId, clientSecret });
    if (!app) {
        throw new Error('Invalid clientId or clientSecret');
    }

    const newAccessToken = generateRandomString(32);
    const newExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    app.accessToken = newAccessToken;
    app.expiry = newExpiryDate;
    await app.save();

    return { accessToken: newAccessToken, expiry: formatDate(newExpiryDate) };
};

module.exports = {
    getAccessToken,
    renewAccessToken,
};