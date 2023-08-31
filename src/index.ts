import dotenv from 'dotenv';
dotenv.config();

import fastify from 'fastify';
import type { FastifyCookieOptions } from '@fastify/cookie'
import cookie from '@fastify/cookie';

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import { sendConfirmationCode } from './mail';
import { getRedisClient } from './redis';
import { generateRandomCode, hash } from './util';

const server = fastify();

server.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: {}
} as FastifyCookieOptions);

interface AskBody {
    email: string;
}

interface AnswerBody {
    answer: string;
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
    reply.setCookie('questionId', cookieQuestionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: true
    });
    reply.send();

});

server.post('/auth/answer', async (request, reply) => {

    const questionId = request.cookies?.questionId;
    const answer = (request.body as AnswerBody)?.answer;

    if (!questionId || !answer) {
        return void reply.code(400).send();
    }

    const cookieQuestionIdHash = hash(answer + questionId);

    const redisClient = await getRedisClient();
    const email = await redisClient.get(cookieQuestionIdHash);
    if (!email || !email.endsWith('@epfl.ch')) {
        return void reply.code(401).send();
    }

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
