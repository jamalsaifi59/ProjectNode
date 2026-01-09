import { getVideoComments,
        createComment,
        updateComment,
        deleteComment
 } from "../controllers/comment.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/video-comment/:videoId").get(verifyJWT, getVideoComments)
router.route("/create-comment").post(verifyJWT, createComment)
router.route("/update-comment/:commentId").put(verifyJWT, updateComment)
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment)

export default router;