const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = new Redis(
  process.env.REDIS_URL
  // Development: redis://127.0.0.1:6379
);

redisClient.on("connect", () => console.log("✅ Redis connected"));

redisClient.on("error", (err) => console.error("❌ Redis error:", err));

module.exports = { redisClient };
