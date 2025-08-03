import express from 'express'
import { getDashboardData, downloadReport } from '../controllers/Admin.controller.js'
import { onlyadmin } from '../middleware/onlyadmin.js'

const AdminRoute = express.Router()

// Apply admin middleware to all routes
AdminRoute.use(onlyadmin)

// Dashboard routes
AdminRoute.get('/dashboard', getDashboardData)
AdminRoute.get('/download-report/:type/:format', downloadReport)

export default AdminRoute 