import { Router } from 'express'
import multer from 'multer'
import { uploadFile } from '../controllers/upload'
import BadRequestError from '../errors/bad-request-error'
import fileMiddleware from '../middlewares/file'

const uploadRouter = Router()

uploadRouter.post('/', (req, res, next) => {
    fileMiddleware.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return next(new BadRequestError(err.message))
        }
        if (err) {
            return next(err)
        }
        return uploadFile(req, res, next)
    })
})

export default uploadRouter
