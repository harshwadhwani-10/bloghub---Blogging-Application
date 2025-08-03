import jwt from 'jsonwebtoken';
import { handleError } from '../helpers/handleError.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    
    if (!token) {
        return next(handleError(401, 'You are not authenticated!'));
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(handleError(403, 'Token is not valid!'));
        }
        
        req.user = user;
        next();
    });
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return next(handleError(403, 'You are not authorized as admin!'));
        }
    });
}; 