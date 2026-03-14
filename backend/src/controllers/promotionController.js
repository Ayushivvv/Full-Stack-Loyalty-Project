const promotionService = require('../services/promotionService');
const userService = require('../services/userService');

const createPromotion = async (req, res) => {
    try {
        const {name, description, type, startTime, endTime, minSpending, rate, points } = req.body;

        if (!name || !description || !type || !startTime || !endTime) {
            return res.status(400).json({"message": "missing required fields"});
        }

        let prismaType;
        if (type === 'automatic') {
            prismaType = 'automatic';
        } else if (type === 'one-time' || type === 'onetime') {
            prismaType = 'onetime';  
        } else {
            return res.status(400).json({ "message": "type must be either 'automatic' or 'one-time'" });
        }

        const originalType = type;

        const promotionData = {
            name, 
            description,
            type: prismaType,
            startTime,
            endTime,
            minSpending: minSpending !== undefined ? parseFloat(minSpending) : undefined,
            rate: rate !== undefined ? parseFloat(rate) : undefined,
            points: points !== undefined ? parseInt(points) : undefined
        };

        const promotion = await promotionService.createPromotion(promotionData);

        const response = {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: originalType === 'onetime' ? 'onetime': promotion.type,
            startTime: promotion.startTime.toISOString().replace(/\.\d{3}Z$/, 'Z'),
            endTime: promotion.endTime.toISOString().replace(/\.\d{3}Z$/, 'Z'),
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        }

        return res.status(201).json(response);
    } catch (error) {
        if (error.message.includes('must be a non-negative') || 
            error.message.includes('cannot be in the past') ||
            error.message.includes('must be after') ||
            error.message.includes('At least one of')) {
                return res.status(400).json({ "message": error.message });
        }
        return res.status(500).json({"message": error.message });
    }
};

const getPromotions = async (req, res) => {
    const userRole = await userService.getRoleByUtorid(req.auth.utorid);
    if (!userRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    try {
        const validationErrors = validatePromotionQuery(req.query, userRole);
        
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
        }   
        
        const filters = {
            name: req.query.name,
            type: req.query.type,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10
        };

        let where = {};
        const now = new Date();
        const user = req.auth;
        
        if (userRole === 'regular') {
            where.startTime = { lte: now };
            where.endTime = { gt: now };
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { type: 'automatic' },
                        {
                            type: 'one-time',
                            AND: [
                                {
                                    HeldBy: {
                                        none: {
                                            utorid: user.utorid
                                        }
                                    }
                                },
                            ]
                        }
                    ]
                }
            ];
        }

        if (userRole === 'manager' || userRole === 'superuser') {
            filters.started = req.query.started !== undefined ? req.query.started === 'true' : undefined;
            filters.ended = req.query.ended !== undefined ? req.query.ended === 'true' : undefined;

            if (filters.started !== undefined && filters.ended !== undefined) {
                return res.status(400).json({ error: 'Cannot specify both started and ended filters' });
            }
        }

        const result = await promotionService.getPromotions(userRole, filters);
        
        res.status(200).json(result);
        
    } catch (error) {
        if (error.message.includes('Cannot specify both') || 
            error.message.includes('invalid promotion type') ||
            error.message.includes('Invalid promotion type')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error...' });
    }
};

const validatePromotionQuery = (query, userRole) => {
  const errors = [];

  if (query.page !== undefined) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1 || !Number.isInteger(page)) {
      errors.push('page must be a positive integer');
    }
  }

  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || !Number.isInteger(limit)) {
      errors.push('limit must be a positive integer');
    }
  }

  if (query.type !== undefined && !['automatic', 'one-time'].includes(query.type)) {
    errors.push('type must be either "automatic" or "one-time"');
  }

  if (userRole === 'manager' || userRole === 'superuser') {
    if (query.started !== undefined && !['true', 'false'].includes(query.started)) {
      errors.push('started must be either "true" or "false"');
    }

    if (query.ended !== undefined && !['true', 'false'].includes(query.ended)) {
      errors.push('ended must be either "true" or "false"');
    }
  } else {
    if (query.started !== undefined || query.ended !== undefined) {
      errors.push('started and ended filters are only available for managers');
    }
  }
  return errors;
};

const getPromotionById = async (req, res) => {
    try {
        const userRole = await userService.getRoleByUtorid(req.auth.utorid);
        if (!userRole) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        const promotionId = parseInt(req.params.id);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }

        const promotion = await promotionService.getPromotionById(req.auth.utorid, promotionId, userRole);
        
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        res.status(200).json(promotion);
    } catch (error) {
        if (error.message.includes('not found') || error.message.includes('not available')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePromotion = async (req, res) => {
    try {
        const promotionId = parseInt(req.params.id);
        
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }

        const updates = req.body;
        
        const allowedFields = ['name', 'description', 'type', 'startTime', 'endTime', 'minSpending', 'rate', 'points'];
        const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(', ')}` });
        }

        // converts minSpending and rate and points to numbers from strings 
        if (updates.minSpending !== undefined) {
            updates.minSpending = Number(updates.minSpending);
        }

        if (updates.rate !== undefined) {
            updates.rate = Number(updates.rate);
        }

        if (updates.points !== undefined) {
            updates.points = Number(updates.points);
        }

        // converts startTime and endTime to date from strings
        if (updates.startTime) {
            updates.startTime = new Date(updates.startTime);
        }

        if (updates.endTime) {
            updates.endTime = new Date(updates.endTime);
        }


        const result = await promotionService.updatePromotion(promotionId, updates);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Cannot update') || 
            error.message.includes('must be') ||
            error.message.includes('Invalid') ||
            error.message.includes('after') ||
            error.message.includes('past')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const promotionId = parseInt(req.params.id);
        
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: 'Invalid promotion ID' });
        }

        await promotionService.deletePromotion(promotionId);
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('already started')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getPromotions,
    createPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion
}