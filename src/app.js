import express from "express";
import helmetMiddleware from "./middlewares/security/helmet.js";
import apiRoutes from "./routes/api.js";
import healthRoutes from "./routes/health.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(helmetMiddleware);

app.use("/health", healthRoutes);

app.use("/api/v1", apiRoutes);

export default app;