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
import videoRoutes from "./routes/video.routes.js"
import tweetRoutes from "./routes/tweet.routes.js"
import likeRoutes from "./routes/like.routes.js"
import playlistRoutes  from "./routes/playlist.routes.js"

app.use("/api/users",userRoutes)
app.use("/api/comments",commentRoutes)
app.use("/api/videos", videoRoutes)
app.use("/api/tweets", tweetRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/playlist", playlistRoutes)

export default app