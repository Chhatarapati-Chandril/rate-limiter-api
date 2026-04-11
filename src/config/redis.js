import Redis from "ioredis";

console.log("🔄 [Redis] Initializing client...");

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        console.log(`🔁 [Redis] Retry attempt #${times}`);
        return Math.min(times * 100, 2000); // backoff
    },
    enableReadyCheck: true,
    lazyConnect: false, // connect immediately
});

// --- Connection lifecycle logs ---

redis.on("connect", () => {
    console.log("🔌 [Redis] TCP connection established");
});

redis.on("ready", () => {
    console.log("✅ [Redis] Ready to accept commands");
});

redis.on("error", (err) => {
    console.error("❌ [Redis] Error:", err.message);
});

redis.on("close", () => {
    console.warn("⚠️ [Redis] Connection closed");
});

redis.on("reconnecting", (time) => {
    console.log(`🔄 [Redis] Reconnecting in ${time}ms`);
});

redis.on("end", () => {
    console.error("🛑 [Redis] Connection ended permanently");
});

// --- Debug checkpoint: manual ping on startup ---

const checkRedisConnection = async () => {
    try {
        console.log("📡 [Redis] Sending PING...");
        const res = await redis.ping();
        console.log(`📡 [Redis] PING response: ${res}`);
    } catch (err) {
        console.error("❌ [Redis] PING failed:", err.message);
    }
};

checkRedisConnection();

export default redis;
