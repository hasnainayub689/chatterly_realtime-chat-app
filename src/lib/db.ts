import { Redis } from '@upstash/redis';

export const db = new Redis({
    url: 'https://us1-aware-parakeet-37914.upstash.io',
    token: 'AZQaASQgMjQyMTBhNjctOGQ4Yi00MGI2LThiMjgtMTJiYzc3ZmVmN2Q2YzQ3M2VhZTRhZjA4NGY1OWE2NTA4ZGUzMTE2YjhmMTU=',
});
