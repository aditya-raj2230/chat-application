import {z } from 'zod'

export const addfriendValidator = z.object({
    email:z.string().email()
})
