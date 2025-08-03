import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: ['comment', 'like', 'follow']
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedBlog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    relatedComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema, 'notifications');
export default Notification; 