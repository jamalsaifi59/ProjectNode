import {
    userSubscription,
    getUserChannelSubscriber,
    getSubscriberChannel
} from "../controllers/subscription.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/userSubscription/:channelId").post(verifyJWT, userSubscription)
router.route("/getUserChannelSubscriber/:subscriberId").get(verifyJWT, getUserChannelSubscriber)
router.route("/getSubscriberChannel/:channelId").get(verifyJWT, getSubscriberChannel)

export default router;