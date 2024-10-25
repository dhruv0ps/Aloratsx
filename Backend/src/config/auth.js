
const { ApprovedDealer } = require('../config/models/dealerApproved');
const User = require('../config/models/userModel');
const JwtService = require('../services/jwt-service');
const jwtService = new JwtService()
const authenticateTokenDealer = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = await jwtService.verifyToken(token); // Ensure verifyToken is used as a promise
        const user = await ApprovedDealer.findOne({ _id: decoded.id, token });

        if (!user) {
            throw new Error('Dealer not found');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error(error); // Log error details for debugging
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const authenticateTokenAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    try {
        const decoded = await jwtService.verifyToken(token)
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err)
        return res.status(401).json({ error: "Please login again to proceed" });
    }
};

module.exports = {
    authenticateTokenAdmin,
    authenticateTokenDealer
}