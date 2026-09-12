import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import ForbiddenError from '../errors/forbidden-error'

export const CSRF_COOKIE_NAME = 'csrfToken'

const csrfCookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: false,
    path: '/',
}

export const createCsrfToken = (_req: Request, res: Response) => {
    const csrfToken = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE_NAME, csrfToken, csrfCookieOptions)
    return csrfToken
}

const readCsrfFromRequest = (req: Request) => {
    const headerToken =
        req.header('x-csrf-token') ||
        req.header('csrf-token') ||
        req.header('x-xsrf-token')
    const bodyToken =
        typeof req.body === 'object' && req.body ? req.body.csrfToken : undefined
    return headerToken || bodyToken
}

export const csrfProtection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next()
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME]
    const requestToken = readCsrfFromRequest(req)

    if (!cookieToken || !requestToken || cookieToken !== requestToken) {
        return next(new ForbiddenError('Недействительный CSRF токен'))
    }

    return next()
}
