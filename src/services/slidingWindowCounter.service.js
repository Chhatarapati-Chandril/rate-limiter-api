import redis from "../config/redis.js";

const attemptSlidingWindowCounter = async (
    key,
    maxRequests,
    windowInSeconds,
) => {
    const now = Date.now();
    const windowSize = windowInSeconds * 1000;

    // 1. Align current window
    const currentWindowStart = Math.floor(now / windowSize) * windowSize;

    // 2. Fetch existing state using pipeline
    const pipeline = redis.pipeline();

    pipeline.hget(key, "currentRequests");
    pipeline.hget(key, "previousRequests");
    pipeline.hget(key, "lastWindowStart");

    const [[, currentRaw], [, previousRaw], [, lastWindowStartRaw]] =
        await pipeline.exec();

    // 3. Parse values
    let currentRequests = parseInt(currentRaw) || 0;
    let previousRequests = parseInt(previousRaw) || 0;
    let lastWindowStart = parseInt(lastWindowStartRaw) || currentWindowStart;

    // 4. Handle window shift
    const windowsPassed = Math.floor(
        (currentWindowStart - lastWindowStart) / windowSize,
    );

    if (windowsPassed === 1) {
        previousRequests = currentRequests;
        currentRequests = 0;
    } else if (windowsPassed > 1) {
        previousRequests = 0;
        currentRequests = 0;
    }

    lastWindowStart = currentWindowStart;

    // 5. Compute weight
    const elapsed = now - currentWindowStart;
    const weight = 1 - elapsed / windowSize;

    // 6. Effective requests
    const effectiveRequests = previousRequests * weight + currentRequests;

    let allowed = false;
    let newEffectiveRequests = effectiveRequests;

    // 7. Check limit
    if (effectiveRequests < maxRequests) {
        allowed = true;
        currentRequests += 1;
        newEffectiveRequests = effectiveRequests + 1;

        // 8. Persist updated state
        await redis.hset(key, {
            currentRequests,
            previousRequests,
            lastWindowStart,
        });

        if (currentRequests === 1) {
            await redis.expire(key, windowInSeconds * 2);
        }
    }

    // 10. Remaining requests
    const remainingRequests = Math.max(
        0,
        Math.floor(maxRequests - newEffectiveRequests),
    );

    // 11. Retry after (approx)
    let retryAfter;

    if (allowed) {
        retryAfter = 0;
    } else if (previousRequests === 0) {
        retryAfter = Math.ceil((windowSize - elapsed) / 1000);
    } else {
        retryAfter = Math.ceil(
            (windowSize * (effectiveRequests - maxRequests + 1)) /
            previousRequests /
            1000
        );
    }
    const resetTimestamp = Math.floor((now + retryAfter * 1000) / 1000);

    return {
        allowed,
        remainingRequests,
        limit: maxRequests,
        retryAfter,
        resetTimestamp
    };
};

export default attemptSlidingWindowCounter;
