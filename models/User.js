const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  phone: { type: String, required: false, match: [/^\+?[1-9]\d{1,14}$/, 'Telefon raqami noto‘g‘ri formatda'] }, // Telefon raqami (ixtiyoriy)
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false }
  }, // Manzil (ixtiyoriy)
  isActive: { type: Boolean, default: true }, // Foydalanuvchi holati (faol yoki nofaol)
  lastLogin: { type: Date, default: null } // Oxirgi kirish vaqti
});

// Parolni xeshlash
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Parolni solishtirish
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);