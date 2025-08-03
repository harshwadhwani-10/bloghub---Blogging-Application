import cloudinary from "../config/cloudinary.js"
import { handleError } from "../helpers/handleError.js"
import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs'
import Ban from "../models/ban.model.js"
import Blog from "../models/blog.model.js"
import Comment from "../models/comment.model.js"
import Like from "../models/like.model.js"
import Notification from "../models/notification.model.js"
import { sendEmail, emailTemplates } from '../utils/email.js'

export const getUser = async (req, res, next) => {
    try {
        const { userid } = req.params
        const user = await User.findOne({ _id: userid }).lean().exec()
        if (!user) {
            next(handleError(404, 'User not found.'))
        }
        res.status(200).json({
            success: true,
            message: 'User data found.',
            user
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const updateUser = async (req, res, next) => {
    try {
        const data = JSON.parse(req.body.data)
        const { userid } = req.params

        const user = await User.findById(userid)
        user.name = data.name
        user.email = data.email
        user.bio = data.bio

        if (data.password && data.password.length >= 8) {
            const hashedPassword = bcryptjs.hashSync(data.password)
            user.password = hashedPassword
        }

        if (req.file) {
            // Upload an image
            const uploadResult = await cloudinary.uploader
                .upload(
                    req.file.path,
                    { folder: 'MERN-BLOG', resource_type: 'auto' }
                )
                .catch((error) => {
                    next(handleError(500, error.message))
                });

            user.avatar = uploadResult.secure_url
        }

        await user.save()

        const newUser = user.toObject({ getters: true })
        delete newUser.password
        res.status(200).json({
            success: true,
            message: 'Data updated',
            user: newUser
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const getAllUser = async (req, res, next) => {
    try {
        const users = await User.find({ email: { $ne: '202412100@daiict.ac.in' } })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
            
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('Attempting to delete user:', id);
        
        const user = await User.findById(id);
        if (!user) {
            console.log('User not found:', id);
            return next(handleError(404, 'User not found'));
        }

        // Check if user is admin
        if (user.email === '202412100@daiict.ac.in') {
            console.log('Attempted to delete admin user');
            return next(handleError(403, 'Cannot ban admin user'));
        }

        // Send deletion notification email
        try {
            await sendEmail(
                user.email,
                emailTemplates.accountDeletion.subject,
                emailTemplates.accountDeletion.text,
                emailTemplates.accountDeletion.html
            );
        } catch (emailError) {
            console.error('Failed to send deletion email:', emailError);
        }

        console.log('Creating ban record for user:', user._id);
        // Create ban record
        const ban = new Ban({
            userId: user._id,
            name: user.name,
            email: user.email,
            reason: 'Account deleted by admin',
            bannedBy: req.user.id
        });

        await ban.save();
        console.log('Ban record created successfully');

        // Delete all related data
        try {
            console.log('Deleting user blogs...');
            const blogsResult = await Blog.deleteMany({ author: user._id });
            console.log('Blogs deleted:', blogsResult.deletedCount);
            
            console.log('Deleting user comments...');
            const commentsResult = await Comment.deleteMany({ user: user._id });
            console.log('Comments deleted:', commentsResult.deletedCount);
            
            console.log('Deleting user likes...');
            const likesResult = await Like.deleteMany({ user: user._id });
            console.log('Likes deleted:', likesResult.deletedCount);
            
            console.log('Deleting user notifications...');
            const notificationsResult = await Notification.deleteMany({ 
                $or: [
                    { sender: user._id },
                    { recipient: user._id }
                ]
            });
            console.log('Notifications deleted:', notificationsResult.deletedCount);
        } catch (error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            // Continue with the ban even if some related data deletion fails
        }

        // Delete user from users collection
        console.log('Deleting user account...');
        await User.findByIdAndDelete(id);
        console.log('User account deleted successfully');

        res.status(200).json({
            success: true,
            message: 'User banned and data cleaned successfully'
        });
    } catch (error) {
        console.error('Fatal error in deleteUser:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        next(handleError(500, error.message));
    }
}