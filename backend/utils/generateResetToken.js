import crypto from "crypto";

export const generateResetToken = () => {
    return crypto.randomBytes(32).toString("hex"); // Generates a 64-character token
};
