import { FastifyRequest } from "fastify";
import S from "fluent-json-schema";

// Ask

export interface AskBody {
	email: string;
}

export const askSchema = {
	body: S.object().prop("email", S.string().required()),
	queryString: S.object(),
	params: S.object(),
	headers: S.object(),
};

// Answer

export interface AnswerBody {
	answer: string;
}

export const answerSchema = {
	body: S.object().prop(
		"answer",
		S.string().required().minLength(6).maxLength(6),
	),
	queryString: S.object(),
	params: S.object(),
	headers: S.object(),
};
