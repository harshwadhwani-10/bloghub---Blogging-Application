import express from 'express'
import { GoogleLogin, Login, Logout, Register, sendResetCode, verifyResetCode, resetPassword } from '../controllers/Auth.controller.js'
import { authenticate } from '../middleware/authenticate.js'

const AuthRoute = express.Router()

AuthRoute.post('/register', Register)
AuthRoute.post('/login', Login)
AuthRoute.post('/google-login', GoogleLogin)
AuthRoute.get('/logout', authenticate, Logout)

// Forgot password routes
AuthRoute.post('/send-reset-code', sendResetCode)
AuthRoute.post('/verify-reset-code', verifyResetCode)
AuthRoute.post('/reset-password', resetPassword)

export default AuthRoute