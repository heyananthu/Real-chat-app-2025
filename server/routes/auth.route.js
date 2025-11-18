const express = require('express');
const router = express.Router();
const { register, login, logout, updateProfilePic,checkAuth } = require('../controller/auth.controller.js');
const { protectRoute } = require('../middleware/auth.middleware.js');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.put('/update-profile-pic',protectRoute, updateProfilePic); // Assuming you have this controller function
router.get('/check', protectRoute, checkAuth )
    
module.exports = router;


