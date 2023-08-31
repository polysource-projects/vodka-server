declare namespace NodeJS {

    export interface ProcessEnv {

        SMTP_SERVER_HOST: string;
        SMTP_SERVER_PORT: number;
        REDIS_URL: string;
    }

}
