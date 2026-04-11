import redis from "../config/redis.js";
import { randomUUID } from "crypto";

const attemptSlidingWindowLog = async (
    baseKey,
    maxRequests,
    windowInSeconds,
) => {
    const key = baseKey;
    const now = Date.now();
    const windowSize = windowInSeconds * 1000;
    const windowStart = now - windowSize;

    // 1. Remove old request
    await redis.zremrangebyscore(key, 0, windowStart);

    // 2. Count current request
    const currentRequests = await redis.zcard(key);

    // 3. Check Limit
    if (currentRequests >= maxRequests) {
        // find oldest request
        const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");

        if (!oldest || oldest.length < 2) {
            const retryAfter = Math.ceil(windowSize / 1000);
            const resetTimestamp = Math.floor((now + windowSize) / 1000);

            return {
                allowed: false,
                remainingRequests: 0,
                limit: maxRequests,
                retryAfter,
                resetTimestamp,
            };
        }
        const oldestTimestamp = Number(oldest[1]);

        const retryAfter = Math.max(
            0,
            Math.ceil((oldestTimestamp + windowSize - now) / 1000),
        );

        const resetTimestamp = Math.floor(
            (oldestTimestamp + windowSize) / 1000,
        );

        return {
            allowed: false,
            remainingRequests: 0,
            limit: maxRequests,
            retryAfter,
            resetTimestamp,
        };
    }

    // 4. Add current request
    await redis.zadd(key, now, randomUUID());

    // 5. Set TTL
    if (currentRequests === 0) {
        await redis.pexpire(key, windowSize);
    }

    // 6. Compute resetTimestamp
    let resetTimestamp;

    if (currentRequests === 0) {
        resetTimestamp = Math.floor((now + windowSize) / 1000);
    } else {
        const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
        resetTimestamp = Math.floor((Number(oldest[1]) + windowSize) / 1000);
    }

    const newCount = currentRequests + 1;

    return {
        allowed: true,
        remainingRequests: Math.max(0, maxRequests - newCount),
        limit: maxRequests,
        retryAfter: 0,
        resetTimestamp,
    };
};

export default attemptSlidingWindowLog;
