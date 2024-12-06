import { rateLimit, Options as RateLimitOptions } from 'express-rate-limit';

export const APIRateLimiter = (customOptions?: Partial<RateLimitOptions>) => {
    // Initialize the default options
    const defaultOptions: Partial<RateLimitOptions> = {
        windowMs: 5 * 60 * 1000, // 5 minutes
        limit: 1000, // Limit each IP to 1000 requests per window
        standardHeaders: 'draft-7', // Combined `RateLimit` header
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
        keyGenerator: (req) => req.path
    };

    return rateLimit({ ...defaultOptions, ...customOptions })
}
