import mongoose from "mongoose";

const banSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: { 
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bannedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Ban = mongoose.model('Ban', banSchema, 'bans');
export default Ban; 