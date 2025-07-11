import express, { Request, Response } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { middleware } from "./middleware";
import { UserType , CreateRoomType}from "@repo/commons/types"

dotenv.config();

const app = express();

app.use(express.json())


app.post("/signup" , async (req: Request, res: Response)=>{
    const data = UserType.safeParse(req.body)

    if(!data.success){
        res.json({
            message: "Incorrect Inputs"
        })
    }
    const userId = 1;
    const token = jwt.sign({userId: userId}, process.env.JWT)

    res.json({
        token: token
    })
    
})

app.post("/signin", async(req: Request, res: Response)=>{
    res.send("signin")
})

app.post("/room", middleware, async(req: Request, res: Response)=>{
    res.send("room")
})

app.listen(3001)