import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

function fileFilter(req, file, cb) {
    const allowedFiles = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    if (!allowedFiles.includes(file.mimetype)) {
        cb(new Error('Only images are allowed.'), false)
    } else {
        cb(null, true)
    }
}

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

export default upload