import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // Profile fields
    displayName: { type: String, trim: true, maxlength: 60 },
    bio: { type: String, trim: true, maxlength: 150 },
    website: { type: String, trim: true },
    location: { type: String, trim: true, maxlength: 60 },
    pronouns: { type: String, trim: true, maxlength: 30 },
    avatarUrl: { type: String },
    coverUrl: { type: String },
    emailVerified: { type: Boolean, default: false },

    // Social stats
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },

    // Security/session
    tokenVersion: { type: Number, default: 0 },

    // Privacy and preferences
    isPrivate: { type: Boolean, default: false },
    notifications: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
    },
    // Saved posts & collections
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    collections: [
      new mongoose.Schema(
        {
          name: { type: String, required: true, trim: true, maxlength: 60 },
          posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
        },
        { _id: true }
      ),
    ],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
