/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

const publicKey = process.env.JWT_PUBLIC_KEY;
const privateKey = process.env.JWT_PRIVATE_KEY;

if (!publicKey || !privateKey) {
	throw new Error("Missing JWT keys");
}

fs.writeFileSync(path.join(__dirname, "../keys/vodka.key"), privateKey);
fs.writeFileSync(path.join(__dirname, "../keys/vodka.key.pub"), publicKey);
