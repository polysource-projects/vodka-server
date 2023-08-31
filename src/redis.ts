import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', err => console.log('Redis Client Error', err));

const connectPromise = client.connect();

export const getRedisClient = () => connectPromise.then(() => client);
