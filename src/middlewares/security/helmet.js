import helmet from "helmet";

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,

  crossOriginResourcePolicy: { policy: "same-site" },

  referrerPolicy: { policy: "no-referrer" },
});

export default helmetMiddleware