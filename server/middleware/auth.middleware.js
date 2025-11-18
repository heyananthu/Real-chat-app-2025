const jwt = require('jsonwebtoken');
const User = require('../model/user.model.js');

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: 'Not authorized, no token' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            res.status(401).json({ message: 'Not authorized, invalid token' });
            return;
        }
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(401).json({ message: 'Not authorized, user not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {

        console.error("AUTH MIDDLEWARE ERROR:", error);
        res.status(401).json({ message: 'Not authorized' });
    }
}

module.exports = { protectRoute };