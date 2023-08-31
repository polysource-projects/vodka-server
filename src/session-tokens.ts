import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { hash } from './util';
import { getRedisClient } from './redis';

export const publicKey = readFileSync('jwtRS256.key.pub', 'utf-8');

interface VodkaUserData {
    email: string;
    firstname: string;
    lastname: string;
    isStudent: boolean;
}

interface VodkaSessionTokenData {
    email: string;
    tokenType: 'vodka';
}

interface ExternalSessionTokenData {
    email: string;
    website: string;
    user: VodkaUserData;
    tokenType: 'external';
}

// this function creates a new vodka session token, used to authenticate users on vodka
// a vodka session token only contains an email address
export const signVodkaSessionToken = (data: VodkaSessionTokenData) => {

    return jwt.sign(data, process.env.JWT_PRIVATE_KEY, { algorithm: 'RS256' });

}

// this is used to add the signed session token to the redis whitelist
// if the database is wiped, all users will be logged out
// THIS WORKS FOR BOTH VODKA AND EXTERNAL SESSION TOKENS
export const whitelistSessionToken = async (token: string) => {

    const tokenHash = hash(token);

    const redisClient = await getRedisClient();
    await redisClient.set(`session_${tokenHash}`, '1');

}

export const invalidateVodkaSessionToken = async (token: string) => {

    const tokenHash = hash(token);

    const redisClient = await getRedisClient();
    await redisClient.del(`session_${tokenHash}`);

    const externalSessionTokens = await redisClient.sMembers(`session_${tokenHash}_external`);

    for (const externalSessionToken of externalSessionTokens) {
        await redisClient.del(`session_${hash(externalSessionToken)}`);
    }

}

// this function verifies if a session token is signed AND whitelisted
// THIS WORKS FOR BOTH VODKA AND EXTERNAL SESSION TOKENS
export const decodeSessionToken = async (token: string): Promise<VodkaSessionTokenData|ExternalSessionTokenData|false> => {

    const tokenHash = hash(token);

    const redisClient = await getRedisClient();
    const exists = await redisClient.exists(`session_${tokenHash}`);

    if (!exists) {
        return false;
    }

    try {
        jwt.verify(token, publicKey);
        return jwt.decode(token) as VodkaSessionTokenData|ExternalSessionTokenData;
    } catch (e) {
        return false;
    }

}

// this function creates a new external session token, used to authenticate users on external websites
// this session token is a JWT and contains all the user data
export const signExternalSessionToken = (data: ExternalSessionTokenData) => {
    
    try {
        return jwt.sign(data, process.env.JWT_PRIVATE_KEY, { algorithm: 'RS256' });
    } catch (e) {
        return null;
    }

}

// this function links an external session token to a vodka session token
// this is useful so when a user logs out of vodka, we can un-whitelist all the external session tokens
export const linkExternalSessionTokenToVodkaSessionToken = async (vodkaSessionToken: string, externalSessionToken: string) => {

    const vodkaSessionTokenHash = hash(vodkaSessionToken);

    const redisClient = await getRedisClient();
    await redisClient.sAdd(`session_${vodkaSessionTokenHash}_external`, externalSessionToken);

}
