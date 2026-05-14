import { Router } from "express"
import { BooksController } from "./books.controller"
import { validate } from "../../middleware/validate"
import { authMiddleware } from "../../middleware/auth.middleware"
import { searchLimiter } from "../../middleware/rateLimiter"
import { createManualBookSchema, searchQuerySchema } from "../../schemas"

const router = Router()

router.get("/search", searchLimiter, validate(searchQuerySchema, "query"), BooksController.search)
router.post("/manual", authMiddleware, validate(createManualBookSchema), BooksController.createManual)
router.get("/:id",    BooksController.getById)

export default router
