import path from "path";
import crypto from "crypto";
import { readFileSync } from "fs";

import jwt from "jsonwebtoken";
import { Redis } from "./redis";
import { User } from "../interfaces";

export const privateKey = readFileSync(
	path.join(__dirname, "../../keys/vodka.key"),
	"utf-8"
);
export const publicKey = readFileSync(
	path.join(__dirname, "../../keys/vodka.key.pub"),
	"utf-8"
);

interface SessionTokenPayload {
	iat: number;
	exp: number;
	sub: string;
	type: "session";
}

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
			exp: "7d",
		});

		await Redis.saveSession(token);

		return token;
	}

	static decodeSession(token: string) {
		const data = this.readJWT(token);
		if (
			!data ||
			typeof data !== "object" ||
			!("type" in data) ||
			data.type !== "session"
		) {
			return null;
		}

		const payload = data as SessionTokenPayload;
		return payload;
	}

	// Here, a paperplane is the piece of data that's sent over to the 3rd-party website
	static signPaperplane(user: User, domain: string) {
		const token = this.signJWT({
			sub: user.email,
			target: domain,
			user,
		});
		return token;
	}

	/**
	 * @returns a 6-digit verification code
	 */
	static generateVerificationCode() {
		return new Promise<string>((resolve, reject) => {
			crypto.randomInt(1, 1_000_000, (err, n) => {
				if (err) {
					reject(err);
				} else {
					resolve(n.toString().padStart(6, "0"));
				}
			});
		});
	}

	static generateQuestionId = () => crypto.randomUUID();

	static hash = (str: string) =>
		crypto.createHash("md5").update(str).digest("hex");
}
