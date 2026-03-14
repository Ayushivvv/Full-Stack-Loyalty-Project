const userService = require('../services/userService');
const { validateUserRegistration } = require('../utils/validation');
const upload = require('../middleware/upload');
const QRCode = require("qrcode");

const registerUser = async (req, res) => {
    try {
        const errors = validateUserRegistration(req.body);
        if (errors.length > 0) {
            console.log(errors);
            return res.status(400).json({"message": "Bad Request", errors});
        }
        const { utorid, email, name } = req.body;

        //checking if existing user with this utorid
        const existingUser = await userService.getUserByUtorid(utorid);
        if (existingUser) {
            return res.status(409).json({"message": "Conflict"});
        }

        //checking if existing user with this email
        const existingEmail = await userService.getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({"message": "Bad Request1"});
        }

        //create user
        const newUser = await userService.createUser({ utorid, email, name });
        return res.status(201).json({
                "id": newUser.id,
                "utorid": newUser.utorid, 
                "name": newUser.name,
                "email": newUser.email,
                "verified": newUser.verified,
                "expiresAt": newUser.expiresAt,
                "resetToken": newUser.resetToken
        });

    } catch (error) {
        return res.status(500).json({"message": error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const {
            name,
            role,
            verified,
            activated,
            page = 1,
            limit = 10
        } = req.query;

        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
            return res.status(400).json({ "message": 'Invalid page number' });
        }

        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const filters = {
            name,
            role,
            verified,
            activated,
            page: pageNum,
            limit: limitNum
        };

        const users = await userService.getUsers(filters);
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({"message": error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id }= req.params;
        const userIdNum = parseInt(id);
        console.log(userIdNum);
        const requesterRole = await userService.getRoleByUtorid(req.auth.utorid);
        if (!requesterRole) {
            return res.status(403).json({ "message": 'Insufficient permissions' });
        }
        const user = await userService.getUserById(userIdNum, requesterRole);
        if (!user) {
            return res.status(404).json({ "message": 'User not found' });
        }
        if (isNaN(userIdNum) || userIdNum < 1 || !Number.isInteger(userIdNum)) {
            return res.status(400).json({ "message": 'Invalid user ID' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({"message": error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id }= req.params;

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ "message": "Empty payload" });
        }

        const requesterRole = await userService.getRoleByUtorid(req.auth.utorid);
        if (!requesterRole) {
            return res.status(403).json({ "message": 'Insufficient permissions' });
        }

        const allowedRoles = ['manager', 'superuser'];
        if (!allowedRoles.includes(requesterRole)) {
            return res.status(403).json({ "message": 'Insufficient permissions' });
        }
        
        const userIdNum = parseInt(id);
        if (isNaN(userIdNum) || userIdNum < 1 || !Number.isInteger(userIdNum)) {
            return res.status(400).json({ "message": 'Invalid user ID' });
        }

        const { email, verified, suspicious, role } = req.body;

        const hasAnyField = email !== undefined || verified !== undefined || 
                           suspicious !== undefined || role !== undefined;
        if (!hasAnyField) {
            return res.status(400).json({ "message": "Empty payload" });
        }

        if (role !== undefined && role !== null && !['cashier', 'manager', 'superuser'].includes(role)) {
            return res.status(400).json({ "message": 'Invalid role' });
        }
        if (verified !== undefined && verified !== null && typeof verified !== 'boolean') {
            return res.status(400).json({ "message": 'Invalid verified value' });
        }
        if (suspicious !== undefined && suspicious !== null && typeof suspicious !== 'boolean') {
            return res.status(400).json({ "message": 'Invalid suspicious value' });
        }
        if (email !== undefined && email !== null && !/^[^\s@]+@mail\.utoronto\.ca$/.test(email)) {
            return res.status(400).json({ "message": 'Invalid email format' });
        }

        const updateData = {
            email,
            verified,
            suspicious,
            role
        };

        const updatedUser = await userService.updateUser(userIdNum, updateData, requesterRole);
        if (!updatedUser) {
            return res.status(404).json({ "message": 'User not found' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        if (error.message.includes('Unauthorized to assign this role')) {
            return res.status(403).json({ "message": error.message });
        }
        if (error.message.includes('Suspicious user cannot be promoted to cashier')) {
            return res.status(400).json({ "message": error.message });
        }
        if (error.message.includes('Manager can only assign regular or cashier roles')) {
            return res.status(403).json({ "message": error.message });
        }
        if (error.message.includes('Invalid role assignment')) {
            return res.status(400).json({ "message": error.message });
        }
        if (error.message.includes('Cannot unverify a user')) {
            return res.status(400).json({ "message": error.message });
        }
        return res.status(500).json({"message": error.message });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const utorid = req.auth.utorid;
        const { old: oldPassword, new: newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ "message": "Both old and new password are required" });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                "message": "New password must be 8-20 characters with at least one uppercase, one lowercase, one number, and one special character" 
            });
        }

        const result = await userService.updateUserPassword(utorid, oldPassword, newPassword);

        if (!result) {
            return res.status(404).json({ "message": "User not found" });
        }

        return res.status(200).json({ "message": "Password updated successfully" });

    } catch (error) {
        if (error.message === 'Current password is incorrect') {
            return res.status(403).json({ "message": "Current password is incorrect" });
        }
        return res.status(500).json({"message": error.message });
    }
};

const updateCurrentUser = async (req, res) => {
    try {
        const utorid = req.auth.utorid;
        const { name, email, birthday } = req.body;

        const hasValidUpdate = [name, email, birthday, req.file].some(field => field !== undefined && field !== null);
        if (!hasValidUpdate) {
            return res.status(400).json({ "message": "Empty payload" });
        }

        if (name !== undefined && name !== null) {
            if (typeof name !== 'string' || name.length < 1 || name.length > 50) {
                return res.status(400).json({ "message": "Name must be between 1 and 50 characters" });
            }
        }
        if (email !== undefined && email !== null) {
            if (!/^[^\s@]+@(mail\.utoronto\.ca|gmail\.com)$/.test(email)) {
                return res.status(400).json({ "message": "Invalid email format: must be @mail.utoronto.ca or @gmail.com" });
            }
        }

        if (birthday !== undefined && birthday !== null) {
            const birthdayDate = new Date(birthday);
            if (isNaN(birthdayDate.getTime())) {
                return res.status(400).json({ "message": "Invalid birthday format. Use YYYY-MM-DD" });
            }
        const [year, month, day] = birthday.split('-').map(Number);
        
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            return res.status(400).json({ "message": "Invalid birthday year" });
        }
        
        if (month < 1 || month > 12) {
            return res.status(400).json({ "message": "Invalid birthday month" });
        }
        
        const daysInMonth = new Date(year, month, 0).getDate(); 
        if (day < 1 || day > daysInMonth) {
            return res.status(400).json({ "message": "Invalid birthday day" });
        }
        }

        let avatarUrl = null;
        if (req.file) {
            avatarUrl = `/uploads/avatars/${req.file.filename}`;
        }

        const updateData = {
            name,
            email,
            birthday,
            avatarUrl
        };

        const updatedUser = await userService.updateCurrentUser(utorid, updateData);

        const response = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name,
            email: updatedUser.email,
            birthday: updatedUser.birthday ? updatedUser.birthday.toISOString().split('T')[0] : null,
            role: updatedUser.role,
            points: updatedUser.points,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
            verified: updatedUser.verified,
            avatarUrl: updatedUser.avatarUrl || null
        }

        

        return res.status(200).json(response);

    } catch (error) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({ "message": "Email already exists" });
        }
        return res.status(500).json({"message": error.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const utorid = req.auth.utorid;
        const user = await userService.getCurrentUser(utorid);
        if (!user) {
            return res.status(404).json({"message": "user not found"});
        }
        const isOrganizer = await userService.isAnOrganizer(user.id);
        const response = {
            id: user.id,
            utorid: user.utorid,
            name: user.name,
            email: user.email,
            birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : null,
            role: user.role,
            points: user.points,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            verified: user.verified,
            avatarUrl: user.avatarUrl,
            promotions: user.promotions || [],
            isOrganizer: isOrganizer
        };
        console.log(":(");
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({"message": error.message });
    }
};

const createTransferTransaction = async (req, res) => {
    try {
        const recipientid = req.params.id;
        const recipientUtorid = await userService.getUtoridFromId(recipientid);
        const { type, amount, remark } = req.body;
        const senderUtorid = req.auth.utorid; 
        const senderVer = await userService.getVerified(senderUtorid);
        if (!type || amount === undefined || amount === null) {
            return res.status(400).json({ error: 'Missing required fields: type and amount' });
        }

        if (type !== 'transfer') {
            return res.status(400).json({ error: 'Type must be "transfer"' });
        }

        if (amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: 'Amount must be a positive integer' });
        }

        if (!senderVer) {
            return res.status(403).json({ error: 'Sender is not verified' });
        }

        if (recipientUtorid === senderUtorid) {
            return res.status(400).json({ error: 'Cannot transfer points to yourself' });
        }

        const transferData = {
            senderUtorid,
            recipientUtorid, 
            amount,
            remark: remark || '',
            createdBy: senderUtorid
        };

        const transaction = await userService.createTransferTransaction(transferData);
        res.status(201).json(transaction);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }

        if (error.message.includes('not verified')) {
            return res.status(403).json({ error: error.message });
        } 
        
        if (error.message.includes('does not have enough points')) {
            return res.status(400).json({error: "not enough points"});
        }
        return res.status(500).json({ error: error.message });
    }
};

const createRedemptionTransaction = async (req, res) => {
    try {
        const {type, amount, remark} = req.body;
        if (type !== 'redemption') {
            return res.status(400).json({ error: 'Type must be "redemption"' });
        }
        if (amount <= 0 || !Number.isInteger(amount)) {
            return res.status(400).json({ error: 'Amount must be a positive integer' });
        }
        const utorid = req.auth.utorid; 
        const verified = await userService.getVerified(utorid);
        if (!verified) {
            return res.status(403).json({ error: 'Current user is not verified' });
        }
        const redemptionData = {
            utorid,
            amount,
            remark,
        }
        const transaction = await userService.createRedemptionTransaction(redemptionData);
        res.status(201).json(transaction);
    } catch (error) {
        if (error.message.includes('does not have enough points')) {
            return res.status(400).json({error: "not enough points"});
        }

        return res.status(500).json({ error: error.message });
    }
}

const getMyTransactions = async (req, res) => {
    try {
        const validationErrors = validateMyTransactionsQuery(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors.join(', ') });
        }
        console.log(req.body);

        const filters = {
            type: req.query.type,
            relatedId: req.query.relatedId ? parseInt(req.query.relatedId) : undefined,
            promotionId: req.query.promotionId ? parseInt(req.query.promotionId) : undefined,
            amount: req.query.amount ? parseFloat(req.query.amount) : undefined,
            operator: req.query.operator,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10
        };


        const result = await userService.getMyTransactions(req.auth.utorid, filters);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes('Invalid') || error.message.includes('required')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const validateMyTransactionsQuery = (query) => {
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

const getUserQrCodeByUtorid = async (req, res) => {
    try {
        const utorid = req.params.utorid
        const user = await userService.getUserByUtorid(utorid);

        // content encoded inside QR
        const qrData = `${process.env.FRONTEND_URL}/verify/${user.qrToken}`;

        const qr = await QRCode.toDataURL(qrData);
        
        res.status(200).json({ qr }); // { "qr": "data:image/png;base64,..." }
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }

}

module.exports = {
    registerUser,
    getUsers,
    getUserById,
    updateUser,
    updateUserPassword,
    updateCurrentUser,
    getCurrentUser,
    createTransferTransaction,
    createRedemptionTransaction,
    getMyTransactions,
    getUserQrCodeByUtorid,
};
