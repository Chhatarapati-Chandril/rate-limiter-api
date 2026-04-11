import crypto from "crypto";

const hashedClientId = (id) => {
    return crypto
        .createHash("sha256")
        .update(id)
        .digest("hex");
};

export default hashedClientId