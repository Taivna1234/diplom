import { Router } from "express"
import { PostsController } from "./posts.controller"
import { authMiddleware } from "../../../middleware/auth.middleware"
import { validate } from "../../../middleware/validate"
import { createPostSchema } from "../../../schemas"

const router = Router()

router.post("/",           authMiddleware, validate(createPostSchema), PostsController.create)
router.get( "/",           PostsController.getAll)
router.get( "/book/:bookId", PostsController.getByBook)

export default router
