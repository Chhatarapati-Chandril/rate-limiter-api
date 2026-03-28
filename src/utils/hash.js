import crypto from "crypto";

const hashClientId = (id) => {
    return crypto
        .createHash("sha256")
        .update(id)
        .digest("hex");
};

export default hashClientId