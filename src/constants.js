export const RATE_LIMIT = {
  FIXED_WINDOW: {
    LIMIT: 5,
    WINDOW: 60, // seconds
  },
  TOKEN_BUCKET: {
    CAPACITY: 10,
    REFILL_RATE: 1, // tokens per second
  },
  SLIDING_WINDOW: {
    LIMIT: 100,
    WINDOW: 60,
  },
};

export const REDIS_KEYS = {
  FIXED_WINDOW: "rate_limit:fixed_window",
  TOKEN_BUCKET: "rate_limit:token_bucket",
  SLIDING_WINDOW: "rate_limit:sliding_window",
};