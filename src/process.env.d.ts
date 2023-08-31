declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: number;
		SMTP_SERVER_HOST: string;
		SMTP_SERVER_PORT: number;
		REDIS_URL: string;
		COOKIE_SECRET: string;
	}
}
