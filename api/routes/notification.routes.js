import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/Notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications for the current user
router.get('/', getNotifications);

// Mark a single notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

export default router; 