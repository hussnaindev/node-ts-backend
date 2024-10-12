import { NextFunction } from 'express';

// Middleware to handle errors
export function errorHandler(err: any, req: any, res: any, next: NextFunction) {
        if (err) {
                return res
                        .status(err.statusCode || 500)
                        .json({ message: err.message || 'An unexpected error occurred' });
        }
        next();
}
