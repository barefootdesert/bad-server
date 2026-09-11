import { NextFunction, Request, Response } from 'express'
import { FilterQuery } from 'mongoose'
import { MAX_PAGE_SIZE, MAX_SEARCH_LENGTH } from '../config'
import BadRequestError from '../errors/bad-request-error'
import NotFoundError from '../errors/not-found-error'
import Order from '../models/order'
import User, { IUser } from '../models/user'
import escapeRegExp from '../utils/escapeRegExp'
import {
    asSearchString,
    ensurePrimitiveQuery,
    normalizeLimit,
    normalizePage,
} from '../utils/query'

const customerSortFields = new Set([
    'createdAt',
    'totalAmount',
    'orderCount',
    'lastOrderDate',
    'name',
])

export const getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            page,
            limit,
            sortField = 'createdAt',
            sortOrder = 'desc',
            registrationDateFrom,
            registrationDateTo,
            lastOrderDateFrom,
            lastOrderDateTo,
            totalAmountFrom,
            totalAmountTo,
            orderCountFrom,
            orderCountTo,
            search,
        } = req.query

        const currentPage = normalizePage(page)
        const pageSize = normalizeLimit(limit, 10, MAX_PAGE_SIZE)
        ensurePrimitiveQuery(sortField, 'sortField')
        ensurePrimitiveQuery(sortOrder, 'sortOrder')
        ensurePrimitiveQuery(registrationDateFrom, 'registrationDateFrom')
        ensurePrimitiveQuery(registrationDateTo, 'registrationDateTo')
        ensurePrimitiveQuery(lastOrderDateFrom, 'lastOrderDateFrom')
        ensurePrimitiveQuery(lastOrderDateTo, 'lastOrderDateTo')
        ensurePrimitiveQuery(totalAmountFrom, 'totalAmountFrom')
        ensurePrimitiveQuery(totalAmountTo, 'totalAmountTo')
        ensurePrimitiveQuery(orderCountFrom, 'orderCountFrom')
        ensurePrimitiveQuery(orderCountTo, 'orderCountTo')

        const filters: FilterQuery<Partial<IUser>> = {}

        if (registrationDateFrom) {
            filters.createdAt = {
                ...filters.createdAt,
                $gte: new Date(registrationDateFrom as string),
            }
        }

        if (registrationDateTo) {
            const endOfDay = new Date(registrationDateTo as string)
            endOfDay.setHours(23, 59, 59, 999)
            filters.createdAt = {
                ...filters.createdAt,
                $lte: endOfDay,
            }
        }

        if (lastOrderDateFrom) {
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $gte: new Date(lastOrderDateFrom as string),
            }
        }

        if (lastOrderDateTo) {
            const endOfDay = new Date(lastOrderDateTo as string)
            endOfDay.setHours(23, 59, 59, 999)
            filters.lastOrderDate = {
                ...filters.lastOrderDate,
                $lte: endOfDay,
            }
        }

        if (totalAmountFrom) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $gte: Number(totalAmountFrom),
            }
        }

        if (totalAmountTo) {
            filters.totalAmount = {
                ...filters.totalAmount,
                $lte: Number(totalAmountTo),
            }
        }

        if (orderCountFrom) {
            filters.orderCount = {
                ...filters.orderCount,
                $gte: Number(orderCountFrom),
            }
        }

        if (orderCountTo) {
            filters.orderCount = {
                ...filters.orderCount,
                $lte: Number(orderCountTo),
            }
        }

        const searchValue = asSearchString(search, MAX_SEARCH_LENGTH)
        if (searchValue) {
            const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
            const orders = await Order.find(
                {
                    $or: [{ deliveryAddress: searchRegex }],
                },
                '_id'
            )

            const orderIds = orders.map((order) => order._id)

            filters.$or = [
                { name: searchRegex },
                { lastOrder: { $in: orderIds } },
            ]
        }

        const sort: { [key: string]: 1 | -1 } = {}
        const normalizedSortField = String(sortField)
        if (!customerSortFields.has(normalizedSortField)) {
            throw new BadRequestError('Некорректное поле сортировки')
        }
        sort[normalizedSortField] = sortOrder === 'desc' ? -1 : 1

        const options = {
            sort,
            skip: (currentPage - 1) * pageSize,
            limit: pageSize,
        }

        const users = await User.find(filters, null, options).populate([
            'orders',
            {
                path: 'lastOrder',
                populate: {
                    path: 'products',
                },
            },
            {
                path: 'lastOrder',
                populate: {
                    path: 'customer',
                },
            },
        ])

        const totalUsers = await User.countDocuments(filters)
        const totalPages = Math.ceil(totalUsers / pageSize)

        res.status(200).json({
            customers: users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage,
                pageSize,
            },
        })
    } catch (error) {
        next(error)
    }
}

export const getCustomerById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.params.id).populate([
            'orders',
            'lastOrder',
        ])
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

export const updateCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, phone, email } = req.body
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone, email },
            {
                new: true,
                runValidators: true,
            }
        )
            .orFail(
                () =>
                    new NotFoundError(
                        'Пользователь по заданному id отсутствует в базе'
                    )
            )
            .populate(['orders', 'lastOrder'])
        res.status(200).json(updatedUser)
    } catch (error) {
        next(error)
    }
}

export const deleteCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).orFail(
            () =>
                new NotFoundError(
                    'Пользователь по заданному id отсутствует в базе'
                )
        )
        res.status(200).json(deletedUser)
    } catch (error) {
        next(error)
    }
}
