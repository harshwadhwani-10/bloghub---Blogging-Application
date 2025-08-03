import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
dotenv.config()

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_APP_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test the connection
console.log('Testing Cloudinary connection...');
console.log('Cloud name:', process.env.CLOUDINARY_APP_NAME);
console.log('API key:', process.env.CLOUDINARY_API_KEY);
console.log('API secret:', process.env.CLOUDINARY_API_SECRET ? '***' : 'Not set');

cloudinary.api.ping().then(() => {
    console.log('Cloudinary connection successful');
}).catch(err => {
    console.error('Cloudinary connection failed:', err);
}); 