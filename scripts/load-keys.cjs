/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");

const publicKey = process.env.JWT_PUBLIC_KEY;
const privateKey = process.env.JWT_PRIVATE_KEY;

if (!publicKey || !privateKey) {
	throw new Error("Missing JWT keys");
}

fs.writeFileSync("./keys/vodka.key.pub", publicKey);
fs.writeFileSync("./keys/vodka.key", privateKey);
