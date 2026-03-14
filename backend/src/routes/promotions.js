const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const {requireManagerOrHigher } = require('../middleware/auth');

// POST /promotions: create new promotion 
router.post('/', requireManagerOrHigher, promotionController.createPromotion);
// GET /promotions/:id: get promotions by id
router.get('/:id', promotionController.getPromotionById);
// GET /promotions: get all promotions
router.get('/', promotionController.getPromotions);
//PATCH /promotions/:id: update promotion
router.patch('/:id', requireManagerOrHigher, promotionController.updatePromotion);
// DELETE /promotions/:id: delete promotion
router.delete('/:id', requireManagerOrHigher, promotionController.deletePromotion)

module.exports = router;