import nodemailer from 'nodemailer';
import { promises } from 'fs';
import { join } from 'path';

const readFile = promises.readFile;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST,
    port: process.env.SMTP_SERVER_PORT,
    secure: true,
    auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD
    }
});

const sendMail = async (email: string, subject: string, html: string) => {

	const info = await transporter.sendMail({
		from: '"EPFL Vodka" <contact@epfl.tools>', // sender address
		to: email,
		subject,
		html
	});
	
	return info;
}

export const sendConfirmationCode = async (email: string, code: string) => {

	const htmlPage = await readFile(join('assets', 'mail.html'), 'utf-8');

	const updatedHtmlPage = htmlPage.replace('{{code}}', code);

	const info = await sendMail(email, 'Confirmation code', updatedHtmlPage);
	
	return info;

}
