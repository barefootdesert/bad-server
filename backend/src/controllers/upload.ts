import { NextFunction, Request, Response } from 'express'
import { unlink } from 'fs/promises'
import { constants } from 'http2'
import sharp from 'sharp'
import { MIN_FILE_SIZE } from '../config'
import BadRequestError from '../errors/bad-request-error'

const allowedFormats = new Set(['jpeg', 'png', 'gif', 'webp'])

const removeUploadedFile = async (filePath?: string) => {
    if (!filePath) {
        return
    }
    await unlink(filePath).catch(() => undefined)
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        if (req.file.size <= MIN_FILE_SIZE) {
            await removeUploadedFile(req.file.path)
            return next(new BadRequestError('Файл слишком маленький'))
        }

        const metadata = await sharp(req.file.path).metadata()
        if (!metadata.format || !allowedFormats.has(metadata.format)) {
            await removeUploadedFile(req.file.path)
            return next(new BadRequestError('Некорректный файл изображения'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        await removeUploadedFile(req.file?.path)
        return next(new BadRequestError('Некорректный файл изображения'))
    }
}

export default {}
