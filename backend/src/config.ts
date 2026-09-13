import { CookieOptions } from 'express'
import ms from 'ms'

export const { PORT = '3000' } = process.env
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env
export const { JWT_SECRET = 'JWT_SECRET' } = process.env
export const { ORIGIN_ALLOW = 'http://localhost:5173' } = process.env
export const REQUEST_BODY_LIMIT = '10kb'
export const RATE_LIMIT_WINDOW_MS = 1000
export const RATE_LIMIT_MAX = 20
export const MIN_FILE_SIZE = 2 * 1024
export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const MAX_PAGE_SIZE = 10
export const MAX_PRODUCT_PAGE_SIZE = 50
export const MAX_SEARCH_LENGTH = 100
export const MAX_COMMENT_LENGTH = 1000
export const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
}
export const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
            path: '/',
        } as CookieOptions,
    },
}
