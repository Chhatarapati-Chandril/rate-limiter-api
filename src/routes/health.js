import { Router } from "express";
import redis from "../config/redis.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const start = Date.now();

        try {
            await redis.set("health_check", "ok", "EX", 5);
            await redis.get("health_check");

            const responseTime = Date.now() - start;

            res.status(200).json({
                status: "ok",
                redis: "connected",
                responseTime: `${responseTime}ms`,
                uptime: `${Math.floor(process.uptime())}s`,
                pid: process.pid,
                memory: process.memoryUsage().rss,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                redis: "down",
                error: err.message,
                timestamp: new Date().toISOString(),
            });
        }
    }),
);

export default router;
