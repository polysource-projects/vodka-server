import { createHash } from 'crypto'

export const generateRandomCode = () => {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

export const hash = (str: string) => {
    return createHash('md5').update(str).digest('hex');
}
