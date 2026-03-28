import { Router } from "express";
import redis from "../config/redis.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get(
    "/health",
    asyncHandler(async (req, res) => {
        const start = Date.now();

        try {
            await redis.ping();

            const responseTime = Date.now() - start;

            res.status(200).json({
                status: "ok",
                redis: "connected",
                responseTime: `${responseTime}ms`,
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            res.status(500).json({
                status: "degraded",
                redis: "down",
                error: err.message,
                timestamp: new Date().toISOString(),
            });
        }
    }),
);

export default router;
