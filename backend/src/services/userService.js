const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const createUser = async (userData) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // token expiration: 7 days

    //generate random token
    const resetToken = uuidv4();

    const user = await prisma.user.create({
        data: {
            utorid: userData.utorid,
            email: userData.email,
            name: userData.name,
            password: '',
            verified: false,
            activated: false,
            role: 'regular',
            suspicious: false,
            tokens: {
                create: {
                    token: resetToken,
                    expiresAt: expiresAt
                }
            }
        },
        select: {
            id: true,
            utorid: true,
            name: true,
            email: true,
            verified: true,
            tokens: {
                where: {
                    expiresAt: {
                        gt: new Date()
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1,
                select: {
                    expiresAt: true,
                    token: true
                }
            }
        }
    });

    const response = {
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        verified: user.verified,
        expiresAt: user.tokens[0]?.expiresAt || expiresAt,
        resetToken: user.tokens[0]?.token || resetToken
    };
    return response;
};

const getUsers = async (filters = {}) => {
    const {
        name,
        role,
        verified,
        activated,
        page = 1,
        limit = 10
    } = filters;
    const where = {}
    if (name) {
        where.OR = [
            { name: { contains: name} },
            { utorid: { contains: name} }
        ];
    }

    if (role) {
        where.role = role;
    }

    if (verified !== undefined) {
        where.verified = verified === 'true' || verified === true;
    }

    if (activated !== undefined) {
        where.activated = activated === 'true' || activated === true;
    }

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: parseInt(limit),
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
                suspicious: true,
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
    ]);

    return {
        count: totalCount,
        results: users
    };
};

const updateUserPassword = async(utorid, oldPassword, newPassword) => {
    try {
        const user = await prisma.user.findUnique ({
            where: { utorid: utorid}
        });
        if (!user) {
            return null;
        }

        if (oldPassword !== user.password) {
            throw new Error('Current password is incorrect');
        }

        await prisma.user.update({
            where: { utorid: utorid },
            data: { password: newPassword }
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
};

const getUserById = async (id, requesterRole) => {
    const user = await prisma.user.findUnique({
        where: {id: parseInt(id)},
        include: {
            promotions: {
                select: {
                    id: true,
                    name: true,
                    minSpending: true,
                    rate: true,
                    points: true
                }
            }
        }
    });
    if (!user) {
        return null;
    }
    console.log(requesterRole)
    if (requesterRole === 'cashier') {
        return {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            points: user.points,
            verified: user.verified,
            promotions: user.promotions  
        };
    } else {
        return {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
            promotions: user.promotions
        };
    }
};

const updateCurrentUser = async (utorid, updateData) => {
    try {
        const updateFields = {};
        if (updateData.name !== undefined && updateData.name !== null) updateFields.name = updateData.name;
        if (updateData.email !== undefined && updateData.email !== null) updateFields.email = updateData.email;
        if (updateData.birthday !== undefined && updateData.birthday !== null) updateFields.birthday = new Date(updateData.birthday);
        if (updateData.avatarUrl !== undefined && updateData.avatarUrl !== null) updateFields.avatarUrl = updateData.avatarUrl;
        if (Object.keys(updateFields).length === 0) {
            const currentUser = await prisma.user.findUnique({
                where: { utorid: utorid }
            });
            return currentUser;
        }
        const updatedUser = await prisma.user.update({
                    where: { utorid: utorid },
                    data: updateFields,
                });

                return updatedUser;

    } catch (error) {
        if (error.code === 'P2002') {
            if (error.meta?.target?.includes('email')) {
                throw new Error('Email already exists');
            }
        }
        throw error;
    }
};

const updateUser = async (userId, updateData, requesterRole) => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!currentUser) {
            return null;
        }

        if (updateData.verified !== undefined && updateData.verified !== null) {
            if (updateData.verified === false) {
                throw new Error('Cannot unverify a user');
            }
        }

        if (updateData.role) {
            const allowedRolesForManager = ['regular', 'cashier'];
            const allowedRolesForSuperuser = ['regular', 'cashier', 'manager', 'superuser'];
            if (requesterRole === 'manager' && !allowedRolesForManager.includes(updateData.role)) {
                throw new Error('Unauthorized to assign this role');
            } else if (requesterRole === 'superuser' && !allowedRolesForSuperuser.includes(updateData.role)) {
                throw new Error('Invalid assignment');
            } 
            if (updateData.role === 'cashier' && currentUser.suspicious === true) {
                throw new Error('Cannot assign cashier role to suspicious user');
            }
        }
        const updateField = {};
        if (updateData.email !== undefined && updateData.email !== null) updateField.email = updateData.email;
        if (updateData.verified !== undefined && updateData.verified !== null) updateField.verified = updateData.verified;
        if (updateData.suspicious !== undefined && updateData.suspicious !== null) updateField.suspicious = updateData.suspicious;
        if (updateData.role !== undefined && updateData.role !== null) updateField.role = updateData.role;

        if (Object.keys(updateField).length === 0) {
            return {
                id: currentUser.id,
                utorid: currentUser.utorid,
                name: currentUser.name
            };
        }

        let updatedUser = currentUser;
        if (Object.keys(updateField).length > 0) {
            updatedUser = await prisma.user.update({
                where: { id: parseInt(userId) },
                data: updateField
            });
        }
        const response = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name
        };
        if (updateData.email !== undefined && updateData.email !== null) response.email = updateData.email !== null ? updatedUser.email : null;;
        if (updateData.verified !== undefined && updateData.verified !== null) response.verified = updatedUser.verified !== null? updatedUser.verified : null;
        if (updateData.suspicious !== undefined && updateData.suspicious !== null) response.suspicious = updatedUser.suspicious !== null? updatedUser.suspicious : null;
        if (updateData.role !== undefined && updateData.role !== null) response.role = updatedUser.role !== null? updatedUser.role : null;

        return response;
    } catch (error) {
        throw error;
    }
};

const getCurrentUser = async (utorid) => {
    try {
        const user = await prisma.user.findUnique({
            where: { utorid: utorid },
            include: {
                promotions: {
                    select: {
                        id: true,
                        name: true,
                        minSpending: true,
                        rate: true,
                        points: true
                    }
                }
            }
        });

        if (!user) {
            return null;
        }

        return user;

    } catch (error) {
        throw error;
    }
};

const getUserByUtorid = async (utorid) => {
    return await prisma.user.findUnique({
        where: {utorid: utorid}
    });
};

const getUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {email: email}
    });
};

const getRoleByUtorid = async (utorid) => {
    const user =  await prisma.user.findUnique({
        where: {utorid: utorid},
        select: {role: true}
    });
    return user ? user.role : null;
};

const findSuspiciousByUtorid = async (utorid) => {
    const user = await prisma.user.findUnique({
        where: { utorid },
        select: {
            suspicious: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        suspicious: user.suspicious
    };
};

const createTransferTransaction = async (transferData) => {
    try {
        const { senderUtorid, recipientUtorid, amount, remark, createdBy } = transferData;
        const recipient = await prisma.user.findUnique({
            where: { utorid: recipientUtorid } 
        });

        if (!recipient) {
            throw new Error('Recipient not found');
        }

        if (!recipient.activated) {
            throw new Error('Recipient account is not activated');
        }

        const sender = await prisma.user.findUnique({
            where: { utorid: senderUtorid }
        });

        if (sender.points < amount) {
            throw new Error('Sender does not have enough points');
        }
        const senderId = await getUserByUtorid(senderUtorid).id;
        const receiverId = await getUserByUtorid(recipientUtorid).id;
        const [senderTransaction, recipientTransaction] = await prisma.$transaction([

            prisma.transaction.create({
                data: {
                    utorid: senderUtorid,     
                    type: 'transfer',
                    amount: -amount,
                    sent: amount,
                    sender: senderUtorid,     
                    recepient: recipientUtorid, 
                    remark: remark || '',
                    createdBy: createdBy,    
                    relatedId: receiverId,
                    spent: amount, 
                    promotionIds: {
                        connect: [] 
                    }
                }
            }),
            prisma.transaction.create({
                data: {
                    utorid: recipientUtorid, 
                    type: 'transfer',
                    amount: amount,
                    sender: senderUtorid,    
                    recepient: recipientUtorid, 
                    remark: remark || '',
                    createdBy: createdBy, 
                    relatedId: senderId,  
                    earned: amount,
                    promotionIds: {
                        connect: [] 
                    }
                }
            }),
            prisma.user.update({
                where: { utorid: senderUtorid },
                data: {
                    points: {
                        decrement: amount
                    }
                }
            }),
            prisma.user.update({
                where: { utorid: recipientUtorid }, 
                data: {
                    points: {
                        increment: amount
                    }
                }
            })
        ]);

        return transformTransferTransaction(senderTransaction);
    } catch (error) {
        console.error('Error in createTransferTransaction:', error);
        throw error;
    }
};

const transformTransferTransaction = (transaction) => {
    return {
        id: transaction.id,
        sender: transaction.sender,
        recipient: transaction.recepient, 
        type: transaction.type,
        sent: transaction.sent,
        remark: transaction.remark || '',
        createdBy: transaction.createdBy
    };
};

const createRedemptionTransaction = async (redemptionData) => {
    try {
        const {utorid, amount, remark} = redemptionData;

        const user = await getUserByUtorid(utorid);
        userPoints = user.points;
        console.log(userPoints);

        if (userPoints < amount) {
            throw new Error('Sender does not have enough points');
        }

        const transaction = await prisma.transaction.create({
            data: {
                utorid: utorid,
                type: "redemption",
                redeemed: amount,
                remark: remark || '',
                createdBy: utorid,
                amount: amount
            }
        })
        return transformRedemptionData(transaction);
    } catch (error) {
        console.error('Error in createRedemptionTransaction:', error);
        throw error;
    }
};

const transformRedemptionData= (transaction) => {
    return {
        id: transaction.id,
        utorid: transaction.utorid,
        type: transaction.type,
        processedBy: transaction.processedBy,
        amount: transaction.amount,
        remark: transaction.remark,
        createdBy: transaction.createdBy
    };
};

const getVerified = async (utorid) => {
    const user = await prisma.user.findUnique({
        where: {utorid: utorid},
        select: {verified: true}
    });
    return user.verified;
};

const getUtoridFromId = async (id) => {
    console.log(id);
    const user = await prisma.user.findUnique({
        where: {id: parseInt(id)},
        select: {utorid: true}
    });
    return user.utorid;
};

const getMyTransactions = async (utorid, filters) => {
    try {
        const { type, relatedId, promotionId, amount, operator, page, limit } = filters;
        const skip = (page - 1) * limit;

        let where = {
            utorid: utorid 
        };

        if (type) {
            where.type = type;
        }

        if (relatedId !== undefined && type) {
            where.relatedId = relatedId;
        }

        if (promotionId !== undefined) {
            where.promotionIds = {
                some: { id: promotionId }
            };
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
                    }
                }
            }),
            prisma.transaction.count({ where })
        ]);

        const results = transactions.map(transaction => transformMyTransaction(transaction));

        return {
            count: totalCount,
            results
        };
    } catch (error) {
        console.error('Error in getMyTransactions:', error);
        throw error;
    }
};

const transformMyTransaction = (transaction) => {
    const result = {
        id: transaction.id,
        type: transaction.type,
        promotionIds: transaction.promotionIds.map(p => p.id),
        remark: transaction.remark || '',
        createdBy: transaction.createdBy,
        date: transaction.date,
        relatedId: transaction.relatedId,
        earned: transaction.earned,
        spent: transaction.spent,
        redeemed: transaction.redeemed,
        amount: transaction.amount,
    };

    switch (transaction.type) {
        case 'purchase':
            result.spent = transaction.spent;
            result.amount = transaction.amount || transaction.earned;
            break;
        case 'redemption':
            result.amount = transaction.redeemed;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
        case 'adjustment':
            result.amount = transaction.amount;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
        case 'transfer':
            result.amount = transaction.amount;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
        case 'event':
            result.amount = transaction.awarded;
            if (transaction.relatedId) result.relatedId = transaction.relatedId;
            break;
    }

    return result;
};

//checks if user is organizer of any event
const isAnOrganizer = async (id) => {
  try {
    const event = await prisma.event.findFirst({
    where: {
      organizers: {
        some: {
           id: id
        }
      }
    }
  });
  return event !== null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
    createUser,
    getUserByUtorid,
    getUserByEmail,
    getRoleByUtorid,
    getUsers,
    getUserById,
    updateUser,
    updateUserPassword,
    updateCurrentUser,
    getCurrentUser,
    findSuspiciousByUtorid,
    createTransferTransaction,
    createRedemptionTransaction,
    getVerified,
    getUtoridFromId,
    getMyTransactions,
    isAnOrganizer,
    getMyTransactions
};
