import fs from "fs";

function ensureDir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}

export function saveToCSV(endpoint, mode, results) {
    const dir = "./testing/results";

    // ensure folder exists
    ensureDir(dir);

    const fileName = `${dir}/results_${endpoint}_${mode}.csv`;

    const header = "req,time,t_offset,status,latency,remaining\n";

    const rows = results
        .map(
            (r) =>
                `${r.req},${r.time},${r.t_offset},${r.status},${r.latency},${r.remaining}`
        )
        .join("\n");

    fs.writeFileSync(fileName, header + rows);

    console.log(`Saved CSV → ${fileName}`);
}