const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {requireCashierOrHigher, requireManagerOrHigher } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /users: register new user
router.post('/', requireCashierOrHigher, userController.registerUser);
// GET /users: get list of users with optional filters
router.get('/', requireManagerOrHigher, userController.getUsers);
// PATCH /users/me: update current user 
router.patch('/me', upload.single('avatar'), userController.updateCurrentUser);
// GET /users/me/transactions: get current user's transactions
router.get('/me/transactions', userController.getMyTransactions);
// PATCH /users/me/password: update current user's password 
router.patch('/me/password', userController.updateUserPassword);
// GET /users/me: get current user 
router.get('/me', userController.getCurrentUser);
// GET /users/:id: get user by ID
// POST /users/me/transactions: create redemption transaction
router.post('/me/transactions', userController.createRedemptionTransaction);
router.get('/:id', requireManagerOrHigher, userController.getUserById);
// PATCH /users/:id: update user by ID
router.patch('/:id', requireManagerOrHigher, userController.updateUser);
// POST /users/:id/transactions: create transfer transaction
router.post('/:id/transactions', userController.createTransferTransaction);
// GET /:id/qrcode: get qr code
router.get("/:utorid/qrcode", userController.getUserQrCodeByUtorid);

module.exports = router;