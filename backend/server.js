import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import postRoutes from "./routes/posts.routes.js"; 
import userRoutes from "./routes/user.routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());

app.use(express.json());
app.use(postRoutes);
app.use(userRoutes);
app.use('/uploads', express.static('uploads'));

const start = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('Missing MONGO_URI in .env. Add your MongoDB connection string before starting the backend.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);

        console.log("MongoDB Connected");

        const port = Number(process.env.PORT) || 5000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1);
    }
};
start();