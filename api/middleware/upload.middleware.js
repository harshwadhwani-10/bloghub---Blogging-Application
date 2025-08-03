import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer to use memory storage (no local disk storage)
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Only image files are allowed!'), false);
  } else {
    cb(null, true);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image'); // Make sure your frontend uses field name "image"

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'blog_images' }, // Optional: change folder name
      function (error, result) {
        if (error) {
          return res.status(500).json({ error: 'Cloudinary upload failed' });
        }
        req.imageUrl = result.secure_url;
        next();
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

export default uploadMiddleware;
