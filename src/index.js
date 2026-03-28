import app from "./app.js";
import redis from "./config/redis.js";

const port = process.env.PORT || 3000;

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

const startServer = async () => {
    try {
        // check redis connection
        await redis.ping()

        console.log("✅ Redis connected");

        app.listen(port, () => {
            console.log(`⚙️ Server running at http://localhost:${port}`);
        });
        
    } catch (error) {
        console.error("❌ Failed to connect to Redis:", error.message);
        process.exit(1);
    }
}

startServer()