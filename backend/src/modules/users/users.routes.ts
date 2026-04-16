import { Router } from "express"
import { UsersController } from "./users.controller"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate"
import { updateProfileSchema, changePasswordSchema } from "../../schemas"

const router = Router()

router.get( "/me",       authMiddleware, UsersController.me)
router.put( "/profile",  authMiddleware, validate(updateProfileSchema),  UsersController.update)
router.put( "/password", authMiddleware, validate(changePasswordSchema), UsersController.changePassword)
router.get( "/posts",    authMiddleware, UsersController.myPosts)

export default router
