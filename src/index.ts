import dotenv from 'dotenv';
dotenv.config();

import fastify from 'fastify';
import { sendConfirmationCode } from './mail';

import { v4 as uuidv4 } from 'uuid';
import { generateRandomCode, hash } from './util';
import { getRedisClient } from './redis';

const server = fastify();

interface AskBody {
    email: string;
}

/**
 * Step 1: check email is valid (@epfl.ch)
 * Step 2: check ratelimits
 * Step 3: generate confirmation code and question ID
 * Step 4: store hash(code + QUESTION_ID) <--> email
 * Step 5: send cookie with question id
 */
server.post('/auth/ask', async (request, reply) => {

    // TODO: check for email validity
    const email = (request.body as AskBody)?.email;

    if (!email || !email.endsWith('@epfl.ch')) {
        return void reply.code(400).send();
    }

    // TODO: check ratelimits

    // generate confirmation code and question ID
    const random6Digits = generateRandomCode();
    const cookieQuestionId = uuidv4();
    const cookieQuestionIdHash = hash(random6Digits + cookieQuestionId);

    // store hash(code + QUESTION_ID) <--> email
    const redisClient = await getRedisClient();
    await redisClient.set(cookieQuestionIdHash, email);
    
    // send confirmation code
    sendConfirmationCode(email, random6Digits);
    
    // send cookie with question id
    reply.header('Set-Cookie', `questionId=${cookieQuestionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=300`);
    reply.send();

});

server.listen({
    port: 3000,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
