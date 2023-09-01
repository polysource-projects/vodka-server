import { InfoQuery } from "../schema";
import { Handler, User } from "../interfaces";
import { Keyring, Websites } from "../helpers";

export const info: Handler<unknown, unknown, unknown, InfoQuery> = async (
	request,
	reply
) => {
	console.log("hi");
	const sessionId = request.cookies.sessionId;

	if (!sessionId) {
		return void reply.code(401).send();
	}

	const session = Keyring.decodeSession(sessionId);

	if (!session) {
		return void reply.code(401).send();
	}

	const { sub: email } = session;

	//TODO Fetch data from people.epfl.ch

	const user: User = { email };

	const domain = request.query.domain;

	if (domain) {
		const website = Websites.get(domain);

		const paperplane = Keyring.signPaperplane(user, domain);

		reply.send({ user, website, token: paperplane });
	} else {
		reply.send({ user, website: null, token: null });
	}
};
