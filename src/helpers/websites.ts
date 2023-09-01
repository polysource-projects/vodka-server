import { readFileSync } from "fs";

export const websites = JSON.parse(
	readFileSync("websites.json", "utf-8")
) as WebsiteData[];

interface WebsiteData {
	name: string;
	domain: string;
}

export class Websites {
	static get(domain: string) {
		return websites.find((website) => website.domain === domain);
	}
}
