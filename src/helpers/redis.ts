import { createClient } from "redis";
import { hash } from "../helpers";

const client = createClient({
	url: process.env.REDIS_URL,
});

client.on("error", (err) => console.log("Redis Client Error", err));

const connectPromise = client.connect();

export const getRedisClient = () => connectPromise.then(() => client);

export class Redis {
	static async saveQuestion(email: string, questionId: string, answer: string) {
		const client = await getRedisClient();
		const solution = hash(questionId + "." + answer);
		await client.set(solution, email);
	}

	static async checkAnswer(email: string, questionId: string, answer: string) {
		const client = await getRedisClient();
		const solution = hash(questionId + "." + answer);
		const solutionEmail = await client.get(solution);
		return solutionEmail === email;
	}
}
