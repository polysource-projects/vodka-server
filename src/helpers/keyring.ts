import path from "path";
import { readFileSync } from "fs";

import jwt from "jsonwebtoken";
import { Redis } from "./redis";

const privateKey = readFileSync(
	path.join(__dirname, "../../keys/vodka.key"),
	"utf-8",
);
const publicKey = readFileSync(
	path.join(__dirname, "../../keys/vodka.key.pub"),
	"utf-8",
);

export class Keyring {
	//! JWT Things

	private static signJWT(data: object) {
		return jwt.sign(data, privateKey, { algorithm: "RS256" });
	}

	private static readJWT(token: string) {
		try {
			return jwt.verify(token, publicKey);
		} catch {
			return null;
		}
	}

	static async createSession(email: string) {
		const token = this.signJWT({
			sub: email,
			type: "session",
		});

		await Redis.saveSession(token);

		return token;
	}
}
