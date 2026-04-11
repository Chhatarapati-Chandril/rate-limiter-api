// sliding window counter

const window_size = 1000;    // 1 sec (1000 ms) window
const limit = 5;

let store = {}
let arr = [0, 10, 20, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80];
let ips = ["ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1"];

const start = Date.now()

for (let i = 0; i < arr.length; i++) {
    setTimeout(() => {
        isAllowed_slidingWindowCounter(ips[i], Date.now() - start);
    }, i* 150);
}

function isAllowed_slidingWindowCounter(ip, timestamps) {

    let curr_block = Math.floor(timestamps / window_size);

    // initialize if first time
    if(!store[ip]) {
        store[ip] = {
            last_ip_block: curr_block,
            curr_count: 0,
            prev_count: 0
        }
    }

    let data = store[ip];

    if (data.block === curr_block) {
        // same window
    } 
    else if (data.block + 1 === curr_block) {
        data.prev_count = data.curr_count;
        data.curr_count = 0;
        data.block = curr_block;
    } 
    else {
        data.prev_count = 0;
        data.curr_count = 0;
        data.block = curr_block;
    }

    let time_into_window = timestamps % window_size;
    let weight = (window_size - time_into_window) / window_size;
    let effective_count = data.curr_count + data.prev_count * weight;

    if(effective_count < limit) {
        data.curr_count++;
        console.log(
            ip,
            "- time:", timestamps,
            "- curr:", data.curr_count,
            "- prev:", data.prev_count,
            "- effective:", effective_count.toFixed(2),
            "- window no:", curr_block,
            "-> allowed (200)"
        );
        return true;
    }
    else {
            console.log(
            ip,
            "- time:", timestamps,
            "- curr:", data.curr_count,
            "- prev:", data.prev_count,
            "- effective:", effective_count.toFixed(2),
            "- window no:", curr_block,
            "-> not allowed (429)"
        );
        return false;
    }
    
}
