import {
    createplaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
 router.use (verifyJWT);
 router.route("/createplaylist").post(createplaylist)
 router.route("/getPlaylist/:playlistId").get(getPlaylistById)
 router.route("/getUserPlaylists/:userId").get(getUserPlaylists)
 router.route("/addVideoToPlaylist/:playlistId/:videoId").post(addVideoToPlaylist)
 router.route("/removeVideoFromPlaylist/:playlistId/:videoId").post(removeVideoFromPlaylist)
 router.route("/deletePlaylist/:playlistId").delete(deletePlaylist)
 router.route("/updatePlaylist/:playlistId").put(updatePlaylist)

 export default router;