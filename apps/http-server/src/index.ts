import express, { Request, response, Response } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { middleware } from "./middleware";
import { UserValidation, User , CreateRoomType, SigninType, Room}from "@repo/commons/types"
import { prismaClient } from "@repo/database/index"

dotenv.config();

const app = express();

app.use(express.json())

app.post("/signup" , async (req: Request, res: Response)=>{
    const body = UserValidation.safeParse(req.body)

    if(!body.success){
        res.json({
            message: "Incorrect Inputs"
        })
        return
    }

    const user: User = body.data
    
    const reponse = await prismaClient.user.create({
        data: {
            ...user
        },
        omit: {
            password: true
        }
    })

    if( reponse ){
        res.status(200).json({
            message: "User Created Succesfully",
            userInfo: reponse
        })
    } else {
        res.status(411).json({
            message: "Something Went Wrong! Try Again"
        })
    } 
})

app.post("/signin", async(req: Request, res: Response)=>{
    const body = SigninType.safeParse(req.body)

    if(!body.success){
        res.status(411).json({
            message: "Incorrect Inputs"
        })
        return;
    }
    
    const { email , password} = body.data;

    const User = await prismaClient.user.findFirst({
        where: {
            email : email
        }
    })

    if(!User){
        res.status(411).json({
            Message: "User does not exist"
        })
        return;
    }
    
    if(User.password == password){
        const token = jwt.sign({userId: User.id}, process.env.JWT);
        res.status(200).json({
            Message: "Signin Succesfully",
            Success: true,
            token: token
        })
    }else{
         res.status(411).json({
            Message: "Invalid Credentials"
         })
    }
})

app.post("/room", middleware, async(req: Request, res: Response)=>{
    try {
        const parsedData = CreateRoomType.safeParse(req.body)
        
        if(!parsedData.success){
            res.status(411).json({
                message: "Incorrect Inputs"
            })
            return;
        }
        const userId = req.userId
        
        const { name } : Room = parsedData.data
        
        const room = await prismaClient.room.create({
            data: {
                slug: name,
                adminId: userId
            }
        })
        res.json({
            roomId: room.id
        })
    } catch (error) {
         res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId",async (req: Request, res: Response)=>{
        try {
            const roomId = Number(req.params.roomId)
            console.log(roomId)

            const respone = await prismaClient.chat.findMany({
                where: {
                    roomId: roomId
                },
                orderBy: {
                    id: "desc"
                },
                take: 1000
            })

            res.status(200).json({
                respone
            })
        } catch (error) {
            console.log(error)
            res.status(411).json([])
        }
})

app.get("/roomId/:slug", async (req: Request, res: Response)=>{
    try {
        const slug = req.params.slug

        const room = await prismaClient.room.findFirst({
            where:{
                slug
            }
        })

        res.status(200).json({
            room
        })
        
    } catch (error) {
        console.log(error)
        res.status(411).json({
            error: "Not found"
        })
    }
})

app.listen(3001)