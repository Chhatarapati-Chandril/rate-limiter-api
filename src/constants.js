export const RATE_LIMIT = {
  FIXED_WINDOW: {
    LIMIT: 5,
    WINDOW: 60, // seconds
  },
  TOKEN_BUCKET: {
    CAPACITY: 10,
    REFILL_RATE: 1, // tokens per second
  },
  SLIDING_WINDOW_LOG: {
    LIMIT: 5,
    WINDOW: 60,
  },
  SLIDING_WINDOW_COUNTER: {
    LIMIT: 5,
    WINDOW: 60,
  },
};

export const REDIS_KEYS = {
  FIXED_WINDOW: "rate_limit:fixed_window",
  TOKEN_BUCKET: "rate_limit:token_bucket",
  SLIDING_WINDOW_COUNTER: "rate_limit:sliding_window_counter",
  SLIDING_WINDOW_LOG: "rate_limit:sliding_window_log",
};