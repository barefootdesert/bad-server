import BadRequestError from '../errors/bad-request-error'

export function ensurePrimitiveQuery(value: unknown, field: string) {
    if (value !== undefined && value !== null && typeof value === 'object') {
        throw new BadRequestError(`Некорректный параметр ${field}`)
    }
}

export function normalizeLimit(
    value: unknown,
    defaultValue: number,
    maxValue: number
) {
    ensurePrimitiveQuery(value, 'limit')
    if (value === undefined || value === '') {
        return defaultValue
    }
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 1) {
        return defaultValue
    }
    if (parsed > maxValue) {
        throw new BadRequestError('Превышен лимит выборки')
    }
    return Math.floor(parsed)
}

export function normalizePage(value: unknown, defaultValue = 1) {
    ensurePrimitiveQuery(value, 'page')
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 1) {
        return defaultValue
    }
    return Math.floor(parsed)
}

export function asSearchString(value: unknown, maxLength: number) {
    ensurePrimitiveQuery(value, 'search')
    if (value === undefined || value === null || value === '') {
        return ''
    }
    return String(value).slice(0, maxLength)
}
