import { handleError } from "../helpers/handleError.js"
import BlogLike from "../models/bloglike.model.js"
import { createNotification } from "./Notification.controller.js"
import Blog from "../models/blog.model.js"
import User from "../models/user.model.js"

export const doLike = async (req, res, next) => {
    try {
        const { user, blogid } = req.body
        let like
        like = await BlogLike.findOne({ user, blogid })
        if (!like) {
            const saveLike = new BlogLike({
                user, blogid
            })
            like = await saveLike.save()
            
            // Create notification for blog owner
            const blog = await Blog.findById(blogid).populate('author', '_id name');
            if (blog && blog.author._id.toString() !== user) {
                const liker = await User.findById(user).select('name');
                await createNotification(
                    blog.author._id, // recipient
                    'like', // type
                    `${liker.name} liked your post "${blog.title}"`, // content
                    user, // sender
                    blogid // relatedBlog
                );
            }
        } else {
            await BlogLike.findByIdAndDelete(like._id)
        }

        const likecount = await BlogLike.countDocuments({ blogid })

        res.status(200).json({
            likecount
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const likeCount = async (req, res, next) => {
    try {
        const { blogid, userid } = req.params
        const likecount = await BlogLike.countDocuments({ blogid })

        let isUserliked = false
        if (userid) {
            const getuserlike = await BlogLike.countDocuments({ blogid, user: userid })
            if (getuserlike > 0) {
                isUserliked = true
            }
        }

        res.status(200).json({
            likecount,
            isUserliked
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


