// sliding window log

const window_size = 1000; // 1 sec (1000 ms) window
const limit = 5;

let store = {};
let arr = [0, 10, 20, 30, 35, 40, 45, 50, 60];
let ips = ["ip2", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1"];

const start = Date.now();

for (let i = 0; i < arr.length; i++) {
    setTimeout(() => {
        isAllowed_slidingWindowLog(ips[i], Date.now() - start);
    }, i * 140);
}

function isAllowed_slidingWindowLog(ip, timestamps) {
    // initialize if first time
    if (!store[ip]) {
        store[ip] = [];
    }

    let window_start = timestamps - window_size;

    // remove old timestamps
    store[ip] = store[ip].filter((t) => t > window_start);

    if (store[ip].length < limit) {
        store[ip].push(timestamps);
        console.log(
            ip,
            "time:",
            timestamps,
            "count:",
            store[ip].length,
            " -> allowed (200)",
        );
        return true;
    } else {
        console.log(
            ip,
            "time:",
            timestamps,
            "count:",
            store[ip].length,
            " -> not allowed (429)",
        );
        return false;
    }
}
