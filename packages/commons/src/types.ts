import {z} from "zod"

export const UserValidation = z.object({
    email : z.string().email(),
    password: z.string().min(6).max(20),
    name: z.string().min(3).max(30),
    photo: z.string().min(3).max(200).optional()
})

export type User = z.infer< typeof UserValidation>

export const SigninType = z.object({
    email : z.email(),
    password: z.string().min(6).max(20)
})

export type Signin = z.infer<typeof SigninType>

export const CreateRoomType = z.object({
    name: z.string().min(3).max(30)
})

export type Room = z.infer<typeof CreateRoomType>