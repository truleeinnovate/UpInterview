const express = require('express');
const { getWalletByOwnerId } = require('../controllers/WalletControllers');

const WalletRouter = express.Router();

// GET /wallet/:ownerId
WalletRouter.get('/:ownerId', getWalletByOwnerId);

module.exports = WalletRouter;
