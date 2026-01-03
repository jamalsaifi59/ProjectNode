import { 
    createTweets,
    getUserTweets,
    updateTweets,
    deleteTweets
} from "../controllers/tweet.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/create-tweet").post(verifyJWT, createTweets)
router.route("/get-user-tweet").get(verifyJWT, getUserTweets)
router.route("/update-tweet/:tweetId").put(verifyJWT, updateTweets)
router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweets)

export default router;