import { Router } from "express"
import { LikesController } from "./likes.controller"
import { authMiddleware } from "../../../middleware/auth.middleware"

const router = Router()

router.post("/:postId", authMiddleware, LikesController.like)

router.delete("/:postId", authMiddleware, LikesController.unlike)

router.get("/:postId", LikesController.count)

export default router