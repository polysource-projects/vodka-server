const fs = require('fs');

const publicKey = process.env.JWT_PUBLIC_KEY;
const privateKey = process.env.JWT_PRIVATE_KEY;

if (!publicKey || !privateKey) {
	throw new Error('Missing JWT keys');
}

fs.writeFileSync('./keys/public.key.pub', publicKey);
fs.writeFileSync('./keys/private.key', privateKey);
