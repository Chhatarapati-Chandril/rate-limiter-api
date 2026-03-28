import redis from "../config/redis.js";

const attemptFixedWindow = async (key, maxRequests, windowInSeconds) => {
    const requestCount = await redis.incr(key);

    // Not fully atomic: race condition possible between INCR and EXPIRE
    if (requestCount === 1) {
        await redis.expire(key, windowInSeconds);
    }

    let ttl = await redis.ttl(key);
    if (ttl === -1) {
        // key exists but no expiry - fix it
        await redis.expire(key, windowInSeconds);
        ttl = windowInSeconds;
    } else if (ttl === -2) {
        // rare race: key expired between INCR and TTL
        ttl = windowInSeconds;
    }

    const allowed = requestCount <= maxRequests;
    const remainingRequests = Math.max(0, maxRequests - requestCount);

    const retryAfter = allowed ? null : ttl;

    return {
        allowed,
        remainingRequests,
        limit: maxRequests,
        retryAfter,
        ttl,
    };
};

export default attemptFixedWindow;
