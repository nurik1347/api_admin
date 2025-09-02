const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Autentifikatsiya yo'llari
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Foydalanuvchi profilini olish (o‘z ma'lumotlari)
router.get('/profile', protect, userController.getUserProfile);

// Admin yo'llari (JWT va admin roli talab qilinadi)
router.get('/', protect, admin, userController.getAllUsers);
router.get('/:id', protect, admin, userController.getUserById);
router.post('/', protect, admin, userController.createUser);
router.put('/:id', protect, admin, userController.updateUser);
router.patch('/:id', protect, admin, userController.patchUser);
router.delete('/:id', protect, admin, userController.deleteUser);
router.delete('/multiple', protect, admin, userController.deleteMultipleUsers);

module.exports = router;