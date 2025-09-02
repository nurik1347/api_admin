const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Foydalanuvchi ro'yxatdan o'tkazish (token qaytaradi)
exports.registerUser = async (req, res) => {
  const { name, email, password, role, phone, address, birthDate, profileImage, language } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Foydalanuvchi allaqachon mavjud' });

    user = new User({ name, email, password, role, phone, address, birthDate, profileImage, language });
    await user.save();

    // Token yaratish
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Foydalanuvchi ro\'yxatdan o\'tdi',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        birthDate: user.birthDate,
        profileImage: user.profileImage,
        language: user.language
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Foydalanuvchi kirish
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Noto\'g\'ri email yoki parol' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Noto\'g\'ri email yoki parol' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        birthDate: user.birthDate,
        profileImage: user.profileImage,
        language: user.language
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// O‘z profilini olish
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Barcha foydalanuvchilarni olish
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Muayyan foydalanuvchini ID bo‘yicha olish
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yangi foydalanuvchi qo‘shish
exports.createUser = async (req, res) => {
  const { name, email, password, role, phone, address, birthDate, profileImage, language } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Foydalanuvchi allaqachon mavjud' });

    user = new User({ name, email, password, role, phone, address, birthDate, profileImage, language });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Foydalanuvchini to‘liq yangilash (PUT)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.birthDate = req.body.birthDate || user.birthDate;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.language = req.body.language || user.language;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Foydalanuvchini qisman yangilash (PATCH)
exports.patchUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    const updates = req.body;
    for (let key in updates) {
      if (key === 'password' && updates[key]) {
        user.password = updates[key];
      } else if (key === 'address') {
        user.address = { ...user.address, ...updates[key] };
      } else {
        user[key] = updates[key];
      }
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Foydalanuvchini o‘chirish
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });

    await user.deleteOne();
    res.json({ message: 'Foydalanuvchi o‘chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bir nechta foydalanuvchini o‘chirish
exports.deleteMultipleUsers = async (req, res) => {
  const { ids } = req.body;
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'O‘chirish uchun ID lar ro‘yxati kerak' });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Hech qanday foydalanuvchi topilmadi' });
    }

    res.json({ message: `${result.deletedCount} ta foydalanuvchi o‘chirildi` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};