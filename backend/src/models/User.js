const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'analyst', 'operator', 'building_user', 'viewer'],
      default: 'manager',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    assignedBuildings: {
      type: [String],
      default: ['Main Facility'],
    },
    department: {
      type: String,
      default: 'Facility & Energy Management',
    },
    phone: {
      type: String,
      default: '+1 (555) 234-5678',
    },
    preferences: {
      currency: {
        type: String,
        default: '$',
      },
      ratePerKWh: {
        type: Number,
        default: 0.15, // $0.15 per kWh
      },
      monthlyBudgetLimit: {
        type: Number,
        default: 500, // $500 monthly budget
      },
      dailyTargetKWh: {
        type: Number,
        default: 100, // 100 kWh
      },
      alertNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

