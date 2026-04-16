import { Router } from "express"
import { RecommendationController } from "./recommendation.controller"
import { authMiddleware } from "../../middleware/auth.middleware"

const router = Router()

router.get("/trending", RecommendationController.trending)
router.get("/personal", authMiddleware, RecommendationController.personal)
export default router