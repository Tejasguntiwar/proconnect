import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

const toPublicUploadPath = (filePath) => {
    if (!filePath) return "";

    const normalized = filePath.replace(/\\/g, "/");
    const filename = normalized.includes("/uploads/")
        ? normalized.split("/uploads/").pop()
        : normalized.split("/").pop();

    return filename ? `uploads/${filename}` : "";
};

export const activeCheck = async (req,res) => {
    return res.status(200).json({message:"RUNNING"})
}

export const createPost = async (req,res) => {
    const {token} = req.body;

    try {
        const user = await User.findOne({token:token});
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? toPublicUploadPath(req.file.path) : "",
            fileType: req.file != undefined ? req.file.mimetype.split('/')[1] : ""
        })
        await post.save();
        return res.status(201).json({message:"Post created successfully", post});
    } catch (error) {
        return res.status(500).json({message:"Error creating post", error:error.message})
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("userId", "name username email profilePicture");
        return res.json({ posts });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const deletePost = async (req, res) => {
    const {token, post_id} = req.body;

    try {
        const user = await User.findOne({token:token})
        .select("_id")

        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const post = await Post.findOne({_id:post_id, userId:user._id});
        if(!post){
            return res.status(404).json({message:"Post not found"})
        }
        if(post.userId.toString() !== user._id.toString()){
            return res.status(403).json({message:"You are not authorized to delete this post"})
        }
        await Post.deleteOne({_id:post_id});
        return res.status(200).json({message:"Post deleted successfully"})
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const get_comments_by_post = async (req, res) => {
    const { post_id } = req.query;

    try {
        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const comments = await Comment.find({ postId: post_id }).populate("userId", "name username email profilePicture");

        return res.json(comments.reverse() ); // Reverse the comments to show the latest first
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_comment = async (req, res) => {
    const { token, comment_id } = req.body;

    try {
        const user = await User.findOne({ token: token })
            .select("_id");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const comment = await Comment.findOne({ _id: comment_id, userId: user._id });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }
        await Comment.deleteOne({ _id: comment_id });
        return res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const increment_likes = async (req, res) => {
    const { post_id } = req.body;
    try {

        const post = await Post.findById(post_id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.likes += 1;
        await post.save();
        return res.status(200).json({ message: "Likes incremented successfully", likes: post.likes });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}