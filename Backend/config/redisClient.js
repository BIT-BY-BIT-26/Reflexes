const Redis = require("ioredis");
const dotenv= require('dotenv');
dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  // password: process.env.REDIS_PASSWORD, // agar set kiya ho
});

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));


async function testRedis(){
    await redisClient.set("name","nishu");
    const value = await redisClient.get("name");
    console.log(value);
}
testRedis();
module.exports = {redisClient, testRedis};