import createRateLimiter from "./rateLimiter.factory.js";
import { REDIS_KEYS } from "../constants.js";

import attemptFixedWindow from "../services/fixedWindow.service.js";
import attemptSlidingWindowLog from "../services/slidingWindowLog.service.js";
import attemptSlidingWindowCounter from "../services/slidingWindowCounter.service.js";

export const fixedWindowLimiter = createRateLimiter(
    attemptFixedWindow,
    REDIS_KEYS.FIXED_WINDOW
);

export const slidingWindowLogLimiter = createRateLimiter(
    attemptSlidingWindowLog,
    REDIS_KEYS.SLIDING_WINDOW_LOG
);

export const slidingWindowCounterLimiter = createRateLimiter(
    attemptSlidingWindowCounter,
    REDIS_KEYS.SLIDING_WINDOW_COUNTER
);