import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
dotenv.config()

// Only Cloudinary config, no local file logic.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test the connection
cloudinary.api.ping().then(() => {
    console.log('Cloudinary connection successful');
}).catch(err => {
    console.error('Cloudinary connection failed:', err);
});

export default cloudinary