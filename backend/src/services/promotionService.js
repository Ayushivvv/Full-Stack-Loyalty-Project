const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const createPromotion = async (promotionData) => {
    try {
        const originalType = promotionData.type;
        const processedData = {
            name: promotionData.name,
            description: promotionData.description,
            type: promotionData.type === 'one-time' ? 'onetime' : originalType,
            startTime: new Date(promotionData.startTime),
            endTime: new Date(promotionData.endTime),
            minSpending: (promotionData.minSpending !== undefined && promotionData.minSpending !== null && !isNaN(promotionData.minSpending)) ? 
                parseFloat(promotionData.minSpending) : 0,
            rate: (promotionData.rate !== undefined && promotionData.rate !== null && !isNaN(promotionData.rate)) ? 
                parseFloat(promotionData.rate) : 0,
            points: (promotionData.points !== undefined && promotionData.points !== null && !isNaN(promotionData.points)) ? 
                parseInt(promotionData.points) : 0
        };

        console.log('Processed data:', processedData);

        if (!processedData.name || !processedData.description || !promotionData.type || 
            !promotionData.startTime || !promotionData.endTime) {
            throw new Error('Missing required fields');
        }

        if (!['automatic', 'one-time', 'onetime'].includes(promotionData.type)) {
            throw new Error('Invalid promotion type. Must be "automatic" or "one-time"');
        }

        const startTime = new Date(promotionData.startTime);
        const endTime = new Date(promotionData.endTime);
        const now = new Date();

        // Validate dates
        if (startTime < now) {
            throw new Error('Start time cannot be in the past');
        }

        if (endTime <= startTime) {
            throw new Error('End time must be after start time');
        }

        // Validate numeric fields are actual numbers (not NaN)
        if (isNaN(processedData.minSpending) || processedData.minSpending < 0) {
            throw new Error('minSpending must be a non-negative number');
        }

        if (isNaN(processedData.rate) || processedData.rate < 0) {
            throw new Error('rate must be a non-negative number');
        }

        if (isNaN(processedData.points) || processedData.points < 0 || !Number.isInteger(processedData.points)) {
            throw new Error('points must be a non-negative integer');
        }

        // Create the promotion with processed data
        const promotion = await prisma.promotion.create({
            data: processedData
        });

        // Convert back to API format for response
        return {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            type: promotion.type === 'onetime' ? 'one-time' : 'automatic',
            startTime: startTime,
            endTime: endTime,
            minSpending: promotion.minSpending,
            rate: promotion.rate,
            points: promotion.points
        };
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('Promotion with this name already exists');
        }
        throw error;
    }
};

const getPromotions = async (userRole, filters) => {
    try {
        const {name, type, page, limit, started, ended} = filters;
        const skip = (page - 1) * limit;
        const now = new Date();

        const conditions = [];

        if (name) {
            conditions.push({
                name: { contains: name}
            });
        }

        if (type) {
            const prismaType = type === 'one-time' ? 'onetime' : 'automatic';
            conditions.push({ type: prismaType });
        }

        if (userRole === 'regular' || userRole === 'cashier') {
            conditions.push({ startTime: { lte: now } });
            conditions.push({ endTime: { gt: now } });
        } else if (userRole === 'manager' || userRole === 'superuser') {
            if (started !== undefined) {
                conditions.push(started ? 
                    { startTime: { lte: now } } : 
                    { startTime: { gt: now } }
                );
            }
            if (ended !== undefined) {
                conditions.push(ended ? 
                    { endTime: { lte: now } } : 
                    { endTime: { gt: now } }
                );
            }
        }

        const where = conditions.length > 0 ? { AND: conditions } : undefined;

        console.log('Where clause:', where);

        const [promotions, totalCount] = await Promise.all([
            prisma.promotion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startTime: 'desc' },
                select: getPromotionFields(userRole) 
            }),
            prisma.promotion.count({ where })
        ]);

        const results = promotions.map(promotion => transformPromotion(promotion));

        return {
            count: totalCount,
            results
        };
    } catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};

const getPromotionFields = (role) => {
  const baseFields = {
    id: true,
    name: true,
    type: true,
    endTime: true,
    minSpending: true,
    rate: true,
    points: true
  };

  if (role === 'manager' || role === 'superuser') {
    return {
      ...baseFields,
      startTime: true
    };
  }

  return baseFields;
};

const transformPromotion = (promotion) => {
  return {
    ...promotion,
    type: promotion.type === 'onetime' ? 'one-time' : 'automatic',
    startTime: promotion.startTime ? promotion.startTime.toISOString() : undefined,
    endTime: promotion.endTime.toISOString(),
    description: promotion.description,
  };
};

const getPromotionById = async (userUtorid, promotionId, userRole) => {
    try {
        const now = new Date();
        const selectFields = {
            id: true,
            name: true,
            description: true,
            type: true,
            startTime: true,
            endTime: true,
            minSpending: true,
            rate: true,
            points: true
        };
        console.log(promotionId);
        let where = { id: promotionId };

        if (userRole === 'regular' || userRole === 'cashier') {
            where.AND = [
                { id: promotionId },
                { startTime: { lte: now } },
                { endTime: { gt: now } }
            ];
            
            if (userRole === 'regular') {
                const promotionWithUsage = await prisma.promotion.findFirst({
                    where,
                    select: {
                        ...selectFields,
                        HeldBy: {
                            where: { utorid: userUtorid },
                            select: { id: true }
                        }
                    }
                });

                if (!promotionWithUsage) {
                    throw new Error('Promotion not found or not active');
                }

                if (promotionWithUsage.type === 'one-time' && promotionWithUsage.HeldBy.length > 0) {
                    throw new Error('Promotion not available');
                }

                const { HeldBy, ...promotion } = promotionWithUsage;
                return transformSinglePromotion(promotion);
            }
        }
        const promotion = await prisma.promotion.findFirst({
            where, 
            select: selectFields
        });

        if (!promotion) {
            throw new Error('Promotion not found');
        }

        return transformSinglePromotion(promotion);
    } catch (error) {
        console.error('Error in getPromotionById:', error);
        throw error;
    }
};

const transformSinglePromotion = (promotion) => {
    return {
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        startTime: promotion.startTime.toISOString(),
        endTime: promotion.endTime.toISOString(),
        minSpending: promotion.minSpending,
        rate: promotion.rate,
        points: promotion.points
    };
};

const updatePromotion = async (promotionId, updates) => {
    try {
        const now = new Date();
        
        const currentPromotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        if (!currentPromotion) {
            throw new Error('Promotion not found');
        }

        const actualUpdates = {};
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && updates[key] !== null) {
                actualUpdates[key] = updates[key];
            }
        });

        if (Object.keys(actualUpdates).length === 0) {
            return {
                id: currentPromotion.id,
                name: currentPromotion.name,
                type: currentPromotion.type === 'onetime' ? 'one-time' : 'automatic',
                minSpending: currentPromotion.minSpending
            };
        }

        const validationErrors = validatePromotionUpdates(actualUpdates, currentPromotion, now);
        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
        }

        const updateData = {};
        const responseFields = { 
            id: true, 
            name: true, 
            type: true,
            description: true,
            startTime: true,
            endTime: true,
            minSpending: true, 
            rate: true,
            points: true
        };

        if (actualUpdates.name !== undefined) {
            updateData.name = actualUpdates.name;
        }
        if (actualUpdates.description !== undefined) {
            updateData.description = actualUpdates.description;
        }
        if (actualUpdates.type !== undefined) {
            updateData.type = actualUpdates.type === 'one-time' ? 'onetime' : 'automatic';
        }
        if (actualUpdates.startTime !== undefined) {
            updateData.startTime = new Date(actualUpdates.startTime);
        }
        if (actualUpdates.endTime !== undefined) {
            updateData.endTime = new Date(actualUpdates.endTime);
        }
        if (actualUpdates.minSpending !== undefined) {
            updateData.minSpending = actualUpdates.minSpending;
        }
        if (actualUpdates.rate !== undefined) {
            updateData.rate = actualUpdates.rate;
        }
        if (actualUpdates.points !== undefined) {
            updateData.points = actualUpdates.points;
        }

        const updatedPromotion = await prisma.promotion.update({
            where: { id: promotionId },
            data: updateData,
            select: responseFields
        });

        return transformUpdatedPromotion(updatedPromotion, Object.keys(actualUpdates));
    } catch (error) {
        console.error('Error in updatePromotion:', error);
        throw error;
    }
};

const transformUpdatedPromotion = (promotion, updatedFieldKeys) => {
    const result = {
        id: promotion.id,
        name: promotion.name,
        type: promotion.type === 'onetime' ? 'one-time' : promotion.type,
        minSpending: promotion.minSpending 
    };

    if (updatedFieldKeys.includes('description') && promotion.description !== undefined) {
        result.description = promotion.description;
    }
    if (updatedFieldKeys.includes('startTime') && promotion.startTime !== undefined) {
        result.startTime = promotion.startTime.toISOString();
    }
    if (updatedFieldKeys.includes('endTime') && promotion.endTime !== undefined) {
        result.endTime = promotion.endTime.toISOString();
    }
    if (updatedFieldKeys.includes('rate') && promotion.rate !== undefined) {
        result.rate = promotion.rate;
    }
    if (updatedFieldKeys.includes('points') && promotion.points !== undefined) {
        result.points = promotion.points;
    }

    return result;
};

const validatePromotionUpdates = (actualUpdates, currentPromotion, now) => {
    const errors = [];

    if (actualUpdates.startTime && new Date(actualUpdates.startTime) < now) {
        errors.push('start time cannot be in the past');
    }
    if (actualUpdates.endTime && new Date(actualUpdates.endTime) < now) {
        errors.push('end time cannot be in the past');
    }

    const originalStartTimePassed = currentPromotion.startTime < now;
    const originalEndTimePassed = currentPromotion.endTime < now;

    if (originalStartTimePassed) {
        const restrictedFields = ['name', 'description', 'type', 'startTime', 'minSpending', 'rate', 'points'];
        const attemptedRestrictedUpdates = Object.keys(actualUpdates).filter(field => 
            restrictedFields.includes(field)
        );
        
        if (attemptedRestrictedUpdates.length > 0) {
            errors.push(`Cannot update ${attemptedRestrictedUpdates.join(', ')} after promotion has started`);
        }
    }

    if (originalEndTimePassed && actualUpdates.endTime !== undefined) {
        errors.push('Cannot update endTime after promotion has ended');
    }

    const newStartTime = actualUpdates.startTime ? new Date(actualUpdates.startTime) : currentPromotion.startTime;
    const newEndTime = actualUpdates.endTime ? new Date(actualUpdates.endTime) : currentPromotion.endTime;
    
    if (newEndTime <= newStartTime) {
        errors.push('endTime must be after startTime');
    }

    if (actualUpdates.minSpending !== undefined && actualUpdates.minSpending < 0) {
        errors.push('minSpending must be a positive number');
    }
    if (actualUpdates.rate !== undefined && actualUpdates.rate < 0) {
        errors.push('rate must be a positive number');
    }
    if (actualUpdates.points !== undefined && (actualUpdates.points < 0 || !Number.isInteger(actualUpdates.points))) {
        errors.push('points must be a positive integer');
    }

    if (actualUpdates.type !== undefined && !['automatic', 'one-time'].includes(actualUpdates.type)) {
        errors.push('type must be either "automatic" or "one-time"');
    }

    return errors;
};

const deletePromotion = async (promotionId) => {
    try {
        const now = new Date();
        
        const promotion = await prisma.promotion.findUnique({
            where: { id: promotionId }
        });

        if (!promotion) {
            throw new Error('Promotion not found');
        }

        if (promotion.startTime < now) {
            throw new Error('Promotion has already started');
        }

        await prisma.promotion.delete({
            where: { id: promotionId }
        });

    } catch (error) {
        console.error('Error in deletePromotion:', error);
        throw error;
    }
};

module.exports = {
    getPromotions,
    createPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion
}
    