import { Router } from "express"
import { BooksController } from "./books.controller"
import { validate } from "../../middleware/validate"
import { searchLimiter } from "../../middleware/rateLimiter"
import { searchQuerySchema } from "../../schemas"

const router = Router()

router.get("/search", searchLimiter, validate(searchQuerySchema, "query"), BooksController.search)
router.get("/:id",    BooksController.getById)

export default router
