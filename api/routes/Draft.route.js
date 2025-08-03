import express from 'express';
import { getDraft, saveDraft, deleteDraft } from '../controllers/Draft.controller.js';
import upload from '../config/multer.js';
import { authenticate } from '../middleware/authenticate.js';

const DraftRoute = express.Router();

// Apply authentication middleware to all routes
DraftRoute.use(authenticate);

// Get draft for the current user
DraftRoute.get('/', getDraft);

// Save or update a draft
DraftRoute.post('/', upload.single('file'), saveDraft);

// Delete a draft
DraftRoute.delete('/', deleteDraft);

export default DraftRoute; 