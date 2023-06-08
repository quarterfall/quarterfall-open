import jwt from "jsonwebtoken";

/**
 * Create a JSON web token from a user id.
 *
 * @protected
 * @param {string} userId        the user id
 * @returns                      (promise) a JSON web token
 */
export function createAuthToken(
    userId: string,
    tokenLifetime: string | number,
    secret: string,
    data?: object
): string {
    return jwt.sign(
        {
            userId,
            ...data,
        },
        secret,
        { expiresIn: tokenLifetime }
    );
}

export function exchangeAuthToken<T extends { userId: string }>(
    secret: string,
    token: string
): T | null {
    try {
        return jwt.verify(token, secret) as T;
    } catch (error) {
        // If for some reason exchanging the token doesn't work, don't do anything.
        return null;
    }
}

export function createCode<T extends string | object | Buffer>(
    data: T,
    tokenLifetime: string | number,
    secret: string
): string {
    return jwt.sign(data, secret, { expiresIn: tokenLifetime });
}

export function exchangeCode<T extends string | object | Buffer>(
    secret: string,
    token: string
): T {
    return jwt.verify(token, secret) as T;
}
