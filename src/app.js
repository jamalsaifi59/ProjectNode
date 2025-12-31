import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit : "20kb"}))
app.use(express.urlencoded({limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes

import userRoutes from "./routes/user.routes.js"
import commentRoutes from "./routes/comment.routes.js"

app.use("/api/users",userRoutes)
app.use("/api/comments",commentRoutes)

export default app