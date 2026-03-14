const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createTransaction = async (transactionData, susData) => {
    try {
        const { utorid, type, spent, amount, relatedId, promotionIds, remark, createdBy } = transactionData;
        const now = new Date();
        const {suspicious} = susData;
        console.log('Suspicious status:', suspicious);

        const customer = await prisma.user.findUnique({
            where: { utorid }
        });

        if (!customer) {
            throw new Error('User not found');
        }

        if (!customer.activated) {
            throw new Error('User account is not activated');
        }

        let earned = 0;
        let transaction;
        let appliedPromotions = [];

        if (type === 'purchase') {
            earned = Math.round(spent * 4); 

            if (promotionIds && promotionIds.length > 0) {
                // Validate and get promotions
                appliedPromotions = await validateAndGetPromotions(promotionIds, utorid, spent);
                // Apply promotions to calculate final points
                earned = applyPromotions(earned, spent, appliedPromotions);
            }

            transaction = await prisma.transaction.create({
                data: {
                    utorid,
                    type: 'purchase',
                    spent,
                    amount: earned, // Always store calculated amount
                    earned: suspicious ? 0 : earned, // Only store 0 in earned if suspicious
                    remark: remark || '',
                    createdBy,
                    suspicious: suspicious,
                    promotionIds: {
                        connect: promotionIds ? promotionIds.map(id => ({ id })) : []
                    }
                },
                include: {
                    promotionIds: {
                        select: { id: true }
                    }
                }
            });

            // Mark one-time promotions as used
            if (appliedPromotions.length > 0) {
                await markPromotionsAsUsed(appliedPromotions, utorid, transaction.id);
            }

            if (!suspicious) {
                await prisma.user.update({
                    where: { utorid },
                    data: {
                        points: {
                            increment: earned
                        }
                    }
                });
            }

        } else if (type === 'adjustment') {
            const relatedTransaction = await prisma.transaction.findUnique({
                where: { id: relatedId }
            });

            if (!relatedTransaction) {
                throw new Error('Related transaction not found');
            }

            if (relatedTransaction.utorid !== utorid) {
                throw new Error('Related transaction does not belong to the specified user');
            }

            transaction = await prisma.transaction.create({
                data: {
                    utorid,
                    type: 'adjustment',
                    amount,
                    relatedId,
                    remark: remark || '',
                    createdBy,
                    promotionIds: {
                        connect: promotionIds ? promotionIds.map(id => ({ id })) : []
                    }
                },
                include: {
                    promotionIds: {
                        select: { id: true }
                    }
                }
            });

            await prisma.user.update({
                where: { utorid },
                data: {
                    points: {
                        increment: amount
                    }
                }
            });
        } else {
            throw new Error('Invalid transaction type');
        }

        return transformTransaction(transaction);
    } catch (error) {
        console.error('Error in createTransaction:', error);
        throw error;
    }
};

const validateAndGetPromotions = async (promotionIds, utorid, spent) => {
    const now = new Date();
    
    const promotions = await prisma.promotion.findMany({
        where: {
            id: { in: promotionIds },
            startTime: { lte: now },
            endTime: { gt: now }
        },
        include: {
            HeldBy: {
                where: { utorid },
                select: { id: true }
            },
            usedOn: {
                where: { utorid },
                select: { id: true }
            }
        }
    });

    if (promotions.length !== promotionIds.length) {
        throw new Error('One or more promotions not found or expired');
    }

    // Check for one-time promotions that have already been used by this user
    const usedOneTimePromotions = promotions.filter(p => 
        p.type === 'onetime' && (p.HeldBy.length > 0 || p.usedOn.length > 0)
    );

    if (usedOneTimePromotions.length > 0) {
        throw new Error('One or more one-time promotions have already been used');
    }

    // Check minimum spending requirements
    const invalidMinSpending = promotions.filter(p => 
        p.minSpending > 0 && spent < p.minSpending
    );

    if (invalidMinSpending.length > 0) {
        throw new Error('One or more promotions have minimum spending requirements not met');
    }

    return promotions;
};

const applyPromotions = (basePoints, spent, promotions) => {
    let finalPoints = basePoints;

    promotions.forEach(promotion => {
        const extraPoints = Math.round(spent * promotion.rate * 100);
        finalPoints += extraPoints;
        //add fixed points
        finalPoints += promotion.points;
    });

    console.log(`Total points after promotions: ${finalPoints}`);
    return finalPoints;
};

const markPromotionsAsUsed = async (promotions, utorid, transactionId) => {
    try {
        const oneTimePromotions = promotions.filter(p => p.type === 'onetime');
        
        if (oneTimePromotions.length > 0) {
            // Mark one-time promotions as used by connecting to user and transaction
            for (const promotion of oneTimePromotions) {
                await prisma.promotion.update({
                    where: { id: promotion.id },
                    data: {
                        HeldBy: {
                            connect: { utorid }
                        },
                        usedOn: {
                            connect: { id: transactionId }
                        }
                    }
                });
            }
            console.log(`Marked ${oneTimePromotions.length} one-time promotions as used`);
        }
    } catch (error) {
        console.error('Error marking promotions as used:', error);
        throw error;
    }
};

const transformTransaction = (transaction) => {
    const result = {
        id: transaction.id,
        utorid: transaction.utorid,
        type: transaction.type,
        remark: transaction.remark,
        promotionIds: transaction.promotionIds.map(p => p.id),
        createdBy: transaction.createdBy
    };
    if (transaction.type === 'purchase') {
        result.spent = transaction.spent;
        result.earned = transaction.earned;
    } else if (transaction.type === 'adjustment') {
        result.amount = transaction.amount;
        result.relatedId = transaction.relatedId;
    }

    return result;
};

const getTransactions = async (filters) => {
    try {
        const { name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit } = filters;
        const skip = (page - 1) * limit;

        let where = {};

        if (name) {
            where.OR = [
                { utorid: { contains: name, mode: 'insensitive' } },
                {
                    author: {
                        name: { contains: name, mode: 'insensitive' }
                    }
                }
            ];
        }

        if (createdBy) {
            where.createdBy = { contains: createdBy, mode: 'insensitive' };
        }

        if (suspicious !== undefined) {
            where.suspicious = suspicious;
        }

        if (promotionId !== undefined) {
            where.promotionIds = {
                some: { id: promotionId }
            };
        }

        if (type) {
            where.type = type;
        }

        if (relatedId !== undefined && type) {
            where.relatedId = relatedId;
        }

        if (amount !== undefined && operator) {
            if (operator === 'gte') {
                where.OR = [
                    { amount: { gte: amount } },
                    { earned: { gte: amount } },
                    { redeemed: { gte: amount } },
                    { awarded: { gte: amount } }
                ];
            } else if (operator === 'lte') {
                where.OR = [
                    { amount: { lte: amount } },
                    { earned: { lte: amount } },
                    { redeemed: { lte: amount } },
                    { awarded: { lte: amount } }
                ];
            }
        }

        const [transactions, totalCount] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    promotionIds: {
                        select: { id: true }
                    },
                    author: {
                        select: { utorid: true, name: true }
                    }
                }
            }),
            prisma.transaction.count({ where })
        ]);

        const results = transactions.map(transaction => transformTransactionForList(transaction));

        return {
            count: totalCount,
            results
        };
    } catch (error) {
        console.error('Error in getTransactions:', error);
        throw error;
    }
};

const transformTransactionForList = (transaction) => {
    const result = {
        id: transaction.id,
        utorid: transaction.utorid,
        type: transaction.type,
        promotionIds: transaction.promotionIds.map(p => p.id),
        suspicious: transaction.suspicious,
        remark: transaction.remark || '',
        createdBy: transaction.createdBy
    };

    switch (transaction.type) {
        case 'purchase':
            result.spent = transaction.spent;
            result.amount = transaction.earned;
            break;
        case 'redemption':
            result.amount = transaction.redeemed;
            result.redeemed = transaction.redeemed;
            result.relatedId = transaction.relatedId;
            break;
        case 'adjustment':
            result.amount = transaction.amount;
            result.relatedId = transaction.relatedId;
            break;
        case 'transfer':
            result.amount = transaction.amount;
            result.relatedId = transaction.relatedId;
            result.sender = transaction.sender;
            result.recepient = transaction.recepient;
            break;
        case 'event':
            result.amount = transaction.awarded;
            result.awarded = transaction.awarded;
            result.relatedId = transaction.relatedId;
            break;
    }

    return result;
};

const getTransactionById = async (transactionId) => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: Number(transactionId) },
            include: {
                promotionIds: {
                    select: { id: true }
                },
                author: {
                    select: { utorid: true, name: true }
                },
                from: {
                    select: { utorid: true, name: true }
                },
                to: {
                    select: { utorid: true, name: true }
                },
                approver: {
                    select: { utorid: true, name: true }
                }
            }
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        return transformSingleTransaction(transaction);
    } catch (error) {
        console.error('Error in getTransactionById:', error);
        throw error;
    }
};

// Transform single transaction for detailed response
const transformSingleTransaction = (transaction) => {
    const result = {
        id: transaction.id,
        utorid: transaction.utorid,
        type: transaction.type,
        promotionIds: transaction.promotionIds.map(p => p.id),
        suspicious: transaction.suspicious,
        remark: transaction.remark || '',
        createdBy: transaction.createdBy
    };

    // Always include amount based on transaction type
    switch (transaction.type) {
        case 'purchase':
            result.spent = transaction.spent;
            result.amount = transaction.amount; // This shows the calculated points
            break;
        case 'redemption':
            result.amount = transaction.redeemed;
            result.redeemed = transaction.redeemed;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
        case 'adjustment':
            result.amount = transaction.amount;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
        case 'transfer':
            result.amount = transaction.amount;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            if (transaction.sender) result.sender = transaction.sender;
            if (transaction.recepient) result.recepient = transaction.recepient;
            break;
        case 'event':
            result.amount = transaction.awarded;
            result.awarded = transaction.awarded;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
    }

    return result;
};

const updateTransactionSuspicious = async (transactionId, newSuspiciousStatus) => {
    try {
        const currentTransaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                promotionIds: {
                    select: { id: true }
                },
                author: {
                    select: { utorid: true, name: true }
                }
            }
        });

        if (!currentTransaction) {
            throw new Error('Transaction not found');
        }

        if (currentTransaction.type !== 'purchase') {
            throw new Error('Only purchase transactions can be marked as suspicious');
        }

        if (currentTransaction.suspicious === newSuspiciousStatus) {
            return transformSingleTransaction(currentTransaction);
        }

        let pointsAdjustment = 0;

        if (currentTransaction.suspicious === false && newSuspiciousStatus === true) {
            pointsAdjustment = -currentTransaction.amount;
        } else if (currentTransaction.suspicious === true && newSuspiciousStatus === false) {
            pointsAdjustment = currentTransaction.amount;
        }

        const [updatedTransaction] = await prisma.$transaction([
            prisma.transaction.update({
                where: { id: transactionId },
                data: {
                    suspicious: newSuspiciousStatus
                },
                include: {
                    promotionIds: {
                        select: { id: true }
                    },
                    author: {
                        select: { utorid: true, name: true }
                    }
                }
            }),
            prisma.user.update({
                where: { utorid: currentTransaction.utorid },
                data: {
                    points: {
                        increment: pointsAdjustment
                    }
                }
            })
        ]);

        console.log(`Transaction ${transactionId} suspicious status changed from ${currentTransaction.suspicious} to ${newSuspiciousStatus}`);
        console.log(`User ${currentTransaction.utorid} points adjusted by: ${pointsAdjustment}`);

        return transformSingleTransaction(updatedTransaction);
    } catch (error) {
        console.error('Error in updateTransactionSuspicious:', error);
        throw error;
    }
};

const processTransaction = async (transactionId, utorid) => {
    try {
        transactionId = parseInt(transactionId)
        const transaction = await getTransactionById(transactionId);
        console.log(transactionId);
        if (!transaction) {
            throw new Error('transaction not found');
        }
        
        const existingProcessed = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                processedBy: {
                    not: null
                }
            },
            select: { processedBy: true }
        });

        if (existingProcessed) {
            throw new Error('already processed');
        }

        if (transaction.type !== "redemption") {
            throw new Error('not redemption transaction');
        }
        console.log(utorid);
        const updatedTransaction = await prisma.transaction.update({
            where: {id: transactionId},
            data: {
                processedBy: utorid
            }
        });
        const updatedBalance = await prisma.user.update({
            where: {utorid: transaction.utorid},
            data: {
                points: {
                    decrement: transaction.amount
                },
            }
        });
        return {
            id: transactionId,
            utorid: transaction.utorid,
            type: "redemption",
            processedBy: utorid,
            redeemed: transaction.amount,
            remark: transaction.remark,
            createdBy: transaction.createdBy
        }
    } catch (error) {
        console.error('Error in processTransaction: ', error);
        throw error;
    }
};


module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransactionSuspicious,
    processTransaction
};