import { handleError } from "../helpers/handleError.js"
import User from "../models/user.model.js"
import Ban from "../models/ban.model.js"
import ResetToken from "../models/resetToken.model.js"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export const Register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body
        const checkuser = await User.findOne({ email })
        if (checkuser) {
            // user already registered 
            next(handleError(409, 'User already registered.'))
        }

        const hashedPassword = bcryptjs.hashSync(password)
        // register user  
        const user = new User({
            name, email, password: hashedPassword
        })

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Registration successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // First check if user is banned
        const bannedUser = await Ban.findOne({ email });
        if (bannedUser) {
            return next(handleError(403, 'You are banned by the Admin. Please contact 202412100@daiict.ac.in for more details.'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(handleError(404, 'User not found!'));
        }

        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return next(handleError(401, 'Wrong password!'));
        }

        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        }, process.env.JWT_SECRET);

        res
            .cookie('access_token', token, { 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                path: '/'
            })
            .status(200)
            .json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            });
    } catch (error) {
        next(handleError(500, error.message));
    }
}

export const GoogleLogin = async (req, res, next) => {
    try {
        const { name, email, avatar } = req.body
        let user
        user = await User.findOne({ email })
        if (!user) {
            //  create new user 
            const password = Math.random().toString()
            const hashedPassword = bcryptjs.hashSync(password)
            const newUser = new User({
                name, email, password: hashedPassword, avatar
            })

            user = await newUser.save()

        }


        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        }, process.env.JWT_SECRET)


        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        })

        const newUser = user.toObject({ getters: true })
        delete newUser.password
        res.status(200).json({
            success: true,
            user: newUser,
            message: 'Login successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const Logout = async (req, res, next) => {
    try {

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        })

        res.status(200).json({
            success: true,
            message: 'Logout successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}

// Send reset code
export const sendResetCode = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return next(handleError(404, 'User not found'));
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Create reset token
        const resetToken = new ResetToken({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        });
        await resetToken.save();

        // Configure email transporter with more options
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify email configuration
        try {
            await transporter.verify();
            console.log('Email server is ready to send messages');
        } catch (error) {
            console.error('Email configuration error:', error);
            return next(handleError(500, 'Email service configuration error. Please check your email settings.'));
        }

        const mailOptions = {
            from: `"Blog Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${otp}. This code will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
                    <p>Hello ${user.name},</p>
                    <p>We received a request to reset your password. Your reset code is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <strong style="font-size: 24px; letter-spacing: 5px;">${otp}</strong>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            res.status(200).json({
                success: true,
                message: 'Reset code sent to your email'
            });
        } catch (error) {
            console.error('Email sending error:', error);
            return next(handleError(500, 'Failed to send reset code email. Please try again later.'));
        }
    } catch (error) {
        console.error('Reset code error:', error);
        next(handleError(500, error.message));
    }
};

// Verify reset code
export const verifyResetCode = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Find valid reset token
        const resetToken = await ResetToken.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return next(handleError(400, 'Invalid or expired reset code'));
        }

        res.status(200).json({
            success: true,
            message: 'Reset code verified'
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify reset token
        const resetToken = await ResetToken.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return next(handleError(400, 'Invalid or expired reset code'));
        }

        // Update password
        const hashedPassword = bcryptjs.hashSync(newPassword);
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );

        // Delete used reset token
        await ResetToken.deleteOne({ _id: resetToken._id });

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};
