import fs from "fs";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ENDPOINTS, MODES_LIST } from "./constants.js";

const width = 900;
const height = 450;

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// ✅ helper
function ensureDir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}


function parseCSV(filePath) {
    const data = fs.readFileSync(filePath, "utf-8").trim().split("\n");

    const rows = data
        .slice(1)
        .map((line) => {
            if (!line.trim()) return null;

            const [req, time, t_offset, status, latency, remaining] =
                line.split(",");

            return {
                req: Number(req),
                t_offset: parseInt(t_offset),
                status: Number(status),
                latency: Number(latency),
                remaining: Number(remaining),
            };
        })
        .filter(Boolean);

    return rows;
}

// ✅ graph generator
async function createGraph(filePath, outputName) {
    const data = parseCSV(filePath);

    // ⚠️ important for burst correctness
    data.sort((a, b) => a.t_offset - b.t_offset);

    const labels = data.map((d) => d.t_offset);
    const status = data.map((d) => (d.status === 200 ? 1 : 0));
    const remaining = data.map((d) => d.remaining);
    const latency = data.map((d) => d.latency);

    const configuration = {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Allowed (1/0)",
                    data: status,
                    yAxisID: "y1",
                    borderWidth: 2,
                },
                {
                    label: "Remaining Requests",
                    data: remaining,
                    yAxisID: "y2",
                    borderWidth: 2,
                },
                {
                    label: "Latency (ms)",
                    data: latency,
                    yAxisID: "y2",
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time Offset (ms)",
                    },
                },
                y1: {
                    type: "linear",
                    position: "left",
                    title: {
                        display: true,
                        text: "Allowed (0/1)",
                    },
                },
                y2: {
                    type: "linear",
                    position: "right",
                    title: {
                        display: true,
                        text: "Remaining / Latency",
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        },
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);

    const dir = "./testing/graphs";
    ensureDir(dir);

    fs.writeFileSync(`${dir}/${outputName}.png`, image);

    console.log(`Graph saved → ${dir}/${outputName}.png`);
}

// ✅ main runner
async function main() {
    const endpoints = Object.values(ENDPOINTS);

    for (const ep of endpoints) {
        for (const mode of MODES_LIST) {
            const filePath = `./testing/results/results_${ep}_${mode}.csv`;
            const outputName = `${ep}_${mode}`;

            try {
                await createGraph(filePath, outputName);
            } catch (err) {
                console.warn(`Skipping ${filePath} (not found)`);
            }
        }
    }
}

main();
