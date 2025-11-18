const express = require('express');
const authRoutes = require('./routes/auth.route.js');
const messageRoutes = require('./routes/message.route.js');
const db = require('./lib/db');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {  server, app } = require('./lib/socket.js');
const path = require('path');



// Load environment variables and connect to DB
dotenv.config();
db.connectDB();

const __dirname = path.resolve();

// add body parsers before routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
}

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});