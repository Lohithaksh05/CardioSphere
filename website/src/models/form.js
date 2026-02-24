// models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: String,
  personalInfo: Object,
  formData: Object,
});

const User = mongoose.model('User', userSchema);

export default User;
