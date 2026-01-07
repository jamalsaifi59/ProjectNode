import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikeVideo
} from "../controllers/like.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
 router.use (verifyJWT);
router.route("/video-like").post(toggleVideoLike)
router.route("/comment-like").post(toggleCommentLike)
router.route("/tweet-like").post(toggleTweetLike)
router.route("/videos-like").get(getLikeVideo)
 export default router;