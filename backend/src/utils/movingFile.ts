import { existsSync, mkdirSync, rename } from 'fs'
import { basename, join, relative, resolve } from 'path'

function movingFile(imagePath: string, from: string, to: string) {
    const fileName = basename(imagePath)
    if (!fileName || fileName === '.' || fileName === '..') {
        throw new Error('Ошибка при сохранении файла')
    }

    const imagePathTemp = resolve(join(from, fileName))
    const imagePathPermanent = resolve(join(to, fileName))
    const resolvedFrom = resolve(from)
    const resolvedTo = resolve(to)

    if (
        relative(resolvedFrom, imagePathTemp).startsWith('..') ||
        relative(resolvedTo, imagePathPermanent).startsWith('..')
    ) {
        throw new Error('Ошибка при сохранении файла')
    }

    mkdirSync(to, { recursive: true })
    if (!existsSync(imagePathTemp)) {
        throw new Error('Ошибка при сохранении файла')
    }

    rename(imagePathTemp, imagePathPermanent, (err) => {
        if (err) {
            throw new Error('Ошибка при сохранении файла')
        }
    })
}

export default movingFile
