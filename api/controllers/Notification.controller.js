import { handleError } from "../helpers/handleError.js";
import Notification from "../models/notification.model.js";
import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name avatar')
            .populate('relatedBlog', 'title')
            .populate('relatedComment', 'content')
            .sort({ createdAt: -1 })
            .limit(50);

        // Transform notifications to match frontend format
        const transformedNotifications = notifications.map(notification => {
            const transformed = {
                ...notification.toObject(),
                fromUser: notification.sender,
                blog: notification.relatedBlog,
                comment: notification.relatedComment,
                message: notification.content
            };
            
            // Remove the original fields to avoid confusion
            delete transformed.sender;
            delete transformed.relatedBlog;
            delete transformed.relatedComment;
            delete transformed.content;
            
            return transformed;
        });

        res.status(200).json(transformedNotifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
    }
};

// Create a new notification
export const createNotification = async (recipientId, type, content, senderId, relatedBlog = null, relatedComment = null) => {
    try {
        // Create notification with the provided content (which already has the sender's name)
        const notification = new Notification({
            sender: senderId,
            recipient: recipientId,
            type,
            content,
            relatedBlog,
            relatedComment
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}; 