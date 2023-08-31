import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import type { FastifyCookieOptions } from "@fastify/cookie";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import { v4 as uuidv4 } from "uuid";

import { sendConfirmationCode } from "./mail";
import { getRedisClient } from "./redis";
import { generateRandomCode, hash } from "./util";
import {
    VodkaUserData,
	WebsiteData,
	decodeSessionToken,
	invalidateVodkaSessionToken,
	linkExternalSessionTokenToVodkaSessionToken,
	signExternalSessionToken,
	signVodkaSessionToken,
	whitelistSessionToken,
} from "./session-tokens";

import { readFileSync } from "fs";

// We can afford to block the event loop here as it's only done once at startup
const websites = JSON.parse(readFileSync("websites.json", "utf-8")) as WebsiteData[];

const server = fastify();

server.register(cookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {},
} as FastifyCookieOptions);

server.register(cors, {
	origin: true,
	credentials: true,
});

interface AskBody {
	email: string;
}

interface AnswerBody {
	answer: string;
}

/**
 * Step 1: check email is valid (@epfl.ch)
 * Step 2: check ratelimits
 * Step 3: generate confirmation code and question ID
 * Step 4: store hash(code + QUESTION_ID) <--> email
 * Step 5: send cookie with question id
 */
server.post("/auth/ask", async (request, reply) => {
	// TODO: check for email validity
	const email = (request.body as AskBody)?.email;
	if (!email || !email.endsWith("@epfl.ch")) {
		return void reply.code(400).send();
	}

	// TODO: check ratelimits

	// generate confirmation code and question ID
	const random6Digits = generateRandomCode();
	const cookieQuestionId = uuidv4();
	const cookieQuestionIdHash = hash(random6Digits + cookieQuestionId);

	// store hash(code + QUESTION_ID) <--> email
	const redisClient = await getRedisClient();
	await redisClient.set(cookieQuestionIdHash, email);
	// send confirmation code
	sendConfirmationCode(email, random6Digits);

	// send cookie with question id
	reply.setCookie("questionId", cookieQuestionId, {
		path: "/",
		httpOnly: true,
		sameSite: process.env.NODE_ENV === "development" ? "none" : "strict",
		secure: true,
		maxAge: 60 * 10, // 10 minutes
	});
	reply.code(201).send("OK");
});

server.post("/auth/answer", async (request, reply) => {
	const questionId = request.cookies?.questionId;
	const answer = (request.body as AnswerBody)?.answer;

	if (!questionId || !answer) {
		return void reply.code(400).send();
	}

	const cookieQuestionIdHash = hash(answer + questionId);

	const redisClient = await getRedisClient();
	const email = await redisClient.get(cookieQuestionIdHash);
	if (!email || !email.endsWith("@epfl.ch")) {
		return void reply.code(401).send();
	}

	const vodkaSessionToken = signVodkaSessionToken({
		email,
		tokenType: "vodka",
	});

	await whitelistSessionToken(vodkaSessionToken);

	reply.setCookie("sessionId", vodkaSessionToken, {
		path: "/",
		httpOnly: true,
		sameSite: process.env.NODE_ENV === "development" ? "none" : "strict",
		secure: true,
		maxAge: 60 * 60 * 24 * 7, // 1 week
	});

	reply.send("OK");
});

server.post("/auth/logout", async (request, reply) => {
	const sessionId = request.cookies?.sessionId;

	if (!sessionId) {
		return void reply.code(401).send();
	}

	await invalidateVodkaSessionToken(sessionId);

	reply.clearCookie("sessionId", {
		path: "/",
		httpOnly: true,
		sameSite: "strict",
		// secure: true,
	});

	reply.send("OK");
});

interface DataQuery {
	domain?: string;
}

server.get("/data", async (request, reply) => {
	const sessionId = request.cookies?.sessionId;

	if (!sessionId) {
		return void reply.code(400).send();
	}

	const decodedSessionToken = await decodeSessionToken(sessionId);
	if (!decodedSessionToken) {
		return void reply.code(401).send();
	}

	const email = decodedSessionToken.email;

	// TODO: fetch data
	const user: VodkaUserData = {
        firstname: "John",
        lastname: "Doe",
		email,
        isStudent: true
	};

	const domain = (request.query as DataQuery)?.domain;
	let website = null;
    let token = null;

	if (domain) {
		website = websites.find((w: any) => w.domain === domain) || null;

       token = signExternalSessionToken({
            email,
            tokenType: "external",
            user,
            domain
        })

        await whitelistSessionToken(token);
        await linkExternalSessionTokenToVodkaSessionToken(sessionId, token);
	}

	reply.send({
		user,
		website,
        token
	});
});

server.listen(
	{
		port: process.env.PORT ?? 8000,
		host: "127.0.0.1",
	},
	(err, address) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(`Server listening at ${address}`);
	},
);
