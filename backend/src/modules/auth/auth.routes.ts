import { Router } from "express"
import { AuthController } from "./auth.controller"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate"
import { authLimiter } from "../../middleware/rateLimiter"
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../schemas"

const router = Router()
const controller = new AuthController()

router.post("/register",       authLimiter, validate(registerSchema),       controller.register)
router.post("/login",          authLimiter, validate(loginSchema),           controller.login)
router.post("/logout",         controller.logout)
router.get( "/me",             authMiddleware, controller.me)
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), controller.forgotPassword)
router.post("/reset-password",  authLimiter, validate(resetPasswordSchema),  controller.resetPassword)

export default router
