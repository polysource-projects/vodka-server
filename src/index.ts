import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import type { FastifyCookieOptions } from "@fastify/cookie";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import authRouter from "./routes/auth.router";
import infoRouter from "./routes/info.router";

import { publicKey } from "./helpers/keyring";

const server = fastify({ logger: process.env.NODE_ENV === "development" });

server.register(cookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
} as FastifyCookieOptions);

// Declare CORS policies

server.register(cors, {
	origin: true,
	credentials: true,
});

// Serve routes

server.register(infoRouter, { prefix: "/data" });
server.register(authRouter, { prefix: "/auth" });

// Serve public key

server.get("/public-key", async (request, reply) => {
	reply.send(publicKey);
});

// Spin up server

server.listen(
	{
		port: process.env.PORT ?? 8000,
		host: "0.0.0.0",
	},
	(err, address) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(`Server listening at ${address}`);
	}
);
