import { email, z } from "zod"

export const UserType = z.object({
    email : z.email(),
    password: z.string().min(6).max(20),
    name: z.string().min(3).max(30)
})

export const SigninType = z.object({
    email : z.email(),
    password: z.string().min(6).max(20)
})

export const CreateRoomType = z.object({
    name: z.string().min(3).max(30)
})