const ExchangeRateService = require('../services/exchangeRateService');

class ExchangeRateController {
  static async getCurrentRate(req, res) {
    try {
      const rate = await ExchangeRateService.getTodaysRate();
      res.json({ success: true, rate });
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch exchange rate',
        error: error.message 
      });
    }
  }

  static async getRateByDate(req, res) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date parameter is required (YYYY-MM-DD)' 
        });
      }

      const rate = await ExchangeRateService.getRateForDate(new Date(date));
      if (!rate) {
        return res.status(404).json({ 
          success: false, 
          message: 'No exchange rate found for the specified date' 
        });
      }

      res.json({ success: true, rate });
    } catch (error) {
      console.error('Error getting exchange rate by date:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch exchange rate',
        error: error.message 
      });
    }
  }

  static async convertAmount(req, res) {
    try {
      const { amount, date } = req.query;
      const amountValue = parseFloat(amount);

      if (isNaN(amountValue)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid amount is required' 
        });
      }

      let rate;
      if (date) {
        rate = await ExchangeRateService.getRateForDate(new Date(date));
      } else {
        rate = await ExchangeRateService.getTodaysRate();
      }

      if (!rate) {
        return res.status(404).json({ 
          success: false, 
          message: 'No exchange rate available' 
        });
      }

      const convertedAmount = amountValue * rate;
      res.json({ 
        success: true, 
        originalAmount: amountValue,
        currency: 'USD',
        convertedAmount,
        targetCurrency: 'INR',
        rate,
        date: date || new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error converting amount:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to convert amount',
        error: error.message 
      });
    }
  }
}

module.exports = ExchangeRateController;
