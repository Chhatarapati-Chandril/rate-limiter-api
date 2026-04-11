import "dotenv/config";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api/v1";

export const MODES = {
    GRADUAL: "GRADUAL",
    BURST: "BURST",
    RANDOM: "RANDOM"
}

export const MODES_LIST = Object.values(MODES);

export const ENDPOINTS = {
    FIXED: "fixed-window",
    LOG: "sliding-window-log",
    COUNTER: "sliding-window-counter",
};

export const TEST_CONFIG = {
    TOTAL_REQUESTS: 20,
    DELAY_BETWEEN_REQUESTS: 200, // ms
};
