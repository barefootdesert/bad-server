import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const resolvedBase = path.resolve(baseDir)
        const filePath = path.resolve(resolvedBase, `.${req.path}`)
        const relativePath = path.relative(resolvedBase, filePath)

        if (
            relativePath.startsWith('..') ||
            path.isAbsolute(relativePath) ||
            relativePath.length === 0
        ) {
            return next()
        }

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next()
            }
            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
