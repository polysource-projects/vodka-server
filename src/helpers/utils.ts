import crypto from "crypto";

export function validateEmail(email: string) {
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
}

/**
 * @returns a 6-digit verification code
 */
export function generateVerificationCode() {
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

export const generateQuestionId = () => crypto.randomUUID();

export const hash = (str: string) =>
	crypto.createHash("md5").update(str).digest("hex");
