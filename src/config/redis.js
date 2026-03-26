import Redis from "ioredis";

let redis;

export function getRedis() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redis.on("error", (err) => {
      console.error("❌ Redis connection error:", err);
    });
  }

  return redis;
}
