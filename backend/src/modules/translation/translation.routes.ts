import { Router } from "express"
import { TranslationController } from "./translation.controller"
import { validate } from "../../middleware/validate"
import { generalLimiter } from "../../middleware/rateLimiter"
import { translateSchema } from "../../schemas"

const router = Router()
const controller = new TranslationController()

router.post("/", generalLimiter, validate(translateSchema), controller.translate)

export default router
