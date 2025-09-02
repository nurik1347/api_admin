const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('../config/db'); // bitta papka yuqoriga chiqamiz
const userRoutes = require('../routes/users');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ma'lumotlar bazasiga ulanish
connectDB();

// Yo‘llar
app.use('/api/users', userRoutes);

// 🔑 Muhim: Vercel uchun app’ni export qilish
module.exports = app;
