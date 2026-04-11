import redis from "../config/redis.js";

const attemptFixedWindow = async (baseKey, maxRequests, windowInSeconds) => {
    const now = Date.now();
    const windowSize = windowInSeconds * 1000;

    // 1. Calculate aligned window
    const windowNo = Math.floor(now / windowSize);

    // 2. Create window-specific key
    const key = `${baseKey}:${windowNo}`;

    // 3. Increment counter
    const requestCount = await redis.incr(key);

    // 4. aligned TTL
    if (requestCount === 1) {
        const windowEnd = (windowNo + 1) * windowSize;
        const ttl = Math.ceil((windowEnd - now) / 1000);
        await redis.expire(key, ttl);
    }

    // 5. Calculate reset time (aligned)
    const windowEnd = (windowNo + 1) * windowSize;
    const retryAfter = Math.ceil((windowEnd - now) / 1000);
    const resetTimestamp = Math.floor(windowEnd / 1000);

    return {
        allowed: requestCount <= maxRequests,
        remainingRequests: Math.max(0, maxRequests - requestCount),
        limit: maxRequests,
        retryAfter,
        resetTimestamp
    };
};

export default attemptFixedWindow;
