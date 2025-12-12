import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 3,
        parallelism: 1,
    });
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<Boolean> {
    return argon2.verify(hashedPassword, password);
}