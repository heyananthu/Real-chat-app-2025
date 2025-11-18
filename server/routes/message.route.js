const express = require('express');
const { getUserForSidebar, getMessages ,sendMessage} = require('../controller/message.controller.js');
const { protectRoute } = require('../middleware/auth.middleware');

const router = express.Router();


router.get('/users/sidebar', protectRoute, getUserForSidebar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);




module.exports = router;