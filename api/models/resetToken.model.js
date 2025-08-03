import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    }
}, { timestamps: true });

// Index for faster queries and automatic cleanup
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ResetToken = mongoose.model('ResetToken', resetTokenSchema, 'resetTokens');
export default ResetToken; 