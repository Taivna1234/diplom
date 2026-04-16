import { Router } from "express"
import { MessagingController } from "./messaging.controller"
import { authMiddleware } from "../../middleware/auth.middleware"

const router = Router()

router.post("/start", authMiddleware, MessagingController.start)

router.post("/send", authMiddleware, MessagingController.send)

router.get("/:conversationId", authMiddleware, MessagingController.getMessages)

router.get("/", authMiddleware, MessagingController.getUserConversations)

export default router