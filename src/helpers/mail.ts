import path from "path";
import { readFileSync } from "fs";

import nodemailer from "nodemailer";

const mailTemplate = readFileSync(
	path.join(__dirname, "../../assets/mail.html"),
	"utf-8",
);

const verificationMail = (code: string) =>
	mailTemplate.replace("{{code}}", code);

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_SERVER_HOST,
	port: process.env.SMTP_SERVER_PORT,
	secure: true,
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD,
	},
});

export class Mail {
	private static sendMail(to: string, subject: string, body: string) {
		return transporter.sendMail({
			from: '"EPFL Vodka" <contact@epfl.tools>',
			to,
			subject,
			html: body,
		});
	}

	static sendConfirmationCode(email: string, code: string) {
		return this.sendMail(
			email,
			`${code} is your Vodka verification code.`,
			verificationMail(code),
		);
	}
}
