const axios = require('axios');
const cron = require('node-cron');
const mongoose = require('mongoose');
const ExchangeRate = require('../models/ExchangeRate');

const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';
let isUpdating = false;
let isConnected = false;
let pendingUpdates = [];

// Listen for MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected - initializing exchange rate service');
  isConnected = true;
  // Process any pending updates
  while (pendingUpdates.length) {
    const updateFn = pendingUpdates.shift();
    updateFn();
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isConnected = false;
});

// Helper function to wait for connection
const waitForConnection = async () => {
  if (isConnected) return Promise.resolve();
  
  return new Promise((resolve) => {
    const checkConnection = () => {
      if (isConnected) {
        resolve();
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    checkConnection();
  });
};

class ExchangeRateService {
  static async fetchCurrentRate() {
    try {
      const response = await axios.get(EXCHANGE_RATE_API);
      if (response.data && response.data.rates && response.data.rates.INR) {
        return response.data.rates.INR;
      }
      throw new Error('Invalid API response format');
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }
  }

  static async getTodaysRate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we already have today's rate
    const existingRate = await ExchangeRate.findOne({
      baseCurrency: 'USD',
      targetCurrency: 'INR',
      date: { $gte: today }
    }).sort({ date: -1 });

    if (existingRate) {
      return existingRate.rate;
    }

    // If no rate for today, fetch and store it
    const currentRate = await this.fetchCurrentRate();
    await ExchangeRate.storeTodaysRate(currentRate);
    return currentRate;
  }

  static async getRateForDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rate = await ExchangeRate.findOne({
      baseCurrency: 'USD',
      targetCurrency: 'INR',
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    return rate ? rate.rate : null;
  }
}

// Schedule daily update at 12:00 AM UTC (5:30 AM IST)
function scheduleDailyRateUpdate() {
  const runSchedule = () => {
    // Calculate time until next update (12:00 AM UTC)
    const now = new Date();
    const nextUpdate = new Date(now);
    
    // Set next update to 12:00 AM UTC (5:30 AM IST)
    nextUpdate.setUTCHours(0, 0, 0, 0);
    
    // If we're past the update time for today, schedule for tomorrow
    if (now >= nextUpdate) {
      nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1);
    }
    
    const timeUntilUpdate = nextUpdate - now;
    
    // console.log(`Next exchange rate update scheduled for: ${nextUpdate.toISOString()}`);
    
    // Schedule the first update
    setTimeout(async () => {
      console.log('Running scheduled daily exchange rate update...');
      await updateDailyRate();
      
      // Then schedule for daily updates at the same time
      cron.schedule('0 0 * * *', () => {
        console.log('Running daily exchange rate update...');
        updateDailyRate();
      }, {
        timezone: 'UTC',
        scheduled: true
      });
    }, timeUntilUpdate);
    
    // Also check if we need to run immediately (in case server restarted after scheduled time)
    checkAndUpdateRate();
  };

  if (isConnected) {
    runSchedule();
  } else {
    console.log('Waiting for MongoDB connection before scheduling exchange rate updates...');
    pendingUpdates.push(runSchedule);
  }
}

// Check if we need to update the rate and update if needed
async function checkAndUpdateRate() {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const existingRate = await ExchangeRate.findOne({
      baseCurrency: 'USD',
      targetCurrency: 'INR',
      date: { $gte: today }
    });
    
    if (!existingRate) {
      // console.log('No exchange rate found for today, updating now...');
      await updateDailyRate();
    } else {
      // console.log(`Today's exchange rate (${existingRate.rate}) already exists, skipping update`);
    }
  } catch (error) {
    console.error('Error checking exchange rate:', error);
  }
}

async function updateDailyRate() {
  if (isUpdating) {
    console.log('Exchange rate update already in progress');
    return;
  }
  
  // Wait for MongoDB connection if not already connected
  if (!isConnected) {
    try {
      await waitForConnection();
    } catch (error) {
      console.error('Error waiting for MongoDB connection:', error);
      return;
    }
  }
  
  try {
    isUpdating = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we already have today's rate
    const existingRate = await ExchangeRate.findOne({
      baseCurrency: 'USD',
      targetCurrency: 'INR',
      date: { $gte: today }
    });
    
    if (!existingRate) {
      const rate = await ExchangeRateService.fetchCurrentRate();
      await ExchangeRate.storeTodaysRate(rate);
      console.log(`Updated exchange rate: 1 USD = ${rate} INR`);
    } else {
      console.log('Exchange rate already updated for today');
    }
  } catch (error) {
    console.error('Error in daily exchange rate update:', error);
  } finally {
    isUpdating = false;
  }
}

// Add the schedule function to the exported object
ExchangeRateService.scheduleDailyRateUpdate = scheduleDailyRateUpdate;

module.exports = ExchangeRateService;
