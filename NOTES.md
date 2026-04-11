# Rate Limiter


## 1. Problem Understanding

* What exactly is being limited?
  → Client requests (identified by IP for now)

* What defines a “request”?
  → Any HTTP API call (GET/POST/etc.)

* What is the time window?
  → Fixed window and sliding window (both implemented for learning)

* What is the limit?
  → 5 requests per minute (for testing)

* What should happen when limit is exceeded?
  → Block request with HTTP 429

---

## 2. Identification Strategy

* How do I uniquely identify a client?
  → IP address (no authentication system yet)

* Can this be spoofed?
  → Yes (proxies, VPNs)

* Do I need hashing?
  → Optional (for privacy/consistent key format, not required for logic)

---

## 3. Data Storage Design

* Where do I store request data?
  → Redis (fast, in-memory, supports atomic operations, works across servers)

---

### Fixed Window

* Data structure:
  → Key-value (counter)

* Structure:
  key = ip + window_start
  value = request count

* Operations:

  * Increment count → INCR
  * Set expiry → EXPIRE

---

### Sliding Window

* Data structure:
  → Redis Sorted Set

* Structure:
  key = ip
  score = timestamp
  value = timestamp

* Operations:

  * Insert → ZADD
  * Remove old → ZREMRANGEBYSCORE
  * Count → ZCARD

---

## 4. Time Handling

* Current time:
  → Date.now()

* Within window condition:
  → timestamp >= (now - window_size)

* Removing expired requests:
  → delete timestamps < (now - window_size)

* Boundary condition:
  → timestamp == (now - window) is considered valid

---

## 5. Algorithm Choice

* Fixed Window
  → Simple, fast (O(1)), but inaccurate at boundaries

* Sliding Window
  → Accurate, smoother control, slightly slower (O(log n))

* Strategy:
  → Implement both for learning and comparison

---

## 6. Flow of Execution

request comes →
identify client →
fetch current state from Redis →
remove expired data (if needed) →
check current count →
if limit exceeded → block (429)
else → update state and allow

---

## 7. Edge Cases

* First request ever
  → No key exists → allow and initialize

* Burst traffic
  → Fixed window allows bursts at boundary
  → Sliding window handles smoothly

* Multiple servers
  → Use Redis (shared state)

* Redis failure
  → Fail-open (allow requests, log error)

* Time drift
  → Minor issue, depends on server clock sync

* Same millisecond requests
  → Redis handles ordering, Lua scripts ensure atomicity if needed

---

## 8. Performance

* Time complexity:
  → Fixed window: O(1)
  → Sliding window: O(log n)

* Memory growth:
  → Fixed: minimal
  → Sliding: grows with requests (needs cleanup)

* Cleanup strategy:
  → Remove expired entries on each request (lazy cleanup)
  → OR use TTL

---

## 9. Scalability

* 1 user vs 1M users
  → Keys grow linearly (Redis handles if sized properly)

* Multiple servers
  → Redis enables shared rate limiting

* Redis scaling
  → Single instance for small scale
  → Redis cluster for large scale

---

## 10. API / Middleware Design

* Logic placement:
  → Middleware = entry point
  → Service layer = core logic

* Express integration:
  → app.use(limiterMiddleware)

* Middleware behavior:
  → if allowed → next()
  → else → res.status(429)

---

## 11. Observability

* Logs:
  → IP, request count, blocked requests, Redis errors

* Monitoring:
  → Rate of 429 responses
  → Request patterns

---

## 12. Failure Strategy

* Redis down:
  → Fail-open (allow all requests, log issue)

* Reason:
  → Better user experience, avoids total system blockage

---

# Final Goal

Be able to design and explain a rate limiter clearly (without code),
including tradeoffs, data structures, and system behavior.
