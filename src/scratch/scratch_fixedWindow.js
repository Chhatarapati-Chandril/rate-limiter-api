// fixed window

const window_size = 1000;    // 1 sec (1000 ms) window
const limit = 5;

let store = {}
let arr = [0, 10, 20, 30, 35, 40, 45, 50, 60];
let ips = ["ip2", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1", "ip1"];

// for (let i = 0; i < arr.length; i++) {
//     isAllowed_fixedWindow(ips[i], arr[i])
// }

const start = Date.now()

for (let i = 0; i < arr.length; i++) {
    setTimeout(() => {
        isAllowed_fixedWindow(ips[i], Date.now() - start);
    }, i* 140);
}

function isAllowed_fixedWindow(ip, timestamps) {

    let curr_block = Math.floor(timestamps / window_size);

    // initialize if first time
    if(!store[ip]) {
        store[ip] = {
            prev_block: curr_block,
            curr_count: 0
        }
    }
    // reset window if changed
    if(store[ip].prev_block !== curr_block) {
        store[ip].prev_block = curr_block
        store[ip].curr_count = 0
    }

    // increment
    store[ip].curr_count++;

    if(store[ip].curr_count <= limit) {
        console.log(ip, " - time : ", timestamps, 'ms - window_no. : ', curr_block , ' - curr_count : ', store[ip].curr_count , ' -> allowed (200)');   
        return true;
    }
    else {
        console.log(ip, " - time : ", timestamps, 'ms - window_no. : ', curr_block , ' - curr_count : ', store[ip].curr_count , ' -> not allowed (429)');
        return false;
    }
    
}
