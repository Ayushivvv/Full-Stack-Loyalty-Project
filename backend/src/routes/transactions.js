const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireManagerOrHigher, requireCashierOrHigher } = require('../middleware/auth');

// PATCH /transactions/:id/processed: set redemption transaction as processed
router.patch('/:id/processed', requireCashierOrHigher, transactionController.processTransaction);
// POST /transactions: create new transaction
router.post('/', requireCashierOrHigher, transactionController.createTransaction);
// GET /transactions: get list of transactions
router.get('/', requireManagerOrHigher, transactionController.getTransactions);
// GET /transactions/:id: get single transaction
router.get('/:id', requireManagerOrHigher, transactionController.getTransactionById);
// PATCH /transactions/:id/suspicious: flag transaction is sus or not sus
router.patch('/:id/suspicious', requireManagerOrHigher, transactionController.updateTransactionSuspicious);

module.exports = router;