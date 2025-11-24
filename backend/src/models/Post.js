import mongoose from 'mongoose';

const mediaImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, trim: true },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    caption: { type: String, trim: true, maxlength: 2200 },
    location: { type: String, trim: true, maxlength: 120 },
    allowComments: { type: Boolean, default: true },
    visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
    status: { type: String, enum: ['active', 'archived', 'draft'], default: 'active' },

    images: { type: [mediaImageSchema], default: [] },
    video: {
      url: { type: String },
      width: { type: Number },
      height: { type: Number },
      alt: { type: String, trim: true },
    },

    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
