import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from 'fs';
import path from 'path';
import ConnectionRequest from "../models/connections.model.js";
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";

const convertUserDatetoPDF = async (userProfile) => {
    const outputName = crypto.randomBytes(32).toString("hex") + ".pdf";
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    const outputPath = path.join(uploadDir, outputName);
    const doc = new PDFDocument();

    await new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(outputPath);
        stream.on("finish", resolve);
        stream.on("error", reject);
        doc.pipe(stream);

        try {
            if (userProfile.userId?.profilePicture && fs.existsSync(userProfile.userId.profilePicture)) {
                doc.image(userProfile.userId.profilePicture, {
                    width: 100,
                    align: "center"
                });
            } else {
                const defaultImagePath = path.join(uploadDir, "default.jpg");
                if (fs.existsSync(defaultImagePath)) {
                    doc.image(defaultImagePath, {
                        width: 100,
                        align: "center"
                    });
                    console.log(`Using default image for user: ${userProfile.userId.username}`);
                } else {
                    console.warn(`Default image not found at ${defaultImagePath}`);
                }
            }
        } catch (imageError) {
            console.warn(`Error adding image to PDF: ${imageError.message}`);
        }

        doc.fontSize(14).text(`Name: ${userProfile.userId.name}`);
        doc.fontSize(14).text(`Username: ${userProfile.userId.username}`);
        doc.fontSize(14).text(`Email: ${userProfile.userId.email}`);
        doc.fontSize(14).text(`Bio: ${userProfile.bio}`);
        doc.fontSize(14).text(`Current Position: ${userProfile.currentPost}`);

        doc.fontSize(14).text("Past Work: ");
        userProfile.pastWork.forEach((work) => {
            doc.fontSize(12).text(`Company: ${work.company}`);
            doc.fontSize(12).text(`Position: ${work.position}`);
            doc.fontSize(12).text(`Years: ${work.years}`);
        });

        doc.end();
    });

    return `uploads/${outputName}`;
}


export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) return res.status(400).json({ message: "All fields are required" })
        const user = await User.findOne({
            email
        });
        if (user) return res.status(400).json({ message: "User already exists" })

        const heashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: heashedPassword,
            username
        });

        await newUser.save();

        const profile = new Profile({
            userId: newUser._id
        });

        await profile.save();

        return res.json({
            message: "User Created"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        const user = await User.findOne({
            email
        });

        if (!user) return res.status(404).json({ message: "USer does not exist!" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(403).json({ message: "Invalid Credentials!" });

        const token = crypto.randomBytes(32).toString("hex");

        await User.updateOne({ _id: user._id }, { token });

        return res.json({ token: token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const updateProfilePicture = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token is required" });

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profilePicture = req.file.path;

        await user.save();

        return res.json({ message: "Profile picture updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const { username, email } = newUserData;

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (
            existingUser &&
            existingUser._id.toString() !== user._id.toString()
        ) {
            return res.status(400).json({
                message: "Username or email already in use"
            });
        }
        Object.assign(user, newUserData);
        await user.save();

        return res.json({ message: "Profile updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }

}


export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: "Token is required" });
        const user = await User.findOne({
            token
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        const profile = await Profile.findOneAndUpdate(
            { userId: user._id },
            { $setOnInsert: { userId: user._id } },
            { new: true, upsert: true }
        ).populate("userId", "name username email profilePicture");

        return res.json({ user, profile });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;
        const user = await User.findOne({
            token
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        const profile = await Profile.findOne({
            userId: user._id
        });
        if (!profile) return res.status(404).json({ message: "Profile not found" });

        Object.assign(profile, newProfileData);
        await profile.save();

        return res.json({ message: "Profile updated successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find().populate("userId", "name username email profilePicture");
        return res.json({ profiles });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const downloadProfile = async (req, res) => {
    try {
        const userId = req.query.id;
        const userProfile = await Profile.findOne({ userId })
            .populate("userId", "name username email profilePicture");

        if (!userProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const outputPath = await convertUserDatetoPDF(userProfile);

        return res.json({ message: outputPath });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const sendConnectionRequest = async (req, res) => {
    try {
        const { token, targetUserId } = req.body;
        if (!token || !targetUserId) return res.status(400).json({ message: "Token and target user ID are required" });

        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const targetUser = await User.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: "Target user not found" });

        const existingRequest = await ConnectionRequest.findOne({
            userId: user._id,
            connectionId: targetUser._id
        });

        if (existingRequest) return res.status(400).json({ message: "Connection request already sent" });

        const newRequest = new ConnectionRequest({
            userId: user._id,
            connectionId: targetUser._id
        });

        await newRequest.save();

        return res.json({ message: "Connection request sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getMyConnectionsRequests = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const requests = await ConnectionRequest.find({
            connectionId: user._id
        }).populate("userId", "name username email profilePicture");

        return res.json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}  

export const myConnections = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const connections = await ConnectionRequest.find({connectionId: user._id})
        .populate("userId", "name username email profilePicture");

        return res.json(connections);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { token, requestId, action_type } = req.body;
        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const request = await ConnectionRequest.findById(requestId);

        if (!request) return res.status(404).json({ message: "Connection request not found" });

        if(action_type === "accept") {
            request.status_accepted = true;
            await request.save();
        } else if(action_type === "reject") {
            await request.deleteOne();
        }

        return res.json({ message: "Connection request " + action_type + "ed", request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getSentConnectionRequests = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const requests = await ConnectionRequest.find({
            userId: user._id
        }).populate("connectionId", "name username email profilePicture");

        return res.json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const commentOnPost = async (req, res) => {
    try {
        const { token, post_id, commentBody } = req.body;
        const user = await User.findOne({ token }).select("_id");

        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await Post.findById(post_id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = new Comment({
            userId: user._id,
            postId: post_id,
            body: commentBody
        });

        await comment.save();

        return res.status(201).json({ message: "Comment added successfully", comment });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
    const { username } = req.query;
    try {
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        const profile = await Profile.findOne({ userId: user._id })
        .populate("userId", "name username email profilePicture");

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        return res.json({ user, profile });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}