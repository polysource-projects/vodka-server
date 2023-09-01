import { AnswerBody, AskBody } from "../schema";
import { Handler } from "../interfaces";
import {
	Redis,
	validateEmail,
	Mail,
	generateVerificationCode,
	generateQuestionId,
} from "../helpers";

export const ask: Handler<AskBody> = async (request, reply) => {
	const { email } = request.body;

	//! Check that email is a valid email, then check it is an EPFL email

	const isValid = validateEmail(email);
	const isEPFL = isValid && email.endsWith("@epfl.ch");

	if (!isValid) {
		return void reply.code(400).send({ message: "Invalid email" });
	}

	if (!isEPFL) {
		return void reply.code(400).send({ message: "Not an EPFL email" });
	}

	//TODO Manage ratelimits

	//! Generate confirmation code and assign question ID

	const verificationCode = await generateVerificationCode();
	const questionId = generateQuestionId();

	// Store solution hash
	await Redis.saveQuestion(email, questionId, verificationCode);
	// Send verification code
	await Mail.sendConfirmationCode(email, verificationCode);

	// Send response with Question cookie
	reply.setCookie("questionId", questionId, {
		path: "/",
		httpOnly: true,
		sameSite: process.env.NODE_ENV === "development" ? "none" : "strict",
		secure: true,
		maxAge: 60 * 10, // 10 minutes
	});

	reply.code(201).send({ message: "OK" });
};

export const answer: Handler<AnswerBody> = async (request, reply) => {
	const questionId = request.cookies?.questionId;
	const answer = request.body.answer;

	if (!questionId) {
		return void reply.code(400).send();
	}

	const valid = await Redis.checkAnswer(answer, questionId);
};
