import { BASE_URL } from "./constants.js";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const hitWithMetrics = async (endpoint) => {
    const start = Date.now();

    const res = await fetch(`${BASE_URL}/${endpoint}`);

    const latency = Date.now() - start;

    return {
        status: res.status,
        latency,
        remaining: res.headers.get("ratelimit-remaining"),
        retry: res.headers.get("retry-after"),
        reset: res.headers.get("ratelimit-reset"),
    };
};