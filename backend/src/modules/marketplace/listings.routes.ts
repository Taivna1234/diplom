import { Router } from "express"
import { ListingsController } from "./listings.controller"
import { authMiddleware } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate"
import { createListingSchema } from "../../schemas"

const router = Router()

router.post( "/",           authMiddleware, validate(createListingSchema), ListingsController.create)
router.get(  "/",           ListingsController.getAll)
router.get(  "/book/:bookId", ListingsController.getByBook)
router.patch("/:id/close",  authMiddleware, ListingsController.close)

export default router
