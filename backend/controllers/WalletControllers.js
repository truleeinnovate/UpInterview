const mongoose = require('mongoose');
const WalletTopup = require('../models/WalletTopup');

const getWalletByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Optional: validate ownerId
    if (!ownerId) {
      return res.status(400).json({ error: 'ownerId is required' });
    }

    const wallet = await WalletTopup.findOne({ ownerId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found for this owner.' });
    }

    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getWalletByOwnerId };
