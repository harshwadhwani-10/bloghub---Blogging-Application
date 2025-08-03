import { handleError } from "../helpers/handleError.js";
import Draft from "../models/draft.model.js";
import cloudinary from "../config/cloudinary.js";
import { encode } from 'entities';

// Get draft for the current user
export const getDraft = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // Find the most recent draft for the user
        const draft = await Draft.findOne({ author: userId })
            .sort({ lastUpdated: -1 })
            .lean();
        
        res.status(200).json({
            success: true,
            draft
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};

// Save or update a draft
export const saveDraft = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const data = JSON.parse(req.body.data);
        
        // Check if a draft already exists for this user
        let draft = await Draft.findOne({ author: userId });
        
        let featuredImage = '';
        
        // Handle image upload if a file is provided
        if (req.file) {
            try {
                const uploadResult = await cloudinary.uploader.upload(
                    req.file.path,
                    { 
                        folder: 'MERN-BLOG-DRAFTS', 
                        resource_type: 'auto'
                    }
                );
                featuredImage = uploadResult.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return next(handleError(500, `Image upload failed: ${error.message}`));
            }
        }
        
        if (draft) {
            // Update existing draft
            draft.category = data.category || draft.category;
            draft.title = data.title || draft.title;
            draft.slug = data.slug || draft.slug;
            draft.blogContent = data.blogContent ? encode(data.blogContent) : draft.blogContent;
            draft.lastUpdated = Date.now();
            
            if (featuredImage) {
                draft.featuredImage = featuredImage;
            }
            
            await draft.save();
        } else {
            // Create new draft
            draft = new Draft({
                author: userId,
                category: data.category,
                title: data.title,
                slug: data.slug,
                blogContent: data.blogContent ? encode(data.blogContent) : '',
                featuredImage: featuredImage,
                lastUpdated: Date.now()
            });
            
            await draft.save();
        }
        
        res.status(200).json({
            success: true,
            message: 'Draft saved successfully',
            draft
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};

// Delete a draft
export const deleteDraft = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // Delete all drafts for the user
        await Draft.deleteMany({ author: userId });
        
        res.status(200).json({
            success: true,
            message: 'Draft deleted successfully'
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
}; 