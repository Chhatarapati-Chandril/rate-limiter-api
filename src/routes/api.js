import { Router } from "express";
import { fixedWindowLimiter, slidingWindowCounterLimiter, slidingWindowLogLimiter } from "../middlewares/rateLimiters.js";
import { RATE_LIMIT } from "../constants.js";
import testLimiter from "../controllers/api.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get(
    "/fixed-window",
    fixedWindowLimiter(
        RATE_LIMIT.FIXED_WINDOW.LIMIT,
        RATE_LIMIT.FIXED_WINDOW.WINDOW
    ),
    asyncHandler(testLimiter("Fixed Window"))
);

router.get(
    "/sliding-window-log",
    slidingWindowLogLimiter(
        RATE_LIMIT.SLIDING_WINDOW_LOG.LIMIT,
        RATE_LIMIT.SLIDING_WINDOW_LOG.WINDOW
    ),
    asyncHandler(testLimiter("Sliding Window Log"))
);

router.get(
    "/sliding-window-counter",
    slidingWindowCounterLimiter(
        RATE_LIMIT.SLIDING_WINDOW_COUNTER.LIMIT,
        RATE_LIMIT.SLIDING_WINDOW_COUNTER.WINDOW
    ),
    asyncHandler(testLimiter("Sliding Window Counter"))
);


export default router;