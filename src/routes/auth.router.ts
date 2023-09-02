import { FastifyInstance } from "fastify";

import { askSchema, answerSchema } from "../schema";
import * as controllers from "../controllers";

export default async function authRouter(fastify: FastifyInstance) {
	fastify.route({
		method: "POST",
		url: "/ask",
		schema: askSchema,
		handler: controllers.ask,
	});

	fastify.route({
		method: "POST",
		url: "/answer",
		schema: answerSchema,
		handler: controllers.answer,
	});

	fastify.route({
		method: "POST",
		url: "/logout",
		handler: controllers.logout,
	});
}
