import express from "express";
import helmetMiddleware from "./middlewares/security/helmet.js";
import apiRoutes from "./routes/api.js";
import fixedWindowLimiter from "./middlewares/fixedWindow.js";
import { RATE_LIMIT } from "./constants.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(helmetMiddleware);

// Apply limiter globally
app.use(
    "/api/v1/fixed-window", 
    fixedWindowLimiter(
        RATE_LIMIT.FIXED_WINDOW.LIMIT,
        RATE_LIMIT.FIXED_WINDOW.WINDOW
    ), 
    apiRoutes);

export default app;