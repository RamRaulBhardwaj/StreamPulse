import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { validateEmailFormatAndBlocklist, validatePassword } from '../utils/authValidation.js';

const DEMO_SEEDED_EMAILS = [
  'viewer@example.com',
  'creator@example.com',
  'admin@example.com',
  'alex@example.com',
  'pixel@example.com',
  'lofi@example.com',
  'sports@example.com',
  'cinema@example.com'
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is invalid'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (val) {
          if (!val) return false;
          if (DEMO_SEEDED_EMAILS.includes(val.toLowerCase())) {
            return true;
          }
          const check = validateEmailFormatAndBlocklist(val);
          return check.valid;
        },
        message: 'Email is invalid'
      }
    },
    password: {
      type: String,
      required: [true, "Your password doesn't contain a letter or number, try adding some"],
      validate: {
        validator: function (val) {
          if (!val) return false;
          if (typeof val === 'string' && (val.startsWith('$2a$') || val.startsWith('$2b$'))) {
            return true;
          }
          const check = validatePassword(val);
          return check.valid;
        },
        message: function (props) {
          const check = validatePassword(props.value);
          return check.error || 'Password is invalid';
        }
      },
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['viewer', 'creator', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'viewer'
    },
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: ''
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Virtual: followersCount
userSchema.virtual('followersCount').get(function () {
  return Array.isArray(this.followers) ? this.followers.length : 0;
});

// Mongoose Pre-save Hook: Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance Method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static Method: Find user by email including hidden password
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

export const User = mongoose.model('User', userSchema);
