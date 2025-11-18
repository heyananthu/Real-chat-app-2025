const Messages = require('../model/message.model.js');
const User = require('../model/user.model.js');
const cloudinary = require('../lib/cloudinary.js');
const { getReceiverSocketId } = require('../lib/socket.js');
const { io } = require('../lib/socket.js');



const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getMessages = async (req, res) => {
    try {
        console.log('getMessages params:', req.params, 'user:', req.user && req.user._id);
        const myId = req.user._id;
        const { id: otherUserId } = req.params;

        if (!otherUserId || otherUserId === 'undefined') {
            return res.status(400).json({ message: 'Missing or invalid other user id in params' });
        }

        const messages = await Messages.find({
            $or: [
                { senderId: myId, recieverId: otherUserId },
                { senderId: otherUserId, recieverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error('getMessages error:', err);
        res.status(500).json({ message: err.message || 'Server error getting messages' });
    }
}

const sendMessage = async (req, res) => {
    try {
        console.log('sendMessage params:', req.params, 'body:', req.body, 'user:', req.user && req.user._id);
        const { text, image } = req.body || {};
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        if (!recieverId || recieverId === 'undefined') {
            return res.status(400).json({ message: 'Missing or invalid receiver id in params' });
        }
        if (!text && !image) {
            return res.status(400).json({ message: 'Message text or image is required' });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessge = new Messages({
            senderId,
            recieverId,
            text,
            image: imageUrl
        });
        await newMessge.save();
        res.status(201).json(newMessge);

        const recieverSocketId = getReceiverSocketId(recieverId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", newMessge);
        }

    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ message: err.message || 'Server error sending message' });
    }
}

module.exports = {
    getUserForSidebar, getMessages, sendMessage
}