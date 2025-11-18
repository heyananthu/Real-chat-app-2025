const User = require('../model/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../lib/utils.js');
const cloudinary = require('../lib/cloudinary.js');

const register = async (req, res) => {
    const { fullName, email, password } = req.body || {};

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // ✅ FIXED HERE
        const findUser = await User.findOne({ email });

        if (findUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        // Save user
        await newUser.save();

        // Generate token
        generateToken(newUser._id, res);

        res.status(201).json({
            message: 'User registered successfully',
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const findUser = await User.findOne({ email });

        if (!findUser) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, findUser.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate token
        generateToken(findUser._id, res);

        res.status(200).json({
            message: 'User logged in successfully',
            _id: findUser._id,
            fullName: findUser.fullName,
            email: findUser.email,
            profilePic: findUser.profilePic,
        });

        console.log("LOGIN SUCCESS:", findUser._id, findUser.email);

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


const logout = (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfilePic = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: 'Profile picture URL is required' });
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });

        res.status(200).json({
            message: 'Profile picture updated successfully',
            profilePic: updatedUser.profilePic,
        });

    } catch (error) {
        console.error("UPDATE PROFILE PIC ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    }
    catch (error) {
        console.error("CHECK AUTH ERROR:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {
    register,
    login,
    logout,
    updateProfilePic,
    checkAuth
};

