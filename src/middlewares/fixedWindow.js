import { REDIS_KEYS } from "../constants.js";
import attemptFixedWindow from "../services/fixedWindow.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import hashClientId from "../utils/hash.js";

const fixedWindowLimiter = (limit, windowInSeconds) =>
    asyncHandler(async (req, res, next) => {
        const clientId = req.ip;
        const hashedId = hashClientId(clientId);

        const key = `${REDIS_KEYS.FIXED_WINDOW}:${hashedId}`;

        let result;

        try {
            result = await attemptFixedWindow(key, limit, windowInSeconds);
        } catch (err) {
            console.error("Rate limiter error:", err.message);

            // Fail open (important)
            return next();
        }

        const resetTime = Math.floor(Date.now() / 1000) + result.ttl;

        res.set("RateLimit-Limit", result.limit);
        res.set("RateLimit-Remaining", result.remainingRequests);
        res.set("RateLimit-Reset", resetTime);

        if (!result.allowed) {
            console.warn(`Rate limit exceeded for ${clientId}`);
            
            res.set("Retry-After", result.retryAfter ?? 0);

            return res.status(429).json({
                error: "Too many requests",
                retryAfter: result.retryAfter,
            });
        }

        next();
    });

export default fixedWindowLimiter;
