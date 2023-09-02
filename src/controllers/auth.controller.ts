import { AnswerBody, AskBody } from "../schema";
import { Handler } from "../interfaces";
import { Redis, Mail, Keyring } from "../helpers";

export const ask: Handler<AskBody> = async (request, reply) => {
	const email = request.body?.email;

	if (!email) {
		return void reply.code(400).send();
	}

	//! Check that email is a valid email, then check it is an EPFL email

	const isValid = Mail.validateAddress(email);
	const isEPFL = isValid && email.endsWith("@epfl.ch");

	if (!isValid) {
		return void reply.code(400).send({ message: "Invalid email" });
	}

	if (!isEPFL) {
		return void reply.code(400).send({ message: "Not an EPFL email" });
	}

	//TODO Manage ratelimits

	//! Generate confirmation code and assign question ID
	const verificationCode = await Keyring.generateVerificationCode();
	const questionId = Keyring.generateQuestionId();

	// Store solution hash
	await Redis.saveQuestion(email, questionId, verificationCode);
	// Send verification code
	// Do not await, send mail in background : this may take in the order of a second
	Mail.sendConfirmationCode(email, verificationCode);

	// Send response with Question cookie
	reply.setCookie("questionId", questionId, {
		path: "/",
		httpOnly: true,
		sameSite: process.env.NODE_ENV === "development" ? "none" : "strict",
		secure: true,
		maxAge: 60 * 10, // 10 minutes
	});

	reply.code(201).send("OK");
};

export const answer: Handler<AnswerBody> = async (request, reply) => {
	const questionId = request.cookies.questionId;
	const answer = request.body.answer;

	if (!questionId) {
		return void reply.code(400).send();
	}

	const email = await Redis.checkAnswer(questionId, answer);

	if (!email) {
		return void reply.code(401).send();
	}

	const sessionToken = await Keyring.createSession(email);

	reply.setCookie("sessionId", sessionToken, {
		path: "/",
		httpOnly: true,
		sameSite: process.env.NODE_ENV === "development" ? "none" : "strict",
		secure: true,
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	reply.code(200).send("OK");
};

export const logout: Handler = async (request, reply) => {
	const sessionId = request.cookies.sessionId;

	if (!sessionId) {
		return void reply.code(401).send();
	}

	await Redis.deleteSession(sessionId);

	reply
		.clearCookie("sessionId", {
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: process.env.NODE_ENV === "development" ? "none" : "strict",
		})
		.code(200)
		.send("OK");
};
