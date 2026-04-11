import { hitWithMetrics, sleep } from "./utils.js";
import { ENDPOINTS, MODES, TEST_CONFIG } from "./constants.js";
import { saveToCSV } from "./reporter.js";

function printSummary(endpoint, mode, results) {
    let success = 0;
    let blocked = 0;
    let totalLatency = 0;
    let maxLatency = 0;

    results.forEach((r) => {
        totalLatency += r.latency;
        maxLatency = Math.max(maxLatency, r.latency);

        if (r.status === 200) success++;
        else if (r.status === 429) blocked++;
    });

    console.log(`\n--- SUMMARY (${mode}) ---`);
    console.log("Endpoint:", endpoint);
    console.log("Total Requests:", results.length);
    console.log("Success:", success);
    console.log("Blocked:", blocked);
    console.log(
        "Avg Latency:",
        (totalLatency / results.length).toFixed(2),
        "ms"
    );
    console.log("Max Latency:", maxLatency, "ms");
}

async function gradualTraffic(endpoint) {
    console.log(`\n=== ${endpoint} | GRADUAL ===`);

    const startTime = Date.now();

    const results = [];

    for (let i = 1; i <= TEST_CONFIG.TOTAL_REQUESTS; i++) {
        const now = Date.now();
        
        const res = await hitWithMetrics(endpoint);

        results.push({
            req: i,
            time: new Date(now).toISOString().split("T")[1].split(".")[0], // HH:MM:SS
            t_offset: `${(now - startTime)}ms`,
            status: res.status,
            latency: res.latency,
            remaining: res.remaining,
        });

        await sleep(2000); // slow traffic
    }

    console.table(results);
    printSummary(endpoint, MODES.GRADUAL, results);
    saveToCSV(endpoint, MODES.GRADUAL, results);
}

async function burstTraffic(endpoint) {
    console.log(`\n=== ${endpoint} | BURST ===`);

    const startTime = Date.now();

    const promises = [];

    for (let i = 1; i <= TEST_CONFIG.TOTAL_REQUESTS; i++) {
        promises.push(
            (async () => {
                const now = Date.now();
                const res = await hitWithMetrics(endpoint);

                return {
                    req: i, // ✅ include here directly
                    time: new Date(now).toLocaleTimeString(),
                    t_offset: `${now - startTime}ms`,
                    status: res.status,
                    latency: res.latency,
                    remaining: res.remaining,
                };
            })()
        );
    }

    const results = await Promise.all(promises);

    console.table(results);
    printSummary(endpoint, MODES.BURST, results);
    saveToCSV(endpoint, MODES.BURST, results);

}

async function randomTraffic(endpoint) {
    console.log(`\n=== ${endpoint} | RANDOM ===`);

    const startTime = Date.now();

    const results = [];

    for (let i = 1; i <= TEST_CONFIG.TOTAL_REQUESTS; i++) {
        const res = await hitWithMetrics(endpoint);

        const now = Date.now();

        results.push({
            req: i,
            time: new Date(now).toISOString().split("T")[1].split(".")[0], // HH:MM:SS
            t_offset: `${(now - startTime)}ms`,
            status: res.status,
            latency: res.latency,
            remaining: res.remaining,
        });

        const randomDelay = Math.floor(Math.random() * 2000);
        await sleep(randomDelay);
    }

    console.table(results);
    printSummary(endpoint, MODES.RANDOM, results);
    saveToCSV(endpoint, MODES.RANDOM, results);
}

async function runAllModes(endpoint) {
    console.log("Resetting before GRADUAL...");
    await sleep(60000);

    await gradualTraffic(endpoint);

    console.log("Resetting before BURST...");
    await sleep(60000);

    await burstTraffic(endpoint);

    console.log("Resetting before RANDOM...");
    await sleep(60000);

    await randomTraffic(endpoint);
}

async function main() {
    for (const endpoint of Object.values(ENDPOINTS)) {
        await runAllModes(endpoint);

        console.log("\n\n============================\n\n");

        // reset between algorithms
        console.log("Resetting window...\n");
        await sleep(60000); // let windows expire
    }
}

main();