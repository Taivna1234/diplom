import { Router } from "express"
import { AIController } from "./ai.controller"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate"
import { aiLimiter } from "../../middleware/rateLimiter"
import { askQuestionSchema, summaryByTitleSchema } from "../../schemas"

const router = Router()

router.get( "/book-summary/:bookId", aiLimiter, AIController.getSummary)
router.post("/summary-by-title",     aiLimiter, validate(summaryByTitleSchema), AIController.getSummaryByTitle)
router.post("/book-question",        aiLimiter, authMiddleware, validate(askQuestionSchema), AIController.askQuestion)
router.get( "/recommendations",      authMiddleware, AIController.getRecommendations)

export default router
