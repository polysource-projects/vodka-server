import {
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
	RequestGenericInterface,
	RouteHandlerMethod,
} from "fastify";

interface Request<Body, Headers, Params, Querystring>
	extends RequestGenericInterface {
	Body: Body;
	Headers: Headers;
	Params: Params;
	Querystring: Querystring;
}

export type Handler<
	Body = unknown,
	Headers = unknown,
	Params = unknown,
	Querystring = unknown
> = RouteHandlerMethod<
	RawServerDefault,
	RawRequestDefaultExpression<RawServerDefault>,
	RawReplyDefaultExpression<RawServerDefault>,
	Request<Body, Headers, Params, Querystring>
>;

export interface User {
	email: string;
	firstName?: string;
	lastName?: string;
}
