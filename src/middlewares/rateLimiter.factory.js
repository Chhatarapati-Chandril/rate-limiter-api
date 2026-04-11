import asyncHandler from "../utils/asyncHandler.js";
import hashClientId from "../utils/hash.js";

const createRateLimiter = (attemptFn, redisKeyPrefix) =>
    (limit, windowInSeconds) =>
        asyncHandler(async (req, res, next) => {
            const clientId = req.ip;
            const hashedClientId = hashClientId(clientId);

            const key = `${redisKeyPrefix}:${hashedClientId}`;

            let result;

            try {
                result = await attemptFn(key, limit, windowInSeconds);
            } catch (err) {
                console.error("[RATE_LIMITER_ERROR]", {
                    key,
                    clientId,
                    error: err.message,
                });

                return next(); // fail open
            }

            const resetTime =
                result.resetTimestamp ??
                Math.floor(Date.now() / 1000) + result.retryAfter;

            res.set("ratelimit-limit", result.limit);
            res.set("ratelimit-remaining", result.remainingRequests);
            res.set("ratelimit-reset", resetTime);

            if (!result.allowed) {
                console.warn("[RATE_LIMIT_EXCEEDED]", {
                    clientId,
                    key,
                    limit: result.limit,
                    remaining: result.remainingRequests,
                    retryAfter: result.retryAfter,
                    path: req.originalUrl,
                    method: req.method,
                });

                res.set("Retry-After", result.retryAfter ?? 0);

                return res.status(429).json({
                    error: "Too many requests",
                    retryAfter: result.retryAfter,
                });
            }

            // Optional debug log (disable in prod)
            console.log("[RATE_LIMIT_OK]", {
                clientId,
                remaining: result.remainingRequests,
            });

            next();
        });

export default createRateLimiter;