import S from "fluent-json-schema";

// Info

export interface InfoQuery {
	domain?: string;
}

export const infoSchema = {
	queryString: S.object().prop("domain", S.string()),
	params: S.object(),
	headers: S.object(),
};
