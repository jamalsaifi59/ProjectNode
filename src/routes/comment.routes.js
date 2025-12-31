import { getVideoComments,
        createComment,
        updateComment,
        deleteComment
 } from "../controllers/comment.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/video/:videoId").get(verifyJWT, getVideoComments)
router.route("/video/:videoId").post(verifyJWT, createComment)
router.route("/video/:videoId").put(verifyJWT, updateComment)
router.route("/video/:videoId").delete(verifyJWT, deleteComment)