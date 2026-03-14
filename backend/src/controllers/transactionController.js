const transactionService = require('../services/transactionService');
const userService = require('../services/userService');

const createTransaction = async (req, res) => {
    try {
        const { utorid, type, spent, amount, relatedId, promotionIds, remark } = req.body;
        const createdBy = req.auth.utorid;
        const userRole = await userService.getRoleByUtorid(req.auth.utorid);

        if (!utorid || !type) {
            return res.status(400).json({ error: 'Missing required fields: utorid and type' });
        }

        if (type === 'purchase') {
            if (spent === undefined || spent === null) {
                return res.status(400).json({ error: 'spent is required for purchase transactions' });
            }
            if (spent <= 0) {
                return res.status(400).json({ error: 'spent must be a positive number' });
            }
        }

        if (type === 'adjustment') {
            if (amount === undefined || amount === null) {
                return res.status(400).json({ error: 'amount is required for adjustment transactions' });
            }
            if (relatedId === undefined || relatedId === null) {
                return res.status(404).json({ error: 'relatedId is required for adjustment transactions' });
            }
        }

        if (type === 'purchase' && !['cashier', 'manager', 'superuser'].includes(userRole)) {
            return res.status(403).json({ error: 'Cashier or higher clearance required for purchase transactions' });
        }

        if (type === 'adjustment' && !['manager', 'superuser'].includes(userRole)) {
            return res.status(403).json({ error: 'Manager or higher clearance required for adjustment transactions' });
        }

        const transactionData = {
            utorid,
            type,
            spent,
            amount,
            relatedId,
            promotionIds,
            remark,
            createdBy
        };
        const isSus = await userService.findSuspiciousByUtorid(req.auth.utorid);
        const transaction = await transactionService.createTransaction(transactionData, isSus);
        res.status(201).json(transaction);
    } catch (error) {
        if (error.message.includes('Invalid') ||
            error.message.includes('expired') ||
            error.message.includes('used') ||
            error.message.includes('requirements not met')) {
            return res.status(400).json({ "message": error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({"message": "related transaction not found"});
        }
        res.status(500).json({ "message": error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const validationErrors = validateTransactionQuery(req.query);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
        }

        const filters = {
            name: req.query.name,
            createdBy: req.query.createdBy,
            suspicious: req.query.suspicious !== undefined ? req.query.suspicious === 'true' : undefined,
            promotionId: req.query.promotionId ? parseInt(req.query.promotionId) : undefined,
            type: req.query.type,
            relatedId: req.query.relatedId ? parseInt(req.query.relatedId) : undefined,
            amount: req.query.amount ? parseFloat(req.query.amount) : undefined,
            operator: req.query.operator,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10
        };

        const result = await transactionService.getTransactions(filters);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('Invalid') || error.message.includes('required')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const validateTransactionQuery = (query) => {
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

    if (query.operator !== undefined && !['gte', 'lte'].includes(query.operator)) {
        errors.push('operator must be either "gte" or "lte"');
    }

    if (query.amount !== undefined && !query.operator) {
        errors.push('operator is required when using amount filter');
    }

    if (query.operator !== undefined && !query.amount) {
        errors.push('amount is required when using operator filter');
    }

    if (query.relatedId !== undefined && !query.type) {
        errors.push('type is required when using relatedId filter');
    }

    if (query.type !== undefined && !['purchase', 'redemption', 'adjustment', 'transfer', 'event'].includes(query.type)) {
        errors.push('Invalid transaction type');
    }

    return errors;
};

const getTransactionById = async (req, res) => {
    try {
        const transactionId = parseInt(req.params.id);
        
        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        const transaction = await transactionService.getTransactionById(transactionId);
        console.log(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found he' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateTransactionSuspicious = async (req, res) => {
    try {
        const transactionId = parseInt(req.params.id);
        const { suspicious } = req.body;

        if (isNaN(transactionId)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        if (suspicious === undefined || suspicious === null) {
            return res.status(400).json({ error: 'suspicious field is required' });
        }

        if (typeof suspicious !== 'boolean') {
            return res.status(400).json({ error: 'suspicious must be a boolean' });
        }

        const transaction = await transactionService.updateTransactionSuspicious(transactionId, suspicious);
        res.status(200).json(transaction);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Invalid') || error.message.includes('required')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

const processTransaction = async (req, res) => {
    try {
        const { processed } = req.body;
        if (!processed) {
            return res.status(400).json({error: 'boolean must be true'});
        }
        const utorid = req.auth.utorid;
        const id = req.params.id;
        const processedTransaction = await transactionService.processTransaction(id, utorid);
        return res.status(200).json(processedTransaction);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({error: "transaction not found"});
        }

        if (error.message.includes('already processed') || error.message.includes('not redemption transaction')) {
            return res.status(400).json({error: error.message});
        }

        return res.status(500).json({error: error.message});
    }
};
module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransactionSuspicious,
    processTransaction
};