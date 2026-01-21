import {
    getAllVideos,
    getVideoById,
    publishVideo,
    updateVideo,
    deleteVideo
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publish-video").post(
    upload.fields([
        {
            name: "thumbnailFile",
            maxCount: 1
        },
        {
            name: "videoFile",
            maxCount: 1
        }
    ]),
    verifyJWT, publishVideo);

    router.route("/update/:videoId").put(
    verifyJWT,
    upload.fields([
        {
            name: "thumbnailFile",
            maxCount: 1
        },
        {
            name: "videoFile",
            maxCount: 1
        }
    ]),
    updateVideo
);

router.route("/videos").get(verifyJWT, getAllVideos)
router.route("/videos/:videoId").get(verifyJWT, getVideoById)
router.route("/publishvideo").post(verifyJWT, publishVideo)
router.route("/update/:videoId").put(verifyJWT, updateVideo)
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo)

export default router;