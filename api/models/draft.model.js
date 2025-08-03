import mongoose from "mongoose";

const draftSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    title: {
        type: String,
        trim: true
    },
    slug: {
        type: String,
        trim: true
    },
    blogContent: {
        type: String,
        trim: true
    },
    featuredImage: {
        type: String,
        trim: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster queries
draftSchema.index({ author: 1 });

const Draft = mongoose.model('Draft', draftSchema, 'drafts');
export default Draft; 