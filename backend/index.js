#!/usr/bin/env node
'use strict';

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const express = require("express");
const app = express();
app.use(express.json());

// ADD YOUR WORK HERE
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { authMiddleware } = require('./src/middleware/auth.js');
const authRoutes = require('./src/routes/auth.js');
const userRoutes = require('./src/routes/users.js');
const eventsRoutes = require('./src/routes/events.js')
const promotionRoutes = require('./src/routes/promotions.js');
const transactionRoutes = require('./src/routes/transactions.js');

// Set up cors to allow requests from your React frontend

app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
const uploadsDir = process.env.UPLOADS_DIR || "/data/uploads";
app.use("/uploads", express.static(path.resolve(uploadsDir)));
app.use(authMiddleware); // apply authentication middleware

// Mount routes
app.use('/auth', authRoutes); 
app.use('/users', userRoutes);
app.use('/events', eventsRoutes);
app.use('/promotions', promotionRoutes);
app.use('/transactions', transactionRoutes);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
