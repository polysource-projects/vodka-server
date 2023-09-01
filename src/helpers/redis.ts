import { createClient } from "redis";
import { Keyring } from "./keyring";

const { hash } = Keyring;

const client = createClient({
	url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

const connectPromise = client.connect();

export const getRedisClient = () => connectPromise.then(() => client);

export class Redis {
	static async saveQuestion(email: string, questionId: string, answer: string) {
		const client = await getRedisClient();
		const solution = hash("question_" + questionId + "." + answer);
		await client.set(solution, email);
	}

	static async checkAnswer(questionId: string, answer: string) {
		const client = await getRedisClient();
		const solution = hash("question_" + questionId + "." + answer);
		const email = await client.get(solution);
		return email;
	}

	static async saveSession(token: string) {
		const client = await getRedisClient();
		const tokenHash = hash(token);
		await client.set(`session_${tokenHash}`, "1");
	}

	static async deleteSession(token: string) {
		const client = await getRedisClient();
		const tokenHash = hash(token);
		await client.del(`session_${tokenHash}`);
	}
}
