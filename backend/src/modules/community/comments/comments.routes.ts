import { Router } from "express"
import { CommentsController } from "./comments.controller"
import { authMiddleware } from "../../../middleware/auth.middleware"
import { validate } from "../../../middleware/validate"
import { createCommentSchema } from "../../../schemas"

const router = Router()

router.post("/",           authMiddleware, validate(createCommentSchema), CommentsController.create)
router.get( "/:postId",    CommentsController.getByPost)

export default router
