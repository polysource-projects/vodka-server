import { FastifyInstance } from "fastify";

import { infoSchema } from "../schema";
import * as controllers from "../controllers";

export default async function authRouter(fastify: FastifyInstance) {
	fastify.route({
		method: "GET",
		url: "/",
		schema: infoSchema,
		handler: controllers.info,
	});
}
